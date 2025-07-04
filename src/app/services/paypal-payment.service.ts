import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { PaymentRequest, PaymentResponse } from './payment.service';

declare var paypal: any;

@Injectable({
  providedIn: 'root'
})
export class PaypalPaymentService {
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize PayPal SDK
   */
  async initializePayPal(): Promise<void> {
    if (this.isInitialized) return;

    const config = this.configService.getConfig();
    const clientId = config.paypalClientId || config.paymentGateways?.paypal?.clientId;

    if (!clientId) {
      throw new Error('PayPal client ID not configured');
    }

    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      await this.loadPayPalScript(clientId);
    }

    this.isInitialized = true;
  }

  /**
   * Process PayPal payment
   */
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return from(this.processPayPalPayment(request)).pipe(
      catchError(error => {
        console.error('PayPal payment error:', error);
        return throwError(() => ({
          success: false,
          error: error.message || 'PayPal payment failed',
          message: 'Payment processing failed. Please try again.'
        }));
      })
    );
  }

  private async processPayPalPayment(request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializePayPal();

    return new Promise((resolve) => {
      const container = document.getElementById('paypal-button-container');
      if (!container) {
        resolve({
          success: false,
          error: 'PayPal container not found',
          message: 'Payment form container not found'
        });
        return;
      }

      // Clear any existing buttons
      container.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: request.amount.toFixed(2),
                currency_code: request.currency
              },
              description: request.description,
              custom_id: request.orderId,
              soft_descriptor: 'ECOMMERCE_APP'
            }],
            application_context: {
              brand_name: 'Your Store Name',
              landing_page: 'BILLING',
              user_action: 'PAY_NOW',
              return_url: request.successUrl,
              cancel_url: request.cancelUrl
            }
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            
            // Process successful payment
            await this.processSuccessfulPayment(order, request);
            
            resolve({
              success: true,
              transactionId: order.id,
              gatewayResponse: order,
              message: 'PayPal payment completed successfully'
            });
          } catch (error: any) {
            resolve({
              success: false,
              error: error.message || 'Payment capture failed',
              message: 'Payment could not be completed'
            });
          }
        },
        onError: (error: any) => {
          console.error('PayPal error:', error);
          resolve({
            success: false,
            error: error.message || 'PayPal error occurred',
            message: 'Payment failed due to an error'
          });
        },
        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data);
          resolve({
            success: false,
            error: 'Payment cancelled by user',
            message: 'Payment was cancelled'
          });
        }
      }).render('#paypal-button-container');
    });
  }

  /**
   * Create PayPal Smart Payment Buttons
   */
  async createPaymentButtons(containerId: string, request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializePayPal();

    return new Promise((resolve) => {
      const container = document.getElementById(containerId);
      if (!container) {
        resolve({
          success: false,
          error: 'PayPal container not found',
          message: 'Payment form container not found'
        });
        return;
      }

      // Clear any existing buttons
      container.innerHTML = '';

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: request.amount.toFixed(2),
                currency_code: request.currency,
                breakdown: {
                  item_total: {
                    currency_code: request.currency,
                    value: request.amount.toFixed(2)
                  }
                }
              },
              description: request.description,
              custom_id: request.orderId,
              items: [{
                name: request.description,
                unit_amount: {
                  currency_code: request.currency,
                  value: request.amount.toFixed(2)
                },
                quantity: '1'
              }]
            }],
            application_context: {
              brand_name: 'Your Store',
              landing_page: 'BILLING',
              user_action: 'PAY_NOW'
            }
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            await this.processSuccessfulPayment(order, request);
            
            resolve({
              success: true,
              transactionId: order.id,
              gatewayResponse: order,
              message: 'PayPal payment successful'
            });
          } catch (error: any) {
            resolve({
              success: false,
              error: error.message || 'Payment capture failed',
              message: 'Payment could not be completed'
            });
          }
        },
        onError: (error: any) => {
          resolve({
            success: false,
            error: error.message || 'PayPal error',
            message: 'Payment failed'
          });
        },
        onCancel: () => {
          resolve({
            success: false,
            error: 'Payment cancelled',
            message: 'Payment was cancelled'
          });
        }
      }).render(`#${containerId}`);
    });
  }

  /**
   * Process PayPal Credit payment
   */
  async createPayPalCreditButtons(containerId: string, request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializePayPal();

    return new Promise((resolve) => {
      const container = document.getElementById(containerId);
      if (!container) {
        resolve({
          success: false,
          error: 'PayPal Credit container not found',
          message: 'Payment form container not found'
        });
        return;
      }

      container.innerHTML = '';

      window.paypal.Buttons({
        fundingSource: window.paypal.FUNDING.CREDIT,
        style: {
          layout: 'vertical',
          color: 'darkblue',
          shape: 'rect',
          label: 'credit'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: request.amount.toFixed(2),
                currency_code: request.currency
              },
              description: request.description,
              custom_id: request.orderId
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            await this.processSuccessfulPayment(order, request);
            
            resolve({
              success: true,
              transactionId: order.id,
              gatewayResponse: order,
              message: 'PayPal Credit payment successful'
            });
          } catch (error: any) {
            resolve({
              success: false,
              error: error.message || 'PayPal Credit payment failed',
              message: 'Payment could not be completed'
            });
          }
        },
        onError: (error: any) => {
          resolve({
            success: false,
            error: error.message || 'PayPal Credit error',
            message: 'PayPal Credit payment failed'
          });
        }
      }).render(`#${containerId}`);
    });
  }

  /**
   * Get order details from PayPal
   */
  async getOrder(orderId: string): Promise<any> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const response = await fetch(`${config.apiUrl}/payments/paypal/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve PayPal order: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Refund PayPal payment
   */
  async refundPayment(captureId: string, amount?: number, currency?: string): Promise<any> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const refundData: any = {};
    if (amount && currency) {
      refundData.amount = {
        value: amount.toFixed(2),
        currency_code: currency
      };
    }

    const response = await fetch(`${config.apiUrl}/payments/paypal/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(refundData)
    });

    if (!response.ok) {
      throw new Error(`PayPal refund failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Process successful payment on backend
   */
  private async processSuccessfulPayment(order: any, request: PaymentRequest): Promise<void> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const response = await fetch(`${config.apiUrl}/payments/paypal/process-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        paypal_order_id: order.id,
        order_id: request.orderId,
        amount: request.amount,
        currency: request.currency,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        paypal_order_data: order
      })
    });

    if (!response.ok) {
      throw new Error('Failed to process payment on backend');
    }
  }

  /**
   * Create subscription for recurring payments
   */
  async createSubscription(planId: string, customerId: string): Promise<any> {
    const config = this.configService.getConfig();
    const authToken = config.authToken;

    const response = await fetch(`${config.apiUrl}/payments/paypal/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: 'Customer',
            surname: 'Name'
          },
          email_address: customerId
        },
        application_context: {
          brand_name: 'Your Store',
          locale: 'en-US',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create PayPal subscription: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Load PayPal SDK script
   */
  private loadPayPalScript(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve();
        return;
      }

      const config = this.configService.getConfig();
      const environment = config.paymentGateways?.paypal?.environment || 'sandbox';
      
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&enable-funding=credit,card&disable-funding=&components=buttons,marks,funding-eligibility`;
      script.setAttribute('data-partner-attribution-id', 'YourPartnerAttributionId');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Validate PayPal configuration
   */
  validateConfiguration(): boolean {
    const config = this.configService.getConfig();
    const hasOldConfig = !!(config.paypalClientId && config.paypalClientSecret);
    const hasNewConfig = !!(config.paymentGateways?.paypal?.clientId && config.paymentGateways?.paypal?.clientSecret);
    
    return hasOldConfig || hasNewConfig;
  }

  /**
   * Get supported currencies for PayPal
   */
  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'NOK', 'SEK', 'DKK',
      'PLN', 'CZK', 'HUF', 'ILS', 'MXN', 'BRL', 'TWD', 'THB', 'SGD', 'HKD',
      'NZD', 'PHP', 'MYR', 'INR', 'RUB'
    ];
  }

  /**
   * Check if PayPal is eligible for current context
   */
  async checkEligibility(currency: string, amount: number): Promise<boolean> {
    await this.initializePayPal();

    try {
      const eligibility = window.paypal.getFundingSources();
      return eligibility.includes(window.paypal.FUNDING.PAYPAL);
    } catch (error) {
      console.error('PayPal eligibility check failed:', error);
      return false;
    }
  }

  /**
   * Check if PayPal Credit is available
   */
  async isCreditAvailable(): Promise<boolean> {
    await this.initializePayPal();

    try {
      const eligibility = window.paypal.getFundingSources();
      return eligibility.includes(window.paypal.FUNDING.CREDIT);
    } catch (error) {
      console.error('PayPal Credit availability check failed:', error);
      return false;
    }
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): string[] {
    return ['paypal', 'paypal_credit', 'card'];
  }

  /**
   * Format amount for PayPal (always 2 decimal places)
   */
  private formatAmountForPayPal(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Get processing fees estimate
   */
  getProcessingFees(amount: number, currency: string, isInternational: boolean = false): number {
    // PayPal fees (approximate)
    let feeRate = 0.0349; // 3.49% for domestic
    let fixedFee = 0.49;   // $0.49 fixed fee

    if (isInternational) {
      feeRate = 0.0449; // 4.49% for international
      fixedFee = 0.49;
    }

    // Adjust fixed fee based on currency
    const fixedFees: { [key: string]: number } = {
      'USD': 0.49, 'EUR': 0.35, 'GBP': 0.30, 'CAD': 0.55, 'AUD': 0.55,
      'JPY': 40, 'CHF': 0.55, 'NOK': 2.80, 'SEK': 3.25, 'DKK': 2.60
    };

    fixedFee = fixedFees[currency] || fixedFee;

    return (amount * feeRate) + fixedFee;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    paypal: any;
  }
}