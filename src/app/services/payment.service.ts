import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ConfigService } from './config.service';
import { StripePaymentService } from './stripe-payment.service';
import { PaypalPaymentService } from './paypal-payment.service';
import { MoyasarPaymentService } from './moyasar-payment.service';

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: { [key: string]: any };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
  message?: string;
  gatewayResponse?: any;
}

export interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  description: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  processingFee: number;
  logoUrl: string;
  isEnabled: boolean;
  testMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private paymentGateways: PaymentGateway[] = [
    {
      id: 'stripe',
      name: 'stripe',
      displayName: 'Stripe',
      description: 'Global payment processing with support for 40+ currencies',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'NOK', 'SEK', 'DKK', 'SAR', 'AED'],
      supportedCountries: ['US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'HK', 'JP', 'IE', 'AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH'],
      processingFee: 2.9,
      logoUrl: 'assets/payment-logos/stripe.png',
      isEnabled: true,
      testMode: true
    },
    {
      id: 'paypal',
      name: 'paypal',
      displayName: 'PayPal',
      description: 'Worldwide payment solution with buyer protection',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'ILS', 'MXN', 'BRL', 'TWD', 'THB', 'SGD', 'HKD', 'NZD', 'PHP', 'MYR', 'INR', 'RUB'],
      supportedCountries: ['US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'HK', 'JP', 'KR', 'TW', 'TH', 'MY', 'PH', 'IN', 'IE', 'AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'IT', 'LU', 'NL', 'NO', 'PT', 'ES', 'SE', 'CH', 'PL', 'CZ', 'HU', 'IL', 'MX', 'BR', 'RU'],
      processingFee: 3.49,
      logoUrl: 'assets/payment-logos/paypal.png',
      isEnabled: true,
      testMode: true
    },
    {
      id: 'moyasar',
      name: 'moyasar',
      displayName: 'Moyasar',
      description: 'Leading payment gateway for Middle East with local payment methods',
      supportedCurrencies: ['SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'USD', 'EUR'],
      supportedCountries: ['SA', 'AE', 'KW', 'BH', 'QA', 'OM'],
      processingFee: 2.9,
      logoUrl: 'assets/payment-logos/moyasar.png',
      isEnabled: true,
      testMode: true
    },
    {
      id: 'stcpay',
      name: 'stcpay',
      displayName: 'STC Pay',
      description: 'Digital wallet solution for Saudi Arabia',
      supportedCurrencies: ['SAR'],
      supportedCountries: ['SA'],
      processingFee: 2.5,
      logoUrl: 'assets/payment-logos/stcpay.png',
      isEnabled: false,
      testMode: true
    }
  ];

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private stripeService: StripePaymentService,
    private paypalService: PaypalPaymentService,
    private moyasarService: MoyasarPaymentService
  ) {}

  /**
   * Get available payment gateways
   */
  getAvailableGateways(): Observable<PaymentGateway[]> {
    const config = this.configService.getConfig();
    const enabledGateways = config.enabledPaymentGateways || [];
    
    const availableGateways = this.paymentGateways.filter(gateway => 
      enabledGateways.includes(gateway.id)
    );

    return of(availableGateways);
  }

  /**
   * Get payment gateways for specific currency and country
   */
  getGatewaysForRegion(currency: string, countryCode: string): Observable<PaymentGateway[]> {
    const config = this.configService.getConfig();
    const enabledGateways = config.enabledPaymentGateways || [];
    
    const regionGateways = this.paymentGateways.filter(gateway => 
      enabledGateways.includes(gateway.id) &&
      gateway.supportedCurrencies.includes(currency) &&
      gateway.supportedCountries.includes(countryCode)
    );

    // Sort by processing fee (lowest first)
    regionGateways.sort((a, b) => a.processingFee - b.processingFee);

    return of(regionGateways);
  }

  /**
   * Process payment through specified gateway
   */
  processPayment(gatewayId: string, request: PaymentRequest): Observable<PaymentResponse> {
    const config = this.configService.getConfig();
    
    // Use demo mode for testing
    if (config.useDemoData) {
      return this.simulatePayment(gatewayId, request);
    }

    switch (gatewayId) {
      case 'stripe':
        return this.stripeService.processPayment(request);
      case 'paypal':
        return this.paypalService.processPayment(request);
      case 'moyasar':
        return this.moyasarService.processPayment(request);
      case 'stcpay':
        return this.processSTCPayPayment(request);
      default:
        return of({
          success: false,
          error: 'Unsupported payment gateway'
        });
    }
  }

  /**
   * Simulate payment for demo mode
   */
  private simulatePayment(gatewayId: string, request: PaymentRequest): Observable<PaymentResponse> {
    // Simulate network delay and return Observable directly
    return new Observable(observer => {
      setTimeout(() => {
        // Simulate 95% success rate
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
          observer.next({
            success: true,
            transactionId: `demo_${gatewayId}_${Date.now()}`,
            message: `Demo payment successful via ${gatewayId}`
          });
        } else {
          observer.next({
            success: false,
            error: 'Demo payment failed',
            message: 'Simulated payment failure for testing'
          });
        }
        observer.complete();
      }, 2000);
    });
  }

  /**
   * Check if Apple Pay is supported
   */
  isApplePaySupported(): boolean {
    // Check if running on iOS Safari or supported browser
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && /Apple/.test(userAgent);
    
    // Check if Apple Pay is available
    return isIOS && isSafari && (window as any).ApplePaySession?.canMakePayments();
  }

  /**
   * Process Apple Pay payment
   */
  async processApplePayPayment(amount: number, description: string): Promise<PaymentResponse> {
    try {
      if (!this.isApplePaySupported()) {
        return {
          success: false,
          error: 'Apple Pay not supported on this device'
        };
      }

      // Apple Pay integration would go here
      // For now, return a placeholder response
      return {
        success: false,
        error: 'Apple Pay integration requires merchant setup',
        message: 'Apple Pay requires Apple Developer account and merchant verification'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Apple Pay payment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process credit card payment
   */
  async processCreditCardPayment(cardDetails: any, amount: number, currency: string): Promise<PaymentResponse> {
    try {
      // Default to Stripe for credit card processing
      const request: PaymentRequest = {
        amount,
        currency,
        description: 'Credit card payment',
        orderId: `order_${Date.now()}`,
        customerName: cardDetails.name || 'Customer',
        customerEmail: cardDetails.email || 'customer@example.com'
      };

      const result = await this.stripeService.processPayment(request).toPromise();
      return result || { success: false, error: 'No response from payment processor' };
    } catch (error) {
      return {
        success: false,
        error: 'Credit card payment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process Apple Pay payment (alternative method name)
   */
  async processApplePay(amount: number, currency: string, description: string): Promise<PaymentResponse> {
    return this.processApplePayPayment(amount, description);
  }

  /**
   * Process STC Pay payment
   */
  async processSTCPay(amount: number, currency: string, customerPhone: string): Promise<PaymentResponse> {
    try {
      if (currency !== 'SAR') {
        return {
          success: false,
          error: 'STC Pay only supports SAR currency'
        };
      }

      // STC Pay integration would go here
      // For now, return a placeholder response
      return {
        success: false,
        error: 'STC Pay integration not yet implemented',
        message: 'STC Pay requires direct partnership setup with STC'
      };
    } catch (error) {
      return {
        success: false,
        error: 'STC Pay payment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate all configured payment gateways
   */
  validateAllGateways(): Observable<{ [gatewayId: string]: boolean }> {
    const config = this.configService.getConfig();
    const enabledGateways = config.enabledPaymentGateways || [];
    const validationResults: { [gatewayId: string]: boolean } = {};

    enabledGateways.forEach(gatewayId => {
      switch (gatewayId) {
        case 'stripe':
          validationResults[gatewayId] = this.stripeService.validateConfiguration();
          break;
        case 'paypal':
          validationResults[gatewayId] = this.paypalService.validateConfiguration();
          break;
        case 'moyasar':
          validationResults[gatewayId] = this.moyasarService.validateConfiguration();
          break;
        case 'stcpay':
          validationResults[gatewayId] = this.validateSTCPayConfig();
          break;
        default:
          validationResults[gatewayId] = false;
      }
    });

    return of(validationResults);
  }

  /**
   * Get payment method support for each gateway
   */
  getPaymentMethodSupport(currency: string): Observable<{ [gatewayId: string]: string[] }> {
    const methodSupport: { [gatewayId: string]: string[] } = {};

    // Stripe payment methods
    methodSupport['stripe'] = ['card', 'apple_pay', 'google_pay'];
    
    // PayPal payment methods
    methodSupport['paypal'] = ['paypal', 'paypal_credit'];
    
    // Moyasar payment methods
    methodSupport['moyasar'] = this.moyasarService.getAvailablePaymentMethods(currency);
    
    // STC Pay (only for SAR)
    if (currency === 'SAR') {
      methodSupport['stcpay'] = ['stc_pay'];
    }

    return of(methodSupport);
  }

  /**
   * Validate STC Pay configuration
   */
  private validateSTCPayConfig(): boolean {
    const config = this.configService.getSTCPayConfig();
    return !!(config.merchantId && config.apiKey);
  }

  /**
   * STC Pay payment processing (placeholder)
   */
  private processSTCPayPayment(request: PaymentRequest): Observable<PaymentResponse> {
    // STC Pay integration would go here
    // For now, return a placeholder response
    return of({
      success: false,
      error: 'STC Pay integration not yet implemented',
      message: 'STC Pay requires direct partnership setup'
    });
  }

  /**
   * Get recommended gateway for region
   */
  getRecommendedGateway(currency: string, countryCode: string): Observable<PaymentGateway | null> {
    return new Observable(observer => {
      this.getGatewaysForRegion(currency, countryCode).subscribe(gateways => {
        if (gateways.length === 0) {
          observer.next(null);
          observer.complete();
          return;
        }

        // Regional preferences
        const regionalPreferences: { [key: string]: string[] } = {
          // Middle East - prefer Moyasar for local support
          'SA': ['moyasar', 'stripe', 'paypal'],
          'AE': ['moyasar', 'stripe', 'paypal'],
          'KW': ['moyasar', 'stripe', 'paypal'],
          'QA': ['moyasar', 'stripe', 'paypal'],
          'BH': ['moyasar', 'stripe', 'paypal'],
          'OM': ['moyasar', 'stripe', 'paypal'],
          
          // Global markets - prefer Stripe for reliability
          'US': ['stripe', 'paypal'],
          'CA': ['stripe', 'paypal'],
          'GB': ['stripe', 'paypal'],
          'AU': ['stripe', 'paypal'],
          'DE': ['stripe', 'paypal'],
          'FR': ['stripe', 'paypal'],
          'ES': ['stripe', 'paypal'],
          'IT': ['stripe', 'paypal'],
          'NL': ['stripe', 'paypal'],
          'JP': ['stripe', 'paypal'],
          'SG': ['stripe', 'paypal']
        };

        const preferences = regionalPreferences[countryCode] || ['stripe', 'paypal'];
        
        // Find first available gateway from preferences
        for (const preferredId of preferences) {
          const gateway = gateways.find(g => g.id === preferredId);
          if (gateway) {
            observer.next(gateway);
            observer.complete();
            return;
          }
        }

        // Fallback to first available
        observer.next(gateways[0]);
        observer.complete();
      });
    });
  }

  /**
   * Calculate processing fees for gateway
   */
  calculateProcessingFees(gatewayId: string, amount: number, currency: string): Observable<number> {
    let fee = 0;

    switch (gatewayId) {
      case 'stripe':
        // Stripe: 2.9% + fixed fee
        fee = amount * 0.029;
        if (currency === 'USD') fee += 0.30;
        else if (currency === 'EUR') fee += 0.25;
        else if (currency === 'GBP') fee += 0.20;
        break;

      case 'paypal':
        // PayPal: 3.49% + fixed fee
        fee = amount * 0.0349;
        if (currency === 'USD') fee += 0.49;
        else if (currency === 'EUR') fee += 0.35;
        else if (currency === 'GBP') fee += 0.30;
        break;

      case 'moyasar':
        // Moyasar: 2.9% for most currencies
        fee = this.moyasarService.getProcessingFees(amount, currency);
        break;

      case 'stcpay':
        // STC Pay: 2.5%
        fee = amount * 0.025;
        break;
    }

    return of(Math.round(fee * 100) / 100); // Round to 2 decimal places
  }

  /**
   * Test gateway connectivity
   */
  testGateway(gatewayId: string): Observable<{ success: boolean; message: string }> {
    switch (gatewayId) {
      case 'stripe':
        return this.testStripeConnectivity();
      case 'paypal':
        return this.testPayPalConnectivity();
      case 'moyasar':
        return this.testMoyasarConnectivity();
      default:
        return of({ success: false, message: 'Gateway not supported for testing' });
    }
  }

  /**
   * Test Stripe connectivity
   */
  private testStripeConnectivity(): Observable<{ success: boolean; message: string }> {
    const config = this.configService.getStripeConfig();
    
    if (!config.publishableKey) {
      return of({ success: false, message: 'Stripe publishable key not configured' });
    }

    // In a real implementation, this would make a test API call
    return of({ success: true, message: 'Stripe configuration appears valid' });
  }

  /**
   * Test PayPal connectivity
   */
  private testPayPalConnectivity(): Observable<{ success: boolean; message: string }> {
    const config = this.configService.getPayPalConfig();
    
    if (!config.clientId) {
      return of({ success: false, message: 'PayPal client ID not configured' });
    }

    return of({ success: true, message: 'PayPal configuration appears valid' });
  }

  /**
   * Test Moyasar connectivity
   */
  private testMoyasarConnectivity(): Observable<{ success: boolean; message: string }> {
    const config = this.configService.getMoyasarConfig();
    
    if (!config.publishableKey) {
      return of({ success: false, message: 'Moyasar publishable key not configured' });
    }

    return of({ success: true, message: 'Moyasar configuration appears valid' });
  }

  /**
   * Get gateway information by ID
   */
  getGatewayInfo(gatewayId: string): PaymentGateway | null {
    return this.paymentGateways.find(g => g.id === gatewayId) || null;
  }

  /**
   * Check if gateway supports currency
   */
  isGatewaySupportedForCurrency(gatewayId: string, currency: string): boolean {
    const gateway = this.getGatewayInfo(gatewayId);
    return gateway ? gateway.supportedCurrencies.includes(currency) : false;
  }

  /**
   * Check if gateway supports country
   */
  isGatewaySupportedForCountry(gatewayId: string, countryCode: string): boolean {
    const gateway = this.getGatewayInfo(gatewayId);
    return gateway ? gateway.supportedCountries.includes(countryCode) : false;
  }

  /**
   * Get all supported currencies across all gateways
   */
  getAllSupportedCurrencies(): string[] {
    const allCurrencies = new Set<string>();
    
    this.paymentGateways.forEach(gateway => {
      gateway.supportedCurrencies.forEach(currency => {
        allCurrencies.add(currency);
      });
    });

    return Array.from(allCurrencies).sort();
  }

  /**
   * Get all supported countries across all gateways
   */
  getAllSupportedCountries(): string[] {
    const allCountries = new Set<string>();
    
    this.paymentGateways.forEach(gateway => {
      gateway.supportedCountries.forEach(country => {
        allCountries.add(country);
      });
    });

    return Array.from(allCountries).sort();
  }

  /**
   * Update gateway configuration
   */
  updateGatewayConfig(gatewayId: string, isEnabled: boolean): void {
    const config = this.configService.getConfig();
    
    if (isEnabled) {
      if (!config.enabledPaymentGateways.includes(gatewayId)) {
        config.enabledPaymentGateways.push(gatewayId);
      }
    } else {
      const index = config.enabledPaymentGateways.indexOf(gatewayId);
      if (index > -1) {
        config.enabledPaymentGateways.splice(index, 1);
      }
    }

    this.configService.updateConfig({ enabledPaymentGateways: config.enabledPaymentGateways });
  }

  /**
   * Get payment processing summary
   */
  getProcessingSummary(): Observable<{
    enabledGateways: number;
    supportedCurrencies: number;
    supportedCountries: number;
    averageFee: number;
  }> {
    const config = this.configService.getConfig();
    const enabledGateways = config.enabledPaymentGateways || [];
    
    const enabledGatewayData = this.paymentGateways.filter(g => enabledGateways.includes(g.id));
    
    const uniqueCurrencies = new Set<string>();
    const uniqueCountries = new Set<string>();
    let totalFees = 0;

    enabledGatewayData.forEach(gateway => {
      gateway.supportedCurrencies.forEach(currency => uniqueCurrencies.add(currency));
      gateway.supportedCountries.forEach(country => uniqueCountries.add(country));
      totalFees += gateway.processingFee;
    });

    return of({
      enabledGateways: enabledGateways.length,
      supportedCurrencies: uniqueCurrencies.size,
      supportedCountries: uniqueCountries.size,
      averageFee: enabledGateways.length > 0 ? Math.round((totalFees / enabledGateways.length) * 100) / 100 : 0
    });
  }
}