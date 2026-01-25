import { Module } from '@nestjs/common';
import { AmentitiesServices } from './amentities.services';

@Module({
  exports: [AmentitiesServices],
  providers: [AmentitiesServices],
})
export class AmentitiesModule {}
