import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
// import * as fs from 'fs';

async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      abortOnError: false,
      snapshot: true,
      bodyParser: true,
    });

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  app.useBodyParser('json', {
    limit: '10mb',
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
