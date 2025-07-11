import ejs from "ejs";
import nodemailer, { TransportOptions } from "nodemailer";
import { EmailModel } from "../data/dtos/email.dto";
import { EmailTemplateType } from "@/modules/base/enums/email.template.type";

let transporter: any;

// Initialize transporter once
const initializeTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT || '2525'),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
      secure: false, // Use TLS
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
    } as TransportOptions);
  }
  return transporter;
};

export async function send(
  to: string,
  type: EmailTemplateType,
  data?: any
): Promise<boolean> {
  console.log("came inside send");
  
  const mailTransporter = initializeTransporter();
  
  // Verify connection
  try {
    await mailTransporter.verify();
    console.log("Email transporter verified successfully");
  } catch (error) {
    console.error("Email transporter verification failed:", error);
    throw new Error(`Email service not available: ${error}`);
  }

  try {
    const email = {
      to: to,
      from: process.env.FROM_EMAIL,
    } as EmailModel;

    //set the email template
    const templatePath = `${__dirname}/../templates/email/${type}.ejs`;
    email.html = await ejs.renderFile(templatePath, data ?? {});
    console.log("email.html", email.html);

    //set email subjects
    switch (type) {
      case EmailTemplateType.forgotPassword:
        email.subject = "Reset Password";
        break;
      case EmailTemplateType.changePassword:
        email.subject = "Password Changed";
        break;
    }
    console.log("email.subject", email.subject);
    console.log("Sending email to:", to);
    
    //only for dev or local envs
    const result = await mailTransporter.sendMail(email);
    console.log("Email sent successfully:", result.messageId);
    
    return true;
  } catch (e) {
    console.error("Email sending failed:", e);
    throw e as Error;
  }
}
