function generateOtp() {
  return Math.floor(Math.random() * 9000 + 1000);
}
function addMinute(m: number): Date {
  const date = new Date();
  date.setTime(date.getTime() + m  * 60 * 1000);
  return date;
}

function pageSkip(skip: number, limit: number) {
  const pageSkip = skip - 1;
  return pageSkip == 0 ? 0 : pageSkip * limit;
}

const HelperUtil = {
  generateOtp,
  addMinute,
  pageSkip,
};
export default HelperUtil;
