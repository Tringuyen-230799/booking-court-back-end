import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CourtsService } from './courts.service';
import { QueryCourtsSchema } from './courts.schema';

@Controller('courts')
export class CourtsController {
  private readonly courtServices: CourtsService;
  constructor() {
    this.courtServices = new CourtsService();
  }

  @Get()
  async getAllCourts(
    @Req() req: Request<unknown, unknown, unknown, QueryCourtsSchema>,
    @Res() res: Response,
  ) {
    const query = req.query;
    const courts = await this.courtServices.getAllCourts(query);

    res.json({ courts });
  }
}
