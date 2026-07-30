import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (targets: ValidationTargets | ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('parseAsync' in targets && typeof targets.parseAsync === 'function') {
        // If passed a single Zod schema, assume it targets req.body
        req.body = await (targets as ZodSchema).parseAsync(req.body);
      } else {
        const { body, query, params } = targets as ValidationTargets;
        if (body) req.body = await body.parseAsync(req.body);
        if (query) req.query = await query.parseAsync(req.query);
        if (params) req.params = await params.parseAsync(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Input validation failed. Please check the supplied parameters.',
          details: formattedErrors,
        });
        return;
      }
      next(err);
    }
  };
};
