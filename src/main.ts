import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as fs from 'fs';
import { HttpExceptionFilter } from './shared/middleware/http-exception.filter';
import { ValidationPipe } from './shared/validation/validationPipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    snapshot: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port:  ${process.env.PORT ?? 3000}`);
  });
}

bootstrap().catch((err) => {
  // fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
