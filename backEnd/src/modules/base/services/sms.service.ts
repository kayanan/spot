import axios from "axios";

export const sendSMS = async (mobileNumber: string, message: string) => {
 
  // const response = await axios.post(
  //   "https://api.textit.biz/",
  //   {
  //     to: mobileNumber.toString(),
  //     text: message,
  //   },
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "*/*",
  //       "X-API-VERSION": "v1",
  //       Authorization: `Basic ${process.env?.SMS_API_KEY}`,
  //     },
  //   }
  // );
  const response = {status:true}
  return response;
};
