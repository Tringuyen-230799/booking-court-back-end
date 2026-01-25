import { Global, Module } from '@nestjs/common';
import { CatergoriesServices } from './catergories.services';

@Global()
@Module({
  exports: [CatergoriesServices],
  providers: [CatergoriesServices],
})
export class CatergoriesModule {}
