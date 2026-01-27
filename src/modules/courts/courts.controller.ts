import { Controller, Get, Param, Query } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { QueryCourtsSchema } from './courts.schema';
import { convertCourtQueryList } from './helpers';
import { CatergoriesServices } from 'src/modules/categoires/catergories.services';
import { AmentitiesServices } from 'src/modules/amentites/amentities.services';
import { NotFoundException } from 'src/shared/middleware/http-exception.filter';

@Controller('courts')
export class CourtsController {
  constructor(
    private courtServices: CourtsService,
    private categoryServices: CatergoriesServices,
    private amentityServices: AmentitiesServices,
  ) {}

  @Get()
  async getAllCourts(@Query() query: QueryCourtsSchema) {
    const queries = query;

    const queryParsed: QueryCourtsSchema = convertCourtQueryList(queries);

    const courts = await this.courtServices.getAllCourts(queryParsed);

    return courts;
  }

  @Get('categories')
  async getAllCategories() {
    const categories = await this.categoryServices.getAllCategories();

    return categories;
  }

  @Get('amenities')
  async getAllAmenities() {
    const amenities = await this.amentityServices.getAllAmenities();

    return amenities;
  }

  @Get(':id')
  async getCourtById(@Param('id') id: string) {
    const court = await this.courtServices.getCourtById(id);

    if (!court) throw new NotFoundException('court not found');

    return court;
  }
}
