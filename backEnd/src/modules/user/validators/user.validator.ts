import { z } from 'zod';
import { Types } from 'mongoose';
const phoneNumberPattern =
 /^07[01245678][0-9]{7}$/;
const nicPattern = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const addressPattern = /^[a-zA-Z0-9\s]+$/;
const expiryDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
const cvvPattern = /^[0-9]{3}$/;
const cardNumberPattern = /^[0-9]{16}$/;
const zipCodePattern = /^[0-9]{5}$/;
const loginValidator = (data: any) => {
  const schema = z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: `Email should be a type of 'string'`,
      }).email({
        message: 'Email should be a valid email',
      })
      .nonempty({
        message: 'Email cannot be an empty field ',
      }),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: `Password should be a type of 'string'`,
      })
      .regex(
        new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
        {
          message:
            'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number',
        }
      )
      .nonempty({
        message: 'Password cannot be an empty field ',
      }),
  });
  return schema.safeParse(data);
};

const resetPasswordValidator = (data: any) => {
  const schema = z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: `Email should be a type of 'string'`,
      }).email({
        message: 'Email should be a valid email',
      })
      .nonempty({
        message: 'Email cannot be an empty field ',
      }),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: `Password should be a type of 'string'`,
      })
      .regex(
        new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
        {
          message:
            'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number',
        }
      )
      .nonempty({
        message: 'Password cannot be an empty field ',
      }),
    otp: z
      .string({
        required_error: 'OTP is required',
        invalid_type_error: `OTP should be a type of 'string'`,
      })
      .max(4, {
        message: 'Maximum length of OTP is 4',
      }),
  });
  return schema.safeParse(data);
};

const saveUserValidator = (data: any) => {
  const schema = z.object({
    role: z.array(z.string({
      required_error: 'Role is required',
    })),
    firstName: z
      .string({
        required_error: 'FirstName is required',
        invalid_type_error: `FirstName should be a type of 'string'`,
      })
      .max(30, {
        message: `FirstName should have a maximum length of 30 characters`,
      }),
    lastName: z
      .string({
        required_error: 'LastName is required',
        invalid_type_error: `LastName should be a type of 'string'`,
      })
      .max(30, {
        message: `LastName should have a maximum length of 30 characters`,
      }),
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: `Email should be a type of 'string'`,
      })
      .nonempty({
        message: 'Email cannot be an empty field ',
      })
      .email({
        message: 'Email should be a valid email',
      }).optional().nullable(),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: `Password should be a type of 'string'`,
      })
      .regex(
        new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
        {
          message:
            'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number',
        }
      )
      .nonempty({
        message: 'Password cannot be an empty field ',
      }).optional().nullable(),
    phoneNumber: z
      .string({
        required_error: 'PhoneNumber is required',
        invalid_type_error: `PhoneNumber should be a type of 'string'`,
      })
      .regex(phoneNumberPattern, {
        message: `Phone number should have a maximum length of 10 digits`,
      }),
      nic: z.string({
        required_error: 'NIC is required',
        invalid_type_error: `NIC should be a type of 'string'`,
      }).regex(nicPattern, {
        message: `NIC should have a maximum length of 12 digits`,
      }),
  });
  return schema.safeParse(data);
};

const updateUserValidator = (data: any) => {
  const schema = z.object({
    firstName: z
      .string({
        required_error: 'FirstName is required',
        invalid_type_error: `FirstName should be a type of 'string'`,
      })
      .max(30, {
        message: `FirstName should have a maximum length of 30 characters`,
      }),
    lastName: z
      .string({
        required_error: 'LastName is required',
        invalid_type_error: `LastName should be a type of 'string'`,
      })
      .max(30, {
        message: `LastName should have a maximum length of 30 characters`,
      }),
    phoneNumber: z
      .string({
        required_error: 'Phonenumber is required',
        invalid_type_error: `Phonenumber should be a type of 'string'`,
      })
      .regex(phoneNumberPattern, {
        message: `Phone number should have a maximum length of 10 digits`,
      }),
    nic: z.string({
      required_error: 'NIC is required',
      invalid_type_error: `NIC should be a type of 'string'`,
    }).regex(nicPattern, {
      message: `NIC should have a maximum length of 12 digits`,
    }),
    email: z.string({
      required_error: 'Email is required',
      invalid_type_error: `Email should be a type of 'string'`,
    }).email({
      message: 'Email should be a valid email',
    }),
    profileImage: z.string().optional().nullable(),
    address: z.object({
      line1: z.string({
        required_error: 'Address1 is required',
        invalid_type_error: `Address1 should be a type of 'string'`,
      }),
      line2: z.string({
       
        invalid_type_error: `Address2 should be a type of 'string'`,
      }).optional().nullable(),
      city: z.any({
        required_error: 'City is required', 
      }).refine((val) =>  Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for city',
      }),
      district: z.any({
        required_error: 'District is required',
      }).refine((val) =>  Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for district',
      }),
      province: z.any({
        required_error: 'Province is required',
      }).refine((val) =>  Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for province',
      }),
      zipCode: z.string({
        invalid_type_error: `ZipCode should be a type of 'string'`,
      }).optional().nullable(),
    }).optional().nullable(),
    bankDetails: z.array(
      z.object({
        name: z
          .string({
            required_error: 'Name is required',
            invalid_type_error: `Name should be a type of 'string'`,
          })
          .nonempty({
            message: 'Name cannot be an empty field ',
          }),
        branch: z
          .string({
            required_error: 'Branch is required',
            invalid_type_error: `Branch should be a type of 'string'`,
          })
          .nonempty({
            message: 'Branch cannot be an empty field ',
          }),
        accountNo: z
          .string({
            required_error: 'AccountNo is required',
            invalid_type_error: `AccountNo should be a type of 'string'`,
          })
          .nonempty({
            message: 'AccountNo cannot be an empty field ',
          }),
        accountHolderName: z
          .string({
            required_error: 'AccountHolderName is required',
            invalid_type_error: `AccountHolderName should be a type of 'string'`,
          })
          .nonempty({
            message: 'AccountHolderName cannot be an empty field ',
          }),
        isDefault: z.boolean({
          required_error: 'IsDefault is required',
          invalid_type_error: `IsDefault should be a type of 'boolean'`,
        }),
      })
    ).optional().nullable(),
    cardDetails: z.array(
      z.object({
        nameOnCard: z.string(
          {
            required_error: 'NameOnCard is required',
            invalid_type_error: `NameOnCard should be a type of 'string'`,
          }
        ),
        cardNumber: z.string(
          {
            required_error: 'CardNumber is required',
            invalid_type_error: `CardNumber should be a type of 'string'`,
          }
        ),
        expiryDate: z.string(
          {
            required_error: 'ExpiryDate is required',
            invalid_type_error: `ExpiryDate should be a type of 'string'`,
          }
        ).regex(expiryDatePattern, {
          message: `ExpiryDate should be in the format MM/YY`,
        }),
        cvv: z.string(
          {
            required_error: 'CVV is required',
            invalid_type_error: `CVV should be a type of 'string'`,
          }
        ).regex(cvvPattern, {
          message: `CVV should have a maximum length of 3 digits`,
        }),
        
      })
    ).optional().nullable(),
    vehicleDetails: z.array(
      z.object({
        number: z.string(
          {
            required_error: 'Number is required',
            invalid_type_error: `Number should be a type of 'string'`,
          }
        ),
        isDefault: z.boolean().optional().nullable(),
      })
    ).optional().nullable(),
  });
  return schema.safeParse(data);
};

const adminUpdateUserValidator = (data: any) => {
  const schema = z.object({
    role: z.array(z.string({
      required_error: 'Role is required',
    })).optional().nullable(),
    firstName: z
      .string({
        required_error: 'FirstName is required',
        invalid_type_error: `FirstName should be a type of 'string'`,
      })
      .max(30, {
        message: `FirstName should have a maximum length of {#limit}`,
      }).optional().nullable(),
    lastName: z
      .string({
        required_error: 'LastName is required',
        invalid_type_error: `LastName should be a type of 'string'`,
      })
      .max(30, {
        message: `LastName should have a maximum length of {#limit}`,
      }).optional().nullable(),
    phoneNumber: z
      .string({
        required_error: 'Phonenumber is required',
        invalid_type_error: `Phonenumber should be a type of 'string'`,
      })
      .regex(phoneNumberPattern, {
        message: `Phone number should have a maximum length of 10 digits`,
      }).optional().nullable(),
  
    address: z.object({
      line1: z.string(
        {
          required_error: 'Address1 is required',
          invalid_type_error: `Address1 should be a type of 'string'`,
        }
      ),
      line2: z.string(
        {
          invalid_type_error: `Address2 should be a type of 'string'`,
        }
      ).optional().nullable(),
      city: z.string(
        {
          required_error: 'City is required',
          invalid_type_error: `City should be a type of 'string'`,
        }
      ).refine((val) =>  Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for city',
      }),
      district: z.string(
        {
          required_error: 'District is required',
          invalid_type_error: `District should be a type of 'string'`,
        }
      ).refine((val) =>  Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for district',
      }),
      province: z.string(
        {
          required_error: 'Province is required',
          invalid_type_error: `Province should be a type of 'string'`,
        }
      ).refine((val) =>  Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId for province',
      }),
      zipCode: z.string(
        {
          invalid_type_error: `ZipCode should be a type of 'string'`,
        }

      ).regex(zipCodePattern, {
        message: `ZipCode should have a maximum length of 5 digits`,
      }).optional().nullable(),
    }).optional().nullable(),
    profileImage: z.string(
      {
        invalid_type_error: `ProfileImage should be a type of 'string'`,
      }
    ).optional().nullable(),
    bankDetails: z.array(
      z.object({
        name: z
          .string({
            required_error: 'Name is required',
            invalid_type_error: `Name should be a type of 'string'`,
          })
          .nonempty({
            message: 'Name cannot be an empty field ',
          }),
        branch: z
          .string({
            required_error: 'Branch is required',
            invalid_type_error: `Branch should be a type of 'string'`,
          })
          .nonempty({
            message: 'Branch cannot be an empty field ',
          }),
        accountNo: z
          .string({
            required_error: 'AccountNo is required',
            invalid_type_error: `AccountNo should be a type of 'string'`,
          })
          .nonempty({
            message: 'AccountNo cannot be an empty field ',
          }),
        accountHolderName: z
          .string({
            required_error: 'AccountHolderName is required',
            invalid_type_error: `AccountHolderName should be a type of 'string'`,
          })
          .nonempty({
            message: 'AccountHolderName cannot be an empty field ',
          }),
        isDefault: z.boolean({
          required_error: 'IsDefault is required',
          invalid_type_error: `IsDefault should be a type of 'boolean'`,
        }),
      })
    ).optional().nullable(),
    cardDetails: z.array(
      z.object({
        nameOnCard: z
          .string({
            required_error: 'Name is required',
            invalid_type_error: `Name should be a type of 'string'`,
          })
          .nonempty({
            message: 'Name cannot be an empty field ',
          }),
        cardNumber: z
          .string({
            required_error: 'Card Number is required',
            invalid_type_error: `Card Number should be a type of 'string'`,
          })
          .nonempty({
            message: 'Card Number cannot be an empty field ',
          }).regex(cardNumberPattern, {
            message: `Card Number should have a maximum length of 16 digits`,
          }),
        expiryDate: z
          .string({
            required_error: 'Expiry Date is required',
            invalid_type_error: `Expiry Date should be a type of 'string'`,
          })
          .nonempty({
            message: 'Expiry Date cannot be an empty field ',
          }).regex(expiryDatePattern, {
            message: `Expiry Date should be in the format MM/YY`,
          }),
        cvv: z
          .string({
            required_error: 'CVV is required',
            invalid_type_error: `CVV should be a type of 'string'`,
          })
          .nonempty({
            message: 'CVV cannot be an empty field ',
          }).regex(cvvPattern, {
            message: `CVV should have a maximum length of 3 digits`,
          }),
          isDefault: z.boolean({
          required_error: 'IsDefault is required',
          invalid_type_error: `IsDefault should be a type of 'boolean'`,
        }),

      })
    ).optional().nullable(),
    vehicleDetails: z.array(
      z.object({
        number: z.string(
          {
            required_error: 'Number is required',
            invalid_type_error: `Number should be a type of 'string'`,
          }
        ),
        isDefault: z.boolean().optional().nullable(),
      })
    ).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
    approvalStatus: z.boolean().optional().nullable(),
    isDeleted: z.boolean().optional().nullable(),
    otp: z.string().optional().nullable(),
    otpExpiresAt: z.date().optional().nullable(),
  });
  return schema.safeParse(data);
};

export default {
  loginValidator,
  resetPasswordValidator,
  saveUserValidator,
  updateUserValidator,
  adminUpdateUserValidator,
};
