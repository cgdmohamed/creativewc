import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { PaymentRequest, PaymentResponse } from './payment.service';

declare var Stripe: any;

@Injectable({
  providedIn: 'root'
})
export class StripePaymentService {
  private stripe: any;
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize Stripe with publishable key
   */
  async initializeStripe(): Promise<void> {
    if (this.isInitialized) return;

    const config = this.configService.getConfig();
    const publishableKey = config.stripePublishableKey || config.paymentGateways?.stripe?.publishableKey;

    if (!publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    // Load Stripe.js if not already loaded
    if (!window.Stripe) {
      await this.loadStripeScript();
    }

    this.stripe = window.Stripe(publishableKey);
    this.isInitialized = true;
  }

  /**
   * Process Stripe payment
   */
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return from(this.processStripePayment(request)).pipe(
      catchError(error => {
        console.error('Stripe payment error:', error);
        return throwError(() => ({
          success: false,
          error: error.message || 'Stripe payment failed',
          message: 'Payment processing failed. Please try again.'
        }));
      })
    );
  }

  private async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializeStripe();

    try {
      // Create payment intent on your backend
      const paymentIntent = await this.createPaymentIntent(request);

      if (!paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const result = await this.stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: {
            // In real implementation, this would be Stripe Elements
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          },
          billing_details: {
            name: request.customerName,
            email: request.customerEmail
          }
        }
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
          message: 'Payment failed. Please check your card details.'
        };
      }

      return {
        success: true,
        transactionId: result.paymentIntent.id,
        gatewayResponse: result.paymentIntent,
        message: 'Payment completed successfully'
      };

    } catch (error: any) {
      throw new Error(error.message || 'Stripe payment processing failed');
    }
  }

  /**
   * Create Stripe payment intent on backend
   */
  private async createPaymentIntent(request: PaymentRequest): Promise<any> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const response = await fetch(`${config.apiUrl}/payments/stripe/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        amount: this.formatAmountForStripe(request.amount, request.currency),
        currency: request.currency.toLowerCase(),
        description: request.description,
        customer_email: request.customerEmail,
        metadata: {
          order_id: request.orderId,
          customer_name: request.customerName
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment intent: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Create Stripe Elements for secure card input
   */
  async createCardElement(containerId: string): Promise<any> {
    await this.initializeStripe();

    const elements = this.stripe.elements();
    const cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    });

    cardElement.mount(`#${containerId}`);
    return cardElement;
  }

  /**
   * Confirm payment with card element
   */
  async confirmPaymentWithElement(clientSecret: string, cardElement: any, billingDetails: any): Promise<PaymentResponse> {
    await this.initializeStripe();

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
          message: 'Payment failed. Please check your card details.'
        };
      }

      return {
        success: true,
        transactionId: result.paymentIntent.id,
        gatewayResponse: result.paymentIntent,
        message: 'Payment completed successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment confirmation failed',
        message: 'Payment processing failed'
      };
    }
  }

  /**
   * Handle Apple Pay payments
   */
  async processApplePay(request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializeStripe();

    try {
      const paymentRequest = this.stripe.paymentRequest({
        country: 'US',
        currency: request.currency.toLowerCase(),
        total: {
          label: request.description,
          amount: this.formatAmountForStripe(request.amount, request.currency),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const elements = this.stripe.elements();
      const prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
      });

      // Check if Apple Pay is available
      const result = await paymentRequest.canMakePayment();
      if (!result) {
        return {
          success: false,
          error: 'Apple Pay not available',
          message: 'Apple Pay is not available on this device'
        };
      }

      return new Promise((resolve) => {
        paymentRequest.on('paymentmethod', async (ev: any) => {
          // Create payment intent
          const paymentIntent = await this.createPaymentIntent(request);

          // Confirm payment
          const confirmResult = await this.stripe.confirmCardPayment(
            paymentIntent.client_secret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmResult.error) {
            ev.complete('fail');
            resolve({
              success: false,
              error: confirmResult.error.message,
              message: 'Apple Pay payment failed'
            });
          } else {
            ev.complete('success');
            resolve({
              success: true,
              transactionId: confirmResult.paymentIntent.id,
              gatewayResponse: confirmResult.paymentIntent,
              message: 'Apple Pay payment successful'
            });
          }
        });
      });

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Apple Pay processing failed',
        message: 'Apple Pay payment failed'
      };
    }
  }

  /**
   * Retrieve payment details
   */
  async getPaymentIntent(paymentIntentId: string): Promise<any> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const response = await fetch(`${config.apiUrl}/payments/stripe/payment-intent/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve payment intent: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const refundData: any = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = this.formatAmountForStripe(amount, 'USD'); // Default to USD
    }

    const response = await fetch(`${config.apiUrl}/payments/stripe/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(refundData)
    });

    if (!response.ok) {
      throw new Error(`Refund failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Load Stripe.js script
   */
  private loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Validate Stripe configuration
   */
  validateConfiguration(): boolean {
    const config = this.configService.getConfig();
    const hasOldConfig = !!(config.stripePublishableKey && config.stripeSecretKey);
    const hasNewConfig = !!(config.paymentGateways?.stripe?.publishableKey && config.paymentGateways?.stripe?.secretKey);
    
    return hasOldConfig || hasNewConfig;
  }

  /**
   * Get supported currencies for Stripe
   */
  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'NOK', 'SEK', 'DKK',
      'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'ISK', 'MXN', 'BRL', 'ARS',
      'CLP', 'COP', 'PEN', 'UYU', 'SGD', 'HKD', 'TWD', 'KRW', 'THB', 'MYR',
      'IDR', 'PHP', 'VND', 'INR', 'NPR', 'LKR', 'PKR', 'BDT', 'AED', 'SAR'
    ];
  }

  /**
   * Format amount for Stripe API (uses smallest currency unit)
   */
  private formatAmountForStripe(amount: number, currency: string): number {
    // Zero-decimal currencies (charged in whole units)
    const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(amount);
    }
    
    return Math.round(amount * 100);
  }

  /**
   * Check if Apple Pay is available
   */
  async isApplePayAvailable(): Promise<boolean> {
    await this.initializeStripe();

    const paymentRequest = this.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Test', amount: 100 },
    });

    const result = await paymentRequest.canMakePayment();
    return result && result.applePay;
  }

  /**
   * Check if Google Pay is available
   */
  async isGooglePayAvailable(): Promise<boolean> {
    await this.initializeStripe();

    const paymentRequest = this.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Test', amount: 100 },
    });

    const result = await paymentRequest.canMakePayment();
    return result && result.googlePay;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Stripe: any;
  }
}