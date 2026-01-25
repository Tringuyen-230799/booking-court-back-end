import { Module } from '@nestjs/common';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { CatergoriesServices } from 'src/modules/categoires/catergories.services';
import { AmentitiesServices } from 'src/modules/amentites/amentities.services';

@Module({
  imports: [CatergoriesServices, AmentitiesServices],
  controllers: [CourtsController],
  providers: [CourtsService],
})
export class CourtsModule {}
