import { z } from "zod";


export const createUpdateProvincealidator = (data: any) => {
  const schema = z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name should be a type of 'String'",
      })
      .min(1, "Name should have a minimum length of 1"),
    isActive: z.boolean(),
    description: z
      .string({
        invalid_type_error: "Description should be a type of 'String'",
      })
      .min(10, "Description should have a minimum length of 10").optional(),
  });

  return schema.safeParse(data);
};
