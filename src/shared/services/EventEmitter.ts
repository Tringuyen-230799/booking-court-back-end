import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NodeMailerService } from './NodeMailer';
import type { ISendMailOptions } from '@nestjs-modules/mailer';

@Injectable()
export class EventEmitterService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly nodeMailerService: NodeMailerService,
  ) {}

  @OnEvent('sendEmail')
  async handleVerifyBooking(data: ISendMailOptions) {
    try {
      await this.nodeMailerService.sendVerificationBooking(data);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  sendVerificationBooking(payload: ISendMailOptions) {
    this.eventEmitter.emit('sendEmail', payload);
  }
}
