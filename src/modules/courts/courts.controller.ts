import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CourtsService } from './courts.service';
import { QueryCourtsSchema } from './courts.schema';
import { convertCourtQueryList } from './helpers';
import { CatergoryServices } from 'src/shared/services/catergory.services';
import { AmentityServices } from 'src/shared/services/amentites.services';

@Controller('courts')
export class CourtsController {
  private readonly courtServices: CourtsService;
  private readonly categoryServices: CatergoryServices;
  private readonly amentityServices: AmentityServices;

  constructor() {
    this.courtServices = new CourtsService();
    this.categoryServices = new CatergoryServices();
    this.amentityServices = new AmentityServices();
  }

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
}
