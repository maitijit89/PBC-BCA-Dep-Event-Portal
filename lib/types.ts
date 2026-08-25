export type Semester =
  | '1st Semester'
  | '2nd Semester'
  | '3rd Semester'
  | '4th Semester'
  | '5th Semester'
  | '6th Semester'
  | '7th Semester'
  | '8th Semester';

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  age: number | string;
  semester: Semester;
}

export type CreateOrderRequest = RegistrationFormData;

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number; // in paise
  amountFormatted: number; // in INR
  currency: string;
  keyId: string;
  message?: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userData: RegistrationFormData;
}

export interface VerifyPaymentResponse {
  success: boolean;
  ticketId?: string;
  message: string;
  details?: {
    name: string;
    email: string;
    phone: string;
    semester: string;
    amountPaid: number;
    paymentId: string;
    ticketId: string;
    timestamp: string;
  };
}

export interface SheetRowData {
  timestamp: string;
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  age: string | number;
  semester: string;
  amountPaid: number;
  paymentId: string;
  status: string;
}

export interface TrackerStats {
  totalCollected: number;
  totalRegistrations: number;
  targetGoal?: number;
  lastUpdated: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
