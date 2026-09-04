import { timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const configuredApiKey = process.env.COMMISSION_QUOTE_API_KEY;

if (!configuredApiKey) {
    throw new Error('COMMISSION_QUOTE_API_KEY environment variable is not set');
}

const apiKey = configuredApiKey;

function hasValidApiKey(providedApiKey: string): boolean {
    const expected = Buffer.from(apiKey);
    const provided = Buffer.from(providedApiKey);

    return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    const providedApiKey = req.header('X-API-Key');
    
    if (!providedApiKey || !hasValidApiKey(providedApiKey)) {
        console.warn(`[auth] Rejected ${req.method} ${req.originalUrl}: ${providedApiKey ? 'invalid API key' : 'missing API key'}`);
        return res.status(401).send({ msg: 'Invalid API key' });
    }

    console.info(`[auth] Accepted ${req.method} ${req.originalUrl}`);
    next();
}
