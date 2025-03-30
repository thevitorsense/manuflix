export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export interface DatabaseSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  is_lifetime: boolean;
  created_at: string;
}

export interface Customer {
  name: string;
  email: string;
  cpf?: string;
}

export interface PaymentResponse {
  id: string;
  qrcode_image: string;
  copy_paste: string;
  expiration_date: string;
  status: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  payment_method: string;
  payment_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  is_active: boolean;
  is_lifetime: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
