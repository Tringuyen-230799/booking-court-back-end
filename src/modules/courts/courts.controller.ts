import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CourtsService } from './courts.service';
import { QueryCourtsSchema } from './courts.schema';
import { convertCourtQueryList } from './helpers';
import { CatergoriesServices } from 'src/modules/categoires/catergories.services';
import { AmentitiesServices } from 'src/modules/amentites/amentities.services';

@Controller('courts')
export class CourtsController {
  constructor(
    private courtServices: CourtsService,
    private categoryServices: CatergoriesServices,
    private amentityServices: AmentitiesServices,
  ) {}

  @Get()
  async getAllCourts(
    @Req() req: Request<unknown, unknown, unknown, QueryCourtsSchema>,
    @Res() res: Response,
  ) {
    const query = req.query;

    const queryParsed: QueryCourtsSchema = convertCourtQueryList(query);

    const courts = await this.courtServices.getAllCourts(queryParsed);

    res.json({ data: courts });
  }

  @Get('categories')
  async getAllCategories(@Res() res: Response) {
    const categories = await this.categoryServices.getAllCategories();

    res.json({ data: categories });
  }

  @Get('amenities')
  async getAllAmenities(@Res() res: Response) {
    const amenities = await this.amentityServices.getAllAmenities();

    res.json({ data: amenities });
  }

  @Get(':id')
  async getCourtById(@Param('id') id: string, @Res() res: Response) {
    const court = await this.courtServices.getCourtById(id);

    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    res.json({ court });
  }
}
