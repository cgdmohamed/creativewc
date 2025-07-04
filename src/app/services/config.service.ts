import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfig } from '../interfaces/config.interface';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig;
  private configSubject = new BehaviorSubject<AppConfig | null>(null);

  constructor(private themeService: ThemeService) {
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
    
    // Sync theme changes with ThemeService
    if (newConfig.theme) {
      this.syncThemeWithThemeService(newConfig.theme);
    }
  }

  /**
   * Update theme configuration and sync with ThemeService
   */
  updateTheme(themeConfig: Partial<{ primaryColor: string; secondaryColor: string; darkMode: boolean }>): void {
    const updatedTheme = { ...this.config.theme, ...themeConfig };
    this.updateConfig({ theme: updatedTheme });
  }

  /**
   * Sync theme configuration with ThemeService
   */
  private syncThemeWithThemeService(themeConfig: any): void {
    if (themeConfig.primaryColor) {
      this.themeService.setPrimaryColor(themeConfig.primaryColor);
    }
    if (typeof themeConfig.darkMode === 'boolean') {
      const currentTheme = this.themeService.currentTheme;
      if (currentTheme.darkMode !== themeConfig.darkMode) {
        this.themeService.toggleDarkMode();
      }
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig(): void {
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
      name: 'Your Store Name',
      storeDescription: 'Your Store Description',
      wordpressUrl: 'https://your-store.com',
      authCode: '',
      jwtAuthUrl: 'https://your-store.com/wp-json/simple-jwt-login/v1',
      taqnyatApiKey: '',
      oneSignalAppId: '',

      // App Branding
      appName: 'Your App Name',
      appSlogan: 'Your App Slogan',
      version: '1.0.0',
      theme:{
        darkMode: false,
      primaryColor: '#3880ff',
      secondaryColor: '#3dc2ff',
      },
      logoUrl: 'assets/logo.png',
      splashScreenUrl: 'assets/splash.png',

      // Features
      enabledPaymentGateways: ['stripe', 'paypal'],
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ar', 'es', 'fr', 'de'],
      taxRate: 0.0,
      shippingEnabled: true,

      // Payment Gateway Configuration
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
        phoneNumber: '',
        verifyServiceSid: ''
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
    const configEnvironment = this.config.paymentGateways?.paypal?.environment || 'sandbox';
    return {
      clientId: this.config.paymentGateways?.paypal?.clientId || this.config.paypalClientId || '',
      clientSecret: this.config.paymentGateways?.paypal?.clientSecret || this.config.paypalClientSecret || '',
      environment: configEnvironment === 'live' ? 'live' : 'sandbox'
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
   * Export configuration for backup
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Update primary color
   */
  updatePrimaryColor(color: string): void {
    this.updateTheme({ primaryColor: color });
  }

  /**
   * Update dark mode
   */
  updateDarkMode(darkMode: boolean): void {
    this.updateTheme({ darkMode });
  }

  /**
   * Get current theme configuration
   */
  getThemeConfig() {
    return this.config.theme || {};
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
}