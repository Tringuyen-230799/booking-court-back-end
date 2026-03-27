import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { CourtsModule } from '../courts/courts.module';
import { UsersModule } from '../users/users.module';
import { EventEmitterService } from 'src/shared/services/EventEmitter';
import { NodeMailerService } from 'src/shared/services/NodeMailer';

@Module({
  imports: [CourtsModule, UsersModule],
  controllers: [BookingsController],
  providers: [BookingsService, EventEmitterService, NodeMailerService],
})
export class BookingsModule {}
