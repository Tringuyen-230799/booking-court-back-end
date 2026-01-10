import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourtsModule } from './courts/courts.module';

@Module({
  imports: [CourtsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
