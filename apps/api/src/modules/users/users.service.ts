import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/user.dto';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, tenantId: string) {
    const user = this.userRepo.create({
      ...dto,
      tenantId,
      passwordHash: await bcrypt.hash(dto.password, 12),
    });
    return this.userRepo.save(user);
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { page: safePage, limit: safeLimit, skip } = getPagination(page, limit);
    const [data, total] = await this.userRepo.findAndCount({
      where: { tenantId },
      relations: ['role'],
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });
    return { data, meta: { page: safePage, limit: safeLimit, total } };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, mfaSecret, ...safe } = user;
    return safe;
  }
}
