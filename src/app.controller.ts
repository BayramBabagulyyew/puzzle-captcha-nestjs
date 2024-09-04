import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('init')
  init(
    @Req() req: Request
  ) {
    return this.appService.initialize(req);
  }
  @Get('challenge')
  challange(
    @Req() req: Request
  ) {
    return this.appService.challange(req);
  }
  @Post('verify')
  verify(
    @Req() req: Request
  ) {
    return this.appService.verify(req);
  }
  @Get('bg.jpeg')
  background(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.appService.background(req, res);
  }
  @Get('puzzle.png')
  puzzle(
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.appService.puzzle(req, res);
  }

}
