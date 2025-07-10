import ejs from 'ejs';
import nodemailer, { TransportOptions } from 'nodemailer';
import { EmailModel } from '../data/dtos/email.dto';
import { EmailTemplateType } from '@/modules/base/enums/email.template.type';

import sgMail from '@sendgrid/mail';

let transporter: any;

export async function send(
  to: string,
  type: EmailTemplateType,
  data?: any
): Promise<boolean> {
  if (process.env.NODE_ENV != 'local') {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    } as TransportOptions);
  }
  try {
    const email = {
      to: to,
      from: process.env.FROM_EMAIL,
    } as EmailModel;

    //set the email template
    const templatePath = `${__dirname}/../templates/email/${type}.ejs`;
    email.html = await ejs.renderFile(templatePath, data ?? {});

    //set email subjects
    switch (type) {
      case EmailTemplateType.forgotPassword:
        email.subject = 'Reset Password';
        break;
      case EmailTemplateType.changePassword:
        email.subject = 'Password Changed';
        break;
      case EmailTemplateType.onBoarding:
        email.subject = 'Welcome to Service mate!';
        break;
    }

    if (
      process.env.NODE_ENV &&
      ['local', 'dev'].includes(process.env.NODE_ENV)
    ) {
      //only for dev or local envs
      await transporter.sendMail(email);
    } else {
      // @ts-ignore
      const mail = await sgMail.send(email);
      if (mail instanceof Error) {
        return false;
      } else {
        return mail[0].statusCode == 202;
      }
    }
    return true;
  } catch (e) {
    throw e as Error;
  }
}
