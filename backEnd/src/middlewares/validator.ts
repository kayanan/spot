import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/utils/common.util';

const zodValidator =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const zodResponse = schema.safeParse(req.body);

    if (!zodResponse.success) {
      let errorMsg = '';
      zodResponse.error.issues.forEach(
        ({ message }, index, array) => {
          errorMsg += message;
          if (index !== array.length - 1) {
            errorMsg += ', ';
          }
        }
      );
      return res.status(400).json(errorResponse(errorMsg));
    }
    req.body = zodResponse.data;
    next();
  };
export default zodValidator;
