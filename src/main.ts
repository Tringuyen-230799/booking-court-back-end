import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port:  ${process.env.PORT ?? 3000}`);
  });
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
