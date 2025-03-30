import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Subscription Plans
export const getSubscriptionPlans = async () => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
  
  return data || [];
};

// Transactions
export const createTransaction = async (
  userId: string,
  planId: string,
  amount: number,
  paymentMethod: string,
  paymentId?: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      plan_id: planId,
      amount,
      payment_method: paymentMethod,
      payment_id: paymentId,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
  
  return data;
};

export const updateTransactionStatus = async (
  paymentId: string,
  status: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', paymentId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
  
  return data;
};

// User Subscriptions
export const createUserSubscription = async (
  userId: string,
  planId: string,
  isLifetime: boolean,
  expiresAt?: string | null
) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      is_active: true,
      is_lifetime: isLifetime,
      expires_at: expiresAt
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
  
  return data;
};

export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
    console.error('Error fetching user subscription:', error);
    throw error;
  }
  
  return data;
};

export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      return false;
    }
    
    // If lifetime subscription, always return true
    if (subscription.is_lifetime) {
      return true;
    }
    
    // Check if subscription is expired
    if (subscription.expires_at) {
      const expirationDate = new Date(subscription.expires_at);
      const now = new Date();
      
      if (expirationDate < now) {
        // Subscription expired, update status
        await supabase
          .from('user_subscriptions')
          .update({ is_active: false })
          .eq('id', subscription.id);
        
        return false;
      }
    }
    
    return subscription.is_active;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
