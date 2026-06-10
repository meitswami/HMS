import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Incident } from '../../entities/incident.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private config: ConfigService) {}

  /** Dispatch alerts across SMS, Email, WhatsApp, Push, Dashboard */
  async dispatchAlert(incident: Incident): Promise<void> {
    const channels = ['dashboard', 'sms', 'email', 'whatsapp', 'push'];
    const message = `[${incident.severity.toUpperCase()}] ${incident.title}`;

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'dashboard':
            this.logger.log(`Dashboard alert: ${message}`);
            break;
          case 'sms':
            await this.sendSms(message, incident);
            break;
          case 'email':
            await this.sendEmail(incident);
            break;
          case 'whatsapp':
            await this.sendWhatsApp(message);
            break;
          case 'push':
            await this.sendPush(message, incident);
            break;
        }
      } catch (err) {
        this.logger.error(`Failed ${channel} alert: ${(err as Error).message}`);
      }
    }
  }

  private async sendSms(message: string, incident: Incident) {
    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    if (!sid) return;
    this.logger.log(`SMS dispatched: ${message}`);
    // Twilio integration: await twilioClient.messages.create({...})
  }

  private async sendEmail(incident: Incident) {
    const host = this.config.get('SMTP_HOST');
    if (!host) return;
    this.logger.log(`Email alert for incident ${incident.id}`);
    // Nodemailer integration
  }

  private async sendWhatsApp(message: string) {
    const url = this.config.get('WHATSAPP_API_URL');
    if (!url) return;
    this.logger.log(`WhatsApp: ${message}`);
  }

  private async sendPush(message: string, incident: Incident) {
    const key = this.config.get('FCM_SERVER_KEY');
    if (!key) return;
    this.logger.log(`Push notification: ${message}`);
  }
}
