import { Global, Module } from '@nestjs/common';
import { AmentitiesServices } from './amentities.services';

@Global()
@Module({
  exports: [AmentitiesServices],
  providers: [AmentitiesServices],
})
export class AmentitiesModule {}
