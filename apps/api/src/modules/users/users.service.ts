import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/user.dto';

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

  async findAll(tenantId: string, page = 1, limit = 20) {
    const [data, total] = await this.userRepo.findAndCount({
      where: { tenantId },
      relations: ['role'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
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
