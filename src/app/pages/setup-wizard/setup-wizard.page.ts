import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// SMS Provider Configuration Interfaces
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface MessageBirdConfig {
  apiKey: string;
  sender: string;
}

export interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  phoneNumber: string;
}

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sender: string;
}

export interface TaqnyatConfig {
  apiKey: string;
  sender: string;
}

// Payment Gateway Configuration Interface
export interface PaymentGatewayConfig {
  stripe?: {
    publishableKey: string;
    secretKey: string;
    webhookSecret?: string;
  };
  paypal?: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'live';
  };
  moyasar?: {
    publishableKey: string;
    secretKey: string;
  };
  stcpay?: {
    merchantId: string;
    apiKey: string;
    environment: 'test' | 'production';
  };
}

// Main App Configuration Interface
export interface AppConfig {
  // Store Configuration
  storeUrl: string;
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  storeName: string;
  storeDescription: string;
  
  // App Branding
  appName: string;
  appSlogan: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  splashScreenUrl: string;
  
  // Features
  enabledPaymentGateways: string[];
  defaultCurrency: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  taxRate: number;
  shippingEnabled: boolean;
  
  // Payment Gateway Configuration
  paymentGateways?: PaymentGatewayConfig;
  
  // Legacy payment config for backward compatibility
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  moyasarPublishableKey?: string;
  moyasarSecretKey?: string;
  authToken?: string;
  
  // SMS Provider Configuration
  smsProviders?: string[];
  defaultSmsProvider?: string;
  twilioConfig?: TwilioConfig;
  firebaseConfig?: FirebaseConfig;
  messageBirdConfig?: MessageBirdConfig;
  vonageConfig?: VonageConfig;
  awsConfig?: AwsConfig;
  taqnyatConfig?: TaqnyatConfig;
  
  // OneSignal Configuration
  oneSignalAppId?: string;
  
  // Regional Settings
  countryCode: string;
  timezone: string;
  dateFormat: string;
  
  // Demo Mode
  useDemoData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig;
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  
  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from localStorage or use default
   */
  private loadConfig(): void {
    const savedConfig = localStorage.getItem('app-config');
    
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
      } catch (error) {
        console.error('Error parsing saved config:', error);
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
    }
    
    this.configSubject.next(this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get configuration as Observable
   */
  getConfig$(): Observable<AppConfig | null> {
    return this.configSubject.asObservable();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('app-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    this.config = this.getDefaultConfig();
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      // Store Configuration
      storeUrl: 'https://your-store.com',
      apiUrl: 'https://your-store.com/wp-json/wc/v3',
      consumerKey: '',
      consumerSecret: '',
      storeName: 'Your Store Name',
      storeDescription: 'Your Store Description',
      
      // App Branding
      appName: 'Your App Name',
      appSlogan: 'Your App Slogan',
      primaryColor: '#3880ff',
      secondaryColor: '#3dc2ff',
      logoUrl: 'assets/logo.png',
      splashScreenUrl: 'assets/splash.png',
      
      // Features
      enabledPaymentGateways: ['stripe', 'paypal'],
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ar', 'es', 'fr', 'de'],
      taxRate: 0.0,
      shippingEnabled: true,
      
      // Payment Gateway Configuration (new structure)
      paymentGateways: {
        stripe: {
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        },
        paypal: {
          clientId: '',
          clientSecret: '',
          environment: 'sandbox'
        },
        moyasar: {
          publishableKey: '',
          secretKey: ''
        },
        stcpay: {
          merchantId: '',
          apiKey: '',
          environment: 'test'
        }
      },
      
      // Legacy payment config (for backward compatibility)
      stripePublishableKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalClientSecret: '',
      moyasarPublishableKey: '',
      moyasarSecretKey: '',
      authToken: '',
      
      // SMS Provider Configuration
      smsProviders: ['twilio'],
      defaultSmsProvider: 'twilio',
      twilioConfig: {
        accountSid: '',
        authToken: '',
        phoneNumber: ''
      },
      firebaseConfig: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      },
      messageBirdConfig: {
        apiKey: '',
        sender: ''
      },
      vonageConfig: {
        apiKey: '',
        apiSecret: '',
        phoneNumber: ''
      },
      awsConfig: {
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us-east-1',
        sender: ''
      },
      taqnyatConfig: {
        apiKey: '',
        sender: ''
      },
      
      // OneSignal Configuration
      oneSignalAppId: '',
      
      // Regional Settings
      countryCode: 'US',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      
      // Demo Mode
      useDemoData: false
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate store configuration
    if (!this.config.storeUrl) {
      errors.push('Store URL is required');
    }
    
    if (!this.config.apiUrl) {
      errors.push('API URL is required');
    }
    
    if (!this.config.consumerKey) {
      errors.push('Consumer Key is required');
    }
    
    if (!this.config.consumerSecret) {
      errors.push('Consumer Secret is required');
    }
    
    // Validate payment gateways
    if (this.config.enabledPaymentGateways.length === 0) {
      errors.push('At least one payment gateway must be enabled');
    }
    
    // Validate enabled payment gateways configuration
    this.config.enabledPaymentGateways.forEach(gateway => {
      switch (gateway) {
        case 'stripe':
          if (!this.getStripeConfig().publishableKey) {
            errors.push('Stripe publishable key is required');
          }
          if (!this.getStripeConfig().secretKey) {
            errors.push('Stripe secret key is required');
          }
          break;
        case 'paypal':
          if (!this.getPayPalConfig().clientId) {
            errors.push('PayPal client ID is required');
          }
          if (!this.getPayPalConfig().clientSecret) {
            errors.push('PayPal client secret is required');
          }
          break;
        case 'moyasar':
          if (!this.getMoyasarConfig().publishableKey) {
            errors.push('Moyasar publishable key is required');
          }
          if (!this.getMoyasarConfig().secretKey) {
            errors.push('Moyasar secret key is required');
          }
          break;
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get Stripe configuration (with backward compatibility)
   */
  getStripeConfig(): { publishableKey: string; secretKey: string; webhookSecret?: string } {
    return {
      publishableKey: this.config.paymentGateways?.stripe?.publishableKey || this.config.stripePublishableKey || '',
      secretKey: this.config.paymentGateways?.stripe?.secretKey || this.config.stripeSecretKey || '',
      webhookSecret: this.config.paymentGateways?.stripe?.webhookSecret || ''
    };
  }

  /**
   * Get PayPal configuration (with backward compatibility)
   */
  getPayPalConfig(): { clientId: string; clientSecret: string; environment: 'sandbox' | 'live' } {
    return {
      clientId: this.config.paymentGateways?.paypal?.clientId || this.config.paypalClientId || '',
      clientSecret: this.config.paymentGateways?.paypal?.clientSecret || this.config.paypalClientSecret || '',
      environment: this.config.paymentGateways?.paypal?.environment || 'sandbox'
    };
  }

  /**
   * Get Moyasar configuration (with backward compatibility)
   */
  getMoyasarConfig(): { publishableKey: string; secretKey: string } {
    return {
      publishableKey: this.config.paymentGateways?.moyasar?.publishableKey || this.config.moyasarPublishableKey || '',
      secretKey: this.config.paymentGateways?.moyasar?.secretKey || this.config.moyasarSecretKey || ''
    };
  }

  /**
   * Get STC Pay configuration
   */
  getSTCPayConfig(): { merchantId: string; apiKey: string; environment: 'test' | 'production' } {
    return {
      merchantId: this.config.paymentGateways?.stcpay?.merchantId || '',
      apiKey: this.config.paymentGateways?.stcpay?.apiKey || '',
      environment: this.config.paymentGateways?.stcpay?.environment || 'test'
    };
  }

  /**
   * Get SMS provider configuration
   */
  getSMSProviderConfig(provider: string): any {
    switch (provider) {
      case 'twilio':
        return this.config.twilioConfig;
      case 'firebase':
        return this.config.firebaseConfig;
      case 'messagebird':
        return this.config.messageBirdConfig;
      case 'vonage':
        return this.config.vonageConfig;
      case 'aws':
        return this.config.awsConfig;
      case 'taqnyat':
        return this.config.taqnyatConfig;
      default:
        return null;
    }
  }

  /**
   * Update payment gateway configuration
   */
  updatePaymentGateway(gateway: string, config: any): void {
    if (!this.config.paymentGateways) {
      this.config.paymentGateways = {};
    }
    
    this.config.paymentGateways[gateway as keyof PaymentGatewayConfig] = config;
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  /**
   * Update SMS provider configuration
   */
  updateSMSProvider(provider: string, config: any): void {
    switch (provider) {
      case 'twilio':
        this.config.twilioConfig = config;
        break;
      case 'firebase':
        this.config.firebaseConfig = config;
        break;
      case 'messagebird':
        this.config.messageBirdConfig = config;
        break;
      case 'vonage':
        this.config.vonageConfig = config;
        break;
      case 'aws':
        this.config.awsConfig = config;
        break;
      case 'taqnyat':
        this.config.taqnyatConfig = config;
        break;
    }
    
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  /**
   * Test store connection
   */
  async testStoreConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.storeUrl}/wp-json/wc/v3/system_status`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`)}`
        }
      });

      if (response.ok) {
        return { success: true, message: 'Store connection successful' };
      } else {
        return { success: false, message: `Connection failed: ${response.status}` };
      }
    } catch (error: any) {
      return { success: false, message: `Connection error: ${error.message}` };
    }
  }

  /**
   * Get regional payment gateway recommendations
   */
  getRegionalPaymentRecommendations(countryCode: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      // North America
      'US': ['stripe', 'paypal'],
      'CA': ['stripe', 'paypal'],
      
      // Europe
      'GB': ['stripe', 'paypal'],
      'DE': ['stripe', 'paypal'],
      'FR': ['stripe', 'paypal'],
      'ES': ['stripe', 'paypal'],
      'IT': ['stripe', 'paypal'],
      'NL': ['stripe', 'paypal'],
      
      // Middle East
      'SA': ['moyasar', 'stripe'],
      'AE': ['moyasar', 'stripe'],
      'KW': ['moyasar', 'stripe'],
      'QA': ['moyasar', 'stripe'],
      'BH': ['moyasar', 'stripe'],
      'OM': ['moyasar', 'stripe'],
      
      // Asia Pacific
      'AU': ['stripe', 'paypal'],
      'NZ': ['stripe', 'paypal'],
      'SG': ['stripe', 'paypal'],
      'JP': ['stripe', 'paypal'],
      'KR': ['stripe', 'paypal'],
      
      // Default
      'DEFAULT': ['stripe', 'paypal']
    };

    return recommendations[countryCode] || recommendations['DEFAULT'];
  }

  /**
   * Get supported currencies for country
   */
  getSupportedCurrencies(countryCode: string): string[] {
    const currencies: { [key: string]: string[] } = {
      'US': ['USD'],
      'CA': ['CAD', 'USD'],
      'GB': ['GBP', 'EUR', 'USD'],
      'DE': ['EUR', 'USD'],
      'FR': ['EUR', 'USD'],
      'ES': ['EUR', 'USD'],
      'IT': ['EUR', 'USD'],
      'NL': ['EUR', 'USD'],
      'SA': ['SAR', 'USD'],
      'AE': ['AED', 'USD'],
      'KW': ['KWD', 'USD'],
      'QA': ['QAR', 'USD'],
      'BH': ['BHD', 'USD'],
      'OM': ['OMR', 'USD'],
      'AU': ['AUD', 'USD'],
      'NZ': ['NZD', 'USD'],
      'SG': ['SGD', 'USD'],
      'JP': ['JPY', 'USD'],
      'KR': ['KRW', 'USD']
    };

    return currencies[countryCode] || ['USD'];
  }

  /**
   * Export configuration for backup
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from backup
   */
  importConfig(configJson: string): { success: boolean; message: string } {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate imported config structure
      if (!importedConfig.storeUrl || !importedConfig.appName) {
        return { success: false, message: 'Invalid configuration file' };
      }
      
      this.config = { ...this.getDefaultConfig(), ...importedConfig };
      this.saveConfig();
      this.configSubject.next(this.config);
      
      return { success: true, message: 'Configuration imported successfully' };
    } catch (error: any) {
      return { success: false, message: `Import failed: ${error.message}` };
    }
  }

  /**
   * Check if setup is complete
   */
  isSetupComplete(): boolean {
    const validation = this.validateConfig();
    return validation.isValid;
  }

  /**
   * Get setup completion percentage
   */
  getSetupCompletionPercentage(): number {
    const requiredFields = [
      'storeUrl', 'apiUrl', 'consumerKey', 'consumerSecret',
      'appName', 'storeName'
    ];
    
    let completedFields = 0;
    requiredFields.forEach(field => {
      if (this.config[field as keyof AppConfig]) {
        completedFields++;
      }
    });
    
    // Check if at least one payment gateway is configured
    if (this.config.enabledPaymentGateways.length > 0) {
      completedFields++;
    }
    
    return Math.round((completedFields / (requiredFields.length + 1)) * 100);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { AppConfig } from '../../interfaces/config.interface';

@Component({
  selector: 'app-setup-wizard',
  templateUrl: './setup-wizard.page.html',
  styleUrls: ['./setup-wizard.page.scss'],
})
export class SetupWizardPage implements OnInit {
  config: AppConfig;
  currentStep = 1;
  totalSteps = 4;

  constructor(
    private configService: ConfigService,
    private router: Router
  ) {
    this.config = this.configService.getConfig();
  }

  ngOnInit() {
    // Check if setup is already complete
    if (this.configService.isSetupComplete()) {
      this.router.navigate(['/home']);
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  saveAndContinue() {
    this.configService.saveConfig();
    this.nextStep();
  }

  completeSetup() {
    this.configService.saveConfig();
    this.router.navigate(['/home']);
  }

  getSetupProgress(): number {
    return this.configService.getSetupCompletionPercentage();
  }
}