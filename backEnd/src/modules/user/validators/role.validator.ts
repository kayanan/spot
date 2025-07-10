import { z } from 'zod';

const createUpdateRoleValidator = (data: any) => {
  const schema = z.object({

    type: z
      .string({
        required_error: 'Type is required',
      }).regex(/^[A-Za-z]+[A-Za-z_ ]*[A-Za-z]+$/, {
        message: 'Type should only contain alphabets and underscores',
      }).max(20, {
        message: 'Type should have a maximum length of {#limit}',
      }).toUpperCase().transform((val) => {
        if (val.includes(' ') && !val.includes('_')) {
          return val.split(' ').join('_');
        }
        else if (val.includes('_') && val.includes(' ')) {
          return val.trim();
        }
        else {
          return val;
        }
      }),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  });
  return schema.safeParse(data);
};

export default {
  createUpdateRoleValidator,
};
