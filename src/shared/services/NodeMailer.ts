import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NodeMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationBooking(payload: ISendMailOptions): Promise<void> {
    await this.mailerService.sendMail(payload);
  }
}
