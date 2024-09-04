import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import Optimize, { ImageFormat } from './lib/Optimize';
import { join } from 'path';
import { UserDataController } from './lib/UserData';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import Background from './lib/Background';
import Puzzle from './lib/Puzzle';
const config = require("../config.json");

let fileList: Array<string>;

Optimize.dir({
  forceCleanCache: config.forceCleanOpimizedImageCache,
  outputFormat: ImageFormat.JPEG,
  inputDirectory: join(__dirname, "../public/backgrounds/source/"),
  outputDirectory: join(__dirname, "../public/backgrounds/optimized/"),
  outputWidth: 480,
  outputHeight: 280,
  outputQuality: 40,
}).then((list) => {
  fileList = list;
});


@Injectable()
export class AppService {
  constructor(private userService: UserDataController,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

  ) {

  }


  async initialize(req: Request) {
    try {
      const { key } = await this.userService.getOrSetUserData({
        req,
        fileList,
        config: { ...config },
      });
      const userdataJSON = await this.cacheManager.get(key);
      if (userdataJSON) {
        return { status: "initialized" };
      } else {
        throw new InternalServerErrorException()
      }
    } catch (e) {
      throw e;
    }

  }
  async challange(req: Request) {
    try {
      const { challenges } = await this.userService.getOrSetUserData({
        req,
        fileList,
        config: { ...config },
      });
      return challenges;
    } catch (e) {
      throw e;
    }
  }
  async verify(req: Request) {
    try {
      const { response } = req.body;
      const { apiKey } = req.query;

      if (!(apiKey && response)) {
        throw new UnauthorizedException();
      }

      if (apiKey !== config.apiKey) {
        throw new ForbiddenException();
      }

      const { x, y, answers } = response;
      const {
        challenges,
        positionX,
        positionY,
        key
      } = await this.userService.getOrSetUserData({
        req,
        fileList,
        config: { ...config }
      });

      await this.cacheManager.del(key);

      if (this.distance2d(+x, positionX, +y, positionY) > config.maxDistance) {
        throw new BadRequestException();
      }

      if (answers.length !== challenges.length) {
        throw new BadRequestException();
      }

      const answerChallenges = answers.map(answer => {
        return answer.challenge;
      })

      for (const challenge of challenges) {
        if (answerChallenges.indexOf(challenge) < 0) {
          throw new BadRequestException();
        }
      }

      for (const answer of answers) {
        const hash = createHash('sha256').update(answer.prefix + answer.challenge).digest('hex');
        if (!hash.startsWith('0'.repeat(config.leadingZerosLength))) {
          throw new BadRequestException();
        }
      }

      return;
    } catch (e) {
      throw e;
    }
  }
  async background(req: Request, res: Response) {
    try {
      const { backgroundPath,
        backgroundPuzzlePath,
        positionX,
        positionY
      } = await this.userService.getOrSetUserData({
        req,
        fileList,
        config: { ...config }
      });

      const background = new Background(backgroundPath);
      const backgroundBuffer = await background.compositePuzzle({
        compositeFilepath: backgroundPuzzlePath,
        outputQuality: config.backgroundQuality,
        left: positionX,
        top: positionY,
        outputFormat: ImageFormat.JPEG,
      });

      res.setHeader('Content-Type', 'image/jpeg');
      return res.send(backgroundBuffer);
    } catch (e) {
      throw e;
    }
  }
  async puzzle(req: Request, res: Response) {
    try {
      const {
        backgroundPath,
        clientPuzzlePath,
        positionX,
        positionY
      } = await this.userService.getOrSetUserData({
        req,
        fileList,
        config: { ...config }
      });

      const puzzle = new Puzzle(clientPuzzlePath);
      const puzzleBuffer = await puzzle.compositeBackground({
        compositeFilepath: backgroundPath,
        left: positionX,
        top: positionY,
        outputQuality: config.backgroundQuality,
        outputFormat: ImageFormat.PNG,
        puzzleWidth: config.puzzleWidth,
        puzzleHeight: config.puzzleHeight,
      });

      res.set('Content-Type', 'image/png');
      return res.send(puzzleBuffer);
    } catch (e) {
      throw e;
    }
  }

  distance2d(x, positionX: number, y, positionY: number) {
    return Math.sqrt(Math.pow(x - positionX, 2) + Math.pow(y - positionY, 2));
  }

}
