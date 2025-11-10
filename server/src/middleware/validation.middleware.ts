import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../types';
import { errorResponse } from '../utils/response';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[source];
      
      // Validate data against schema
      const validated = await schema.parseAsync(dataToValidate);
      
      // Replace request data with validated data (this ensures type safety)
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const errors: Record<string, string[]> = {};
        
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        const response = errorResponse(
          'Validation failed',
          'Invalid request data',
          errors
        );

        res.status(400).json(response);
        return;
      }

      next(new AppError('Validation error', 400));
    }
  };
};

/**
 * Sanitize request body
 * Removes potentially dangerous characters
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Remove script tags and other potentially dangerous content
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }
  next();
};
