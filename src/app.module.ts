import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CourtsModule } from './modules/courts/courts.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { CatergoriesModule } from './modules/categoires/categories.module';
import { AmentitiesModule } from './modules/amentites/amentities.module';
import { PrismaModule } from './shared/config/Prisma/prisma.modules';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './shared/validation/validationPipe';
import { HttpExceptionFilter } from './shared/middleware/http-exception.filter';
import { ResponseInterceptor } from './shared/middleware/response.interceptor';
import { BookingsModule } from './modules/bookings/bookings.module';
import { UsersModule } from './modules/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MailerModule.forRoot({
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    CourtsModule,
    CatergoriesModule,
    AmentitiesModule,
    BookingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'courts', method: RequestMethod.GET });
  }
}
