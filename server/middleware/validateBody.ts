import type { Request, Response, NextFunction } from 'express';

export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter((f) => req.body[f] == null);
    if (missing.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
      return;
    }
    next();
  };
}
