import Razorpay from 'razorpay';

export function getRazorpayInstance(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export const getRazorpayKeyId = () => {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
};

// Default export instance for convenience
export const razorpayInstance = {
  get orders() {
    return getRazorpayInstance().orders;
  },
  get payments() {
    return getRazorpayInstance().payments;
  },
};
