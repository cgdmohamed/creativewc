import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { PaymentRequest, PaymentResponse } from './payment.service';

declare var Moyasar: any;

@Injectable({
  providedIn: 'root'
})
export class MoyasarPaymentService {
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize Moyasar with publishable key
   */
  async initializeMoyasar(): Promise<void> {
    if (this.isInitialized) return;

    const config = this.configService.getMoyasarConfig();

    if (!config.publishableKey) {
      throw new Error('Moyasar publishable key not configured');
    }

    // Load Moyasar.js if not already loaded
    if (!window.Moyasar) {
      await this.loadMoyasarScript();
    }

    // Configure Moyasar
    window.Moyasar.init({
      publishable_api_key: config.publishableKey
    });

    this.isInitialized = true;
  }

  /**
   * Process Moyasar payment
   */
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return from(this.processMoyasarPayment(request)).pipe(
      catchError(error => {
        console.error('Moyasar payment error:', error);
        return throwError(() => ({
          success: false,
          error: error.message || 'Moyasar payment failed',
          message: 'Payment processing failed. Please try again.'
        }));
      })
    );
  }

  private async processMoyasarPayment(request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializeMoyasar();

    try {
      // Create payment with Moyasar
      const paymentData = {
        amount: this.formatAmountForMoyasar(request.amount, request.currency),
        currency: request.currency,
        description: request.description,
        publishable_api_key: this.getPublishableKey(),
        callback_url: request.successUrl,
        source: {
          type: 'creditcard',
          name: request.customerName,
          number: '4111111111111111', // Test card in test mode
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const payment = await window.Moyasar.createPayment(paymentData);

      if (payment.status === 'paid') {
        return {
          success: true,
          transactionId: payment.id,
          gatewayResponse: payment,
          message: 'Payment completed successfully'
        };
      } else if (payment.status === 'failed') {
        return {
          success: false,
          error: payment.source?.message || 'Payment failed',
          message: 'Payment could not be processed'
        };
      } else if (payment.status === 'pending') {
        return {
          success: false,
          error: 'Payment is pending',
          message: 'Payment is being processed'
        };
      }

      return {
        success: false,
        error: 'Unknown payment status',
        message: 'Payment status could not be determined'
      };

    } catch (error: any) {
      throw new Error(error.message || 'Moyasar payment processing failed');
    }
  }

  /**
   * Create Moyasar payment form
   */
  async createPaymentForm(containerId: string, request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializeMoyasar();

    return new Promise((resolve) => {
      const container = document.getElementById(containerId);
      if (!container) {
        resolve({
          success: false,
          error: 'Moyasar container not found',
          message: 'Payment form container not found'
        });
        return;
      }

      const config = this.configService.getMoyasarConfig();

      // Create Moyasar form
      window.Moyasar.init({
        element: `#${containerId}`,
        publishable_api_key: config.publishableKey,
        amount: this.formatAmountForMoyasar(request.amount, request.currency),
        currency: request.currency,
        description: request.description,
        callback_url: request.successUrl,
        methods: ['creditcard', 'stcpay', 'applepay'],
        on_completed: (payment: any) => {
          if (payment.status === 'paid') {
            resolve({
              success: true,
              transactionId: payment.id,
              gatewayResponse: payment,
              message: 'Payment completed successfully'
            });
          } else {
            resolve({
              success: false,
              error: payment.source?.message || 'Payment failed',
              message: 'Payment could not be completed'
            });
          }
        },
        on_failed: (payment: any) => {
          resolve({
            success: false,
            error: payment.source?.message || 'Payment failed',
            message: 'Payment failed'
          });
        }
      });
    });
  }

  /**
   * Process Apple Pay through Moyasar
   */
  async processApplePay(request: PaymentRequest): Promise<PaymentResponse> {
    await this.initializeMoyasar();

    try {
      const paymentData = {
        amount: this.formatAmountForMoyasar(request.amount, request.currency),
        currency: request.currency,
        description: request.description,
        publishable_api_key: this.getPublishableKey(),
        callback_url: request.successUrl,
        source: {
          type: 'applepay',
          token: 'apple_pay_token_here' // In real implementation, get from Apple Pay
        }
      };

      const payment = await window.Moyasar.createPayment(paymentData);

      return {
        success: payment.status === 'paid',
        transactionId: payment.id,
        gatewayResponse: payment,
        message: payment.status === 'paid' ? 'Payment successful' : 'Payment failed'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Apple Pay processing failed',
        message: 'Apple Pay payment failed'
      };
    }
  }

  /**
   * Process STC Pay through Moyasar
   */
  async processSTCPay(request: PaymentRequest, phoneNumber: string): Promise<PaymentResponse> {
    await this.initializeMoyasar();

    try {
      const paymentData = {
        amount: this.formatAmountForMoyasar(request.amount, request.currency),
        currency: request.currency,
        description: request.description,
        publishable_api_key: this.getPublishableKey(),
        callback_url: request.successUrl,
        source: {
          type: 'stcpay',
          mobile: phoneNumber
        }
      };

      const payment = await window.Moyasar.createPayment(paymentData);

      if (payment.status === 'initiated') {
        return {
          success: true,
          transactionId: payment.id,
          redirectUrl: payment.source?.transaction_url,
          gatewayResponse: payment,
          message: 'STC Pay initiated - please complete on your mobile'
        };
      }

      return {
        success: false,
        error: payment.source?.message || 'STC Pay failed',
        message: 'STC Pay could not be initiated'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'STC Pay processing failed',
        message: 'STC Pay payment failed'
      };
    }
  }

  /**
   * Retrieve payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    const config = this.configService.getMoyasarConfig();

    if (!config.secretKey) {
      throw new Error('Moyasar secret key not configured');
    }

    try {
      const response = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(config.secretKey + ':')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve payment: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retrieve payment details');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    const config = this.configService.getMoyasarConfig();

    if (!config.secretKey) {
      throw new Error('Moyasar secret key not configured');
    }

    try {
      const refundData: any = {};
      if (amount) {
        refundData.amount = this.formatAmountForMoyasar(amount, 'SAR');
      }

      const response = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(config.secretKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      });

      if (!response.ok) {
        throw new Error(`Refund failed: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Refund processing failed');
    }
  }

  /**
   * Load Moyasar.js script
   */
  private loadMoyasarScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Moyasar) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Moyasar.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Get publishable key from config
   */
  private getPublishableKey(): string {
    const config = this.configService.getMoyasarConfig();
    return config.publishableKey || '';
  }

  /**
   * Validate Moyasar configuration
   */
  validateConfiguration(): boolean {
    const config = this.configService.getMoyasarConfig();
    return !!(config.publishableKey && config.secretKey);
  }

  /**
   * Get supported currencies for Moyasar
   */
  getSupportedCurrencies(): string[] {
    return ['SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'USD', 'EUR'];
  }

  /**
   * Format amount for Moyasar API (uses smallest currency unit)
   */
  private formatAmountForMoyasar(amount: number, currency: string): number {
    // Currencies that use 3 decimal places
    const threeDecimalCurrencies = ['BHD', 'KWD', 'OMR'];
    
    if (threeDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(amount * 1000);
    }
    
    return Math.round(amount * 100);
  }

  /**
   * Get payment methods available for Moyasar
   */
  getAvailablePaymentMethods(currency: string): string[] {
    const methods = ['creditcard'];
    
    // STC Pay only available for SAR
    if (currency === 'SAR') {
      methods.push('stcpay');
    }
    
    // Apple Pay available for supported currencies
    if (['SAR', 'AED', 'USD', 'EUR'].includes(currency)) {
      methods.push('applepay');
    }
    
    return methods;
  }

  /**
   * Check if a specific payment method is supported
   */
  isPaymentMethodSupported(method: string, currency: string): boolean {
    const availableMethods = this.getAvailablePaymentMethods(currency);
    return availableMethods.includes(method);
  }

  /**
   * Get estimated processing fees
   */
  getProcessingFees(amount: number, currency: string, method: string = 'creditcard'): number {
    // Moyasar fees (approximate)
    const feeRates: { [key: string]: { [method: string]: number } } = {
      'SAR': { 
        'creditcard': 0.029, // 2.9% + SAR 1
        'stcpay': 0.025,     // 2.5%
        'applepay': 0.029    // 2.9% + SAR 1
      },
      'AED': { 
        'creditcard': 0.035, // 3.5% + AED 1
        'applepay': 0.035    // 3.5% + AED 1
      },
      'USD': { 
        'creditcard': 0.029, // 2.9% + $0.30
        'applepay': 0.029    // 2.9% + $0.30
      }
    };

    const currencyFees = feeRates[currency];
    if (!currencyFees) return 0;

    const rate = currencyFees[method] || currencyFees['creditcard'];
    return amount * rate;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Moyasar: any;
  }
}