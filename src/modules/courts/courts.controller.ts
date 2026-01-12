import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CourtsService } from './courts.service';

@Controller('courts')
export class CourtsController {
  private readonly courtServices: CourtsService;
  constructor() {
    this.courtServices = new CourtsService();
  }

  @Get()
  async getAllCourts(@Res() res: Response) {
    const courts = await this.courtServices.getAllCourts();
    res.json({ courts });
  }
}
