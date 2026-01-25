import { NestFactory, PartialGraphHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    snapshot: true,
  });
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });
  app.useGlobalPipes();

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port:  ${process.env.PORT ?? 3000}`);
  });
}
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
