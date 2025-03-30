import axios from 'axios';
import { PaymentResponse } from '../types';
import { supabase, createTransaction, updateTransactionStatus, createUserSubscription } from './supabase';

// Create a secure API instance with the token
const api = axios.create({
  baseURL: 'https://api.pushinpay.com.br/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_PUSHINPAY_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('PushinPay API Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('PushinPay API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('PushinPay API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      request: error.config ? {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data
      } : 'No request config'
    });
    return Promise.reject(error);
  }
);

/**
 * Generates a PIX payment using PushinPay API
 * 
 * @param amount - Payment amount in BRL (e.g., 29.90)
 * @param description - Payment description
 * @param customerEmail - Customer email
 * @param customerName - Customer name
 * @param customerCpf - Optional customer CPF
 * @returns Payment response with QR code and PIX code
 */
export const generatePixPayment = async (
  amount: number, 
  description: string,
  customerEmail: string,
  customerName: string,
  customerCpf?: string
): Promise<PaymentResponse> => {
  try {
    // Convert amount to cents as required by PushinPay
    // For example: 29.90 becomes 2990
    const amountInCents = Math.round(amount * 100);
    
    console.log(`Converting amount ${amount} to cents: ${amountInCents}`);
    
    // Build the payload according to PushinPay documentation
    const payload: any = {
      amount: amountInCents, // Amount in cents
      description,
      customer: {
        email: customerEmail,
        name: customerName
      },
      expiration: 3600, // 1 hour expiration
      callback_url: window.location.origin + '/api/webhook/pushinpay' // Add callback URL for notifications
    };
    
    // Add CPF if provided (ensure it's properly formatted)
    if (customerCpf) {
      // Remove any non-numeric characters
      const formattedCpf = customerCpf.replace(/\D/g, '');
      if (formattedCpf.length === 11) {
        payload.customer.cpf = formattedCpf;
      }
    }
    
    console.log('Generating PIX payment with payload:', payload);
    
    // POST /pix/charges endpoint creates a new PIX charge
    const response = await api.post('/pix/charges', payload);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Create transaction record - store the original amount (not in cents)
      await createTransaction(
        user.id,
        'lifetime', // Default to lifetime plan for now
        amount, // Store the original amount with decimal places
        'pix',
        response.data.id
      );
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error generating PIX payment:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('PushinPay API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

/**
 * Checks the status of a PIX payment
 * 
 * @param paymentId - Payment ID from PushinPay
 * @returns Payment status string
 */
export const checkPaymentStatus = async (paymentId: string): Promise<string> => {
  try {
    console.log(`Checking payment status for ID: ${paymentId}`);
    
    // GET /pix/charges/{id} endpoint retrieves the current status of a PIX charge
    const response = await api.get(`/pix/charges/${paymentId}`);
    const status = response.data.status;
    
    console.log(`Payment status for ID ${paymentId}: ${status}`);
    
    // If payment is completed, update transaction and create subscription
    if (status === 'COMPLETED' || status === 'CONFIRMED' || status === 'PAID') {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update transaction status
        const transaction = await updateTransactionStatus(paymentId, 'paid');
        
        if (transaction) {
          // Create user subscription
          const plan = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', transaction.plan_id)
            .single();
          
          if (plan.data) {
            let expiresAt = null;
            
            // Calculate expiration date if not lifetime
            if (!plan.data.is_lifetime && plan.data.duration_days > 0) {
              const expirationDate = new Date();
              expirationDate.setDate(expirationDate.getDate() + plan.data.duration_days);
              expiresAt = expirationDate.toISOString();
            }
            
            await createUserSubscription(
              user.id,
              transaction.plan_id,
              plan.data.is_lifetime,
              expiresAt
            );
          }
        }
      }
    }
    
    return status;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Handles webhook notifications from PushinPay
 * This would typically be implemented in a server-side API route
 * 
 * @param event - Webhook event data
 * @returns Success response
 */
export const handlePushinPayWebhook = async (event: any) => {
  try {
    console.log('Received PushinPay webhook:', event);
    
    const { payment_id, status } = event;
    
    if (!payment_id) {
      throw new Error('Missing payment_id in webhook payload');
    }
    
    // Get transaction by payment ID
    const transaction = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_id', payment_id)
      .single();
    
    if (transaction.error) {
      throw new Error(`Transaction not found for payment_id: ${payment_id}`);
    }
    
    // Update transaction status
    await updateTransactionStatus(transaction.data.id, status.toLowerCase());
    
    // If payment is completed, create subscription
    if (status === 'COMPLETED' || status === 'CONFIRMED' || status === 'PAID') {
      // Get plan details
      const plan = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', transaction.data.plan_id)
        .single();
      
      if (plan.error) {
        throw new Error(`Plan not found: ${transaction.data.plan_id}`);
      }
      
      let expiresAt = null;
      
      // Calculate expiration date if not lifetime
      if (!plan.data.is_lifetime && plan.data.duration_days > 0) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + plan.data.duration_days);
        expiresAt = expirationDate.toISOString();
      }
      
      // Create user subscription
      await createUserSubscription(
        transaction.data.user_id,
        transaction.data.plan_id,
        plan.data.is_lifetime,
        expiresAt
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};
