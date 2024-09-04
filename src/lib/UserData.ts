import { UserDataResponse } from "../models/UserDataResponse";
import { UserDataRequest } from "../models/UserDataRequest";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

const path = require("path");
const { getClientIp } = require("request-ip");
const crypto = require("crypto");

export class UserDataController {

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }



  async getOrSetUserData(
    userDataRequest: UserDataRequest
  ): Promise<UserDataResponse> {
    const { req, fileList, config } = userDataRequest;

    let userData: UserDataResponse | null;

    const clientIp = getClientIp(req);
    const key = crypto.createHash("md5").update(clientIp).digest("hex");


    const userDataJSON: string = await this.cacheManager.get(key);
    if (userDataJSON) {
      //
      userData = JSON.parse(userDataJSON);
    } else {
      await this.cacheManager.del(key);
      const imageIndex = this.getRandomFileIndex(fileList);
      const challenges = this.getRandomChallenges(
        config.challengeCount,
        config.challengeLength
      );

      userData = {
        backgroundPath: path.join(
          __dirname,
          "../../",
          config.backgroundImagesPath,
          fileList[imageIndex]
        ),
        backgroundPuzzlePath: path.join(
          __dirname,
          "../../",
          config.backgroundPuzzlePath
        ),
        clientPuzzlePath: path.join(
          __dirname,
          "../../",
          config.clientPuzzlePath
        ),
        positionX: this.getRandomPuzzlePosition(0, 480, config.puzzleWidth),
        positionY: this.getRandomPuzzlePosition(32, 248, config.puzzleHeight),
        challenges,
        key,
      };

      await this.cacheManager.set(key, JSON.stringify(userData), config.maxTTL);
    }

    return userData;
  }

  getRandomPuzzlePosition(
    min: number,
    max: number,
    puzzleSize: number
  ) {
    return (
      Math.round(Math.random() * (max - puzzleSize - (min + puzzleSize))) +
      min +
      puzzleSize
    );
  }

  getRandomChallenges(
    challengeCount: number,
    challengeLength: number
  ) {
    const challenges = [];
    for (let i = 0; i < challengeCount; i++) {
      challenges.push(crypto.randomBytes(challengeLength).toString("base64"));
    }
    return challenges;
  }
  getRandomFileIndex(files: string[]) {
    return Math.floor(Math.random() * files.length);
  }

}
