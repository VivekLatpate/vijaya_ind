import Razorpay from "razorpay";

function getRequiredEnv(name: "RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}. Add it to your environment file before using Razorpay.`);
  }

  return value;
}

export function getRazorpayKeyId() {
  return getRequiredEnv("RAZORPAY_KEY_ID");
}

export function getRazorpayKeySecret() {
  return getRequiredEnv("RAZORPAY_KEY_SECRET");
}

export function getRazorpayClient() {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });
}
