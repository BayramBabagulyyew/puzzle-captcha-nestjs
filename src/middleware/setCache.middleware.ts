import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CacheControlMiddleware implements NestMiddleware {
    constructor(private readonly timeout: number) { }

    use(req: Request, res: Response, next: NextFunction) {
        req.setTimeout(this.timeout);
        res.set(
            'Cache-Control',
            'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
        );
        next();
    }
}
