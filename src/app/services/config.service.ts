import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../interfaces/config.interface';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig;
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  private configLoaded = false;

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) {
    this.loadConfig();
  }

  /**
   * Load configuration from unified JSON file or localStorage
   */
  private async loadConfig(): Promise<void> {
    try {
      // First try to load from localStorage (user customizations)
      const savedConfig = localStorage.getItem('app-config');

      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        this.configLoaded = true;
        this.configSubject.next(this.config);
        this.syncThemeWithThemeService(this.config.theme);
        return;
      }

      // Load from unified config file
      const configData = await this.http.get<any>('/assets/config/app-config.json').toPromise();

      if (configData) {
        this.config = this.transformUnifiedConfig(configData);
        this.configLoaded = true;
        this.configSubject.next(this.config);
        this.syncThemeWithThemeService(this.config.theme);
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      console.error('Error loading unified config:', error);
      this.config = this.getDefaultConfig();
      this.configLoaded = true;
      this.configSubject.next(this.config);
    }
  }

  /**
   * Transform unified configuration format to AppConfig interface
   */
  private transformUnifiedConfig(unifiedConfig: any): AppConfig {
    return {
      // App Information
      name: unifiedConfig.app?.name || 'DRZN',
      version: unifiedConfig.app?.version || '1.0.0',
      appName: unifiedConfig.app?.appName || 'DRZN Shopping',
      appSlogan: unifiedConfig.app?.appSlogan || 'Shop smarter, not harder',
      storeDescription: unifiedConfig.app?.storeDescription || 'Your premier shopping destination',
      logoUrl: unifiedConfig.app?.logoUrl || '/assets/images/logo.svg',
      splashScreenUrl: unifiedConfig.app?.splashScreenUrl || '/assets/images/splash.svg',

      // Store Configuration
      storeUrl: unifiedConfig.store?.storeUrl || '',
      apiUrl: unifiedConfig.store?.apiUrl || 'wp-json/wc/v3',
      wordpressUrl: unifiedConfig.store?.wordpressUrl || '',
      consumerKey: unifiedConfig.store?.consumerKey || '',
      consumerSecret: unifiedConfig.store?.consumerSecret || '',
      authCode: unifiedConfig.store?.authCode || '',
      jwtAuthUrl: unifiedConfig.store?.jwtAuthUrl || '',

      // Theme Configuration
      theme: {
        primaryColor: unifiedConfig.theme?.primaryColor || '#ffd60a',
        secondaryColor: unifiedConfig.theme?.secondaryColor || '#003566',
        darkMode: unifiedConfig.theme?.darkMode || false
      },

      // Regional Settings
      defaultCurrency: unifiedConfig.regional?.defaultCurrency || 'USD',
      defaultLanguage: unifiedConfig.regional?.defaultLanguage || 'en',
      supportedLanguages: unifiedConfig.regional?.supportedLanguages || ['en', 'ar'],
      countryCode: unifiedConfig.regional?.countryCode || 'US',
      timezone: unifiedConfig.regional?.timezone || 'America/New_York',
      dateFormat: unifiedConfig.regional?.dateFormat || 'MM/dd/yyyy',
      taxRate: unifiedConfig.regional?.taxRate || 0.0,
      shippingEnabled: unifiedConfig.regional?.shippingEnabled !== false,

      // Payment Configuration
      enabledPaymentGateways: unifiedConfig.payment?.enabledPaymentGateways || ['cod'],
      allowDemoCheckout: unifiedConfig.payment?.allowDemoCheckout || false,
      paymentGateways: {
        stripe: {
          publishableKey: unifiedConfig.payment?.gateways?.stripe?.publishableKey || '',
          secretKey: unifiedConfig.payment?.gateways?.stripe?.secretKey || '',
          webhookSecret: unifiedConfig.payment?.gateways?.stripe?.webhookSecret || ''
        },
        paypal: {
          clientId: unifiedConfig.payment?.gateways?.paypal?.clientId || '',
          clientSecret: unifiedConfig.payment?.gateways?.paypal?.clientSecret || '',
          environment: unifiedConfig.payment?.gateways?.paypal?.environment || 'sandbox'
        },
        moyasar: {
          publishableKey: unifiedConfig.payment?.gateways?.moyasar?.publishableKey || '',
          secretKey: unifiedConfig.payment?.gateways?.moyasar?.secretKey || ''
        },
        stcpay: {
          merchantId: unifiedConfig.payment?.gateways?.stcpay?.merchantId || '',
          apiKey: unifiedConfig.payment?.gateways?.stcpay?.apiKey || '',
          environment: unifiedConfig.payment?.gateways?.stcpay?.environment || 'test'
        }
      },

      // SMS Configuration
      smsProviders: Object.keys(unifiedConfig.sms?.providers || {}).filter(key => 
        unifiedConfig.sms?.providers[key]?.enabled
      ),
      defaultSmsProvider: unifiedConfig.sms?.defaultProvider || 'twilio',
      twilioConfig: {
        accountSid: unifiedConfig.sms?.providers?.twilio?.accountSid || '',
        authToken: unifiedConfig.sms?.providers?.twilio?.authToken || '',
        verifyServiceSid: unifiedConfig.sms?.providers?.twilio?.verifyServiceSid || '',
        phoneNumber: unifiedConfig.sms?.providers?.twilio?.phoneNumber || ''
      },
      firebaseConfig: {
        apiKey: unifiedConfig.sms?.providers?.firebase?.apiKey || '',
        authDomain: unifiedConfig.sms?.providers?.firebase?.authDomain || '',
        projectId: unifiedConfig.sms?.providers?.firebase?.projectId || '',
        storageBucket: unifiedConfig.sms?.providers?.firebase?.storageBucket || '',
        messagingSenderId: unifiedConfig.sms?.providers?.firebase?.messagingSenderId || '',
        appId: unifiedConfig.sms?.providers?.firebase?.appId || ''
      },
      messageBirdConfig: {
        apiKey: unifiedConfig.sms?.providers?.messagebird?.apiKey || '',
        sender: unifiedConfig.sms?.providers?.messagebird?.sender || ''
      },
      vonageConfig: {
        apiKey: unifiedConfig.sms?.providers?.vonage?.apiKey || '',
        apiSecret: unifiedConfig.sms?.providers?.vonage?.apiSecret || '',
        phoneNumber: unifiedConfig.sms?.providers?.vonage?.phoneNumber || ''
      },
      awsConfig: {
        accessKeyId: unifiedConfig.sms?.providers?.aws?.accessKeyId || '',
        secretAccessKey: unifiedConfig.sms?.providers?.aws?.secretAccessKey || '',
        region: unifiedConfig.sms?.providers?.aws?.region || 'us-east-1',
        sender: unifiedConfig.sms?.providers?.aws?.sender || ''
      },
      taqnyatConfig: {
        apiKey: unifiedConfig.sms?.providers?.taqnyat?.apiKey || '',
        sender: unifiedConfig.sms?.providers?.taqnyat?.sender || 'DRZN'
      },

      // Notifications
      oneSignalAppId: unifiedConfig.notifications?.oneSignalAppId || '',

      // Features
      features: {
        enablePushNotifications: unifiedConfig.features?.enablePushNotifications !== false,
        enableOtp: unifiedConfig.features?.enableOtp !== false,
        enableWishlist: unifiedConfig.features?.enableWishlist !== false,
        enableReviews: unifiedConfig.features?.enableReviews !== false
      },

      // Payment Methods (legacy compatibility)
      paymentMethods: {
        cod: unifiedConfig.payment?.enabledPaymentGateways?.includes('cod') || false,
        stripe: unifiedConfig.payment?.enabledPaymentGateways?.includes('stripe') || false,
        paypal: unifiedConfig.payment?.enabledPaymentGateways?.includes('paypal') || false,
        moyasar: unifiedConfig.payment?.enabledPaymentGateways?.includes('moyasar') || false
      },

      // Development
      useDemoData: unifiedConfig.development?.useDemoData || false,

      // Legacy fields for backward compatibility
      stripePublishableKey: unifiedConfig.payment?.gateways?.stripe?.publishableKey || '',
      stripeSecretKey: unifiedConfig.payment?.gateways?.stripe?.secretKey || '',
      paypalClientId: unifiedConfig.payment?.gateways?.paypal?.clientId || '',
      paypalClientSecret: unifiedConfig.payment?.gateways?.paypal?.clientSecret || '',
      moyasarPublishableKey: unifiedConfig.payment?.gateways?.moyasar?.publishableKey || '',
      moyasarSecretKey: unifiedConfig.payment?.gateways?.moyasar?.secretKey || '',
      taqnyatApiKey: unifiedConfig.sms?.providers?.taqnyat?.apiKey || '',
      taqnyatSender: unifiedConfig.sms?.providers?.taqnyat?.sender || '',
      authToken: ''
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): any {
    return this.config;
  }

  getConfig$(): Observable<any> {
    return this.configSubject.asObservable();
  }

  /**
   * Get configuration as Observable
   */
  isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  /**
   * Wait for configuration to load
   */
  async waitForConfig(): Promise<AppConfig> {
    if (this.configLoaded) {
      return this.config;
    }

    return new Promise((resolve) => {
      const subscription = this.configSubject.subscribe((config) => {
        if (config && this.configLoaded) {
          subscription.unsubscribe();
          resolve(config);
        }
      });
    });
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
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      name: 'DRZN',
      version: '1.0.0',
      appName: 'DRZN Shopping',
      appSlogan: 'Shop smarter, not harder',
      storeDescription: 'Your premier shopping destination',
      logoUrl: '/assets/images/logo.svg',
      splashScreenUrl: '/assets/images/splash.svg',
      storeUrl: '',
      apiUrl: 'wp-json/wc/v3',
      wordpressUrl: '',
      consumerKey: '',
      consumerSecret: '',
      authCode: '',
      jwtAuthUrl: '',
      theme: {
        primaryColor: '#ffd60a',
        secondaryColor: '#003566',
        darkMode: false
      },
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ar'],
      countryCode: 'US',
      timezone: 'America/New_York',
      dateFormat: 'MM/dd/yyyy',
      taxRate: 0.0,
      shippingEnabled: true,
      enabledPaymentGateways: ['cod'],
      allowDemoCheckout: false,
      smsProviders: ['twilio'],
      defaultSmsProvider: 'twilio',
      twilioConfig: { accountSid: '', authToken: '', verifyServiceSid: '', phoneNumber: '' },
      firebaseConfig: { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' },
      messageBirdConfig: { apiKey: '', sender: '' },
      vonageConfig: { apiKey: '', apiSecret: '', phoneNumber: '' },
      awsConfig: { accessKeyId: '', secretAccessKey: '', region: 'us-east-1', sender: '' },
      taqnyatConfig: { apiKey: '', sender: 'DRZN' },
      oneSignalAppId: '',
      features: { enablePushNotifications: true, enableOtp: true, enableWishlist: true, enableReviews: true },
      paymentMethods: { cod: true, stripe: false, paypal: false, moyasar: false },
      useDemoData: false,
      paymentGateways: {
        stripe: { publishableKey: '', secretKey: '', webhookSecret: '' },
        paypal: { clientId: '', clientSecret: '', environment: 'sandbox' },
        moyasar: { publishableKey: '', secretKey: '' },
        stcpay: { merchantId: '', apiKey: '', environment: 'test' }
      },
      stripePublishableKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalClientSecret: '',
      moyasarPublishableKey: '',
      moyasarSecretKey: '',
      taqnyatApiKey: '',
      taqnyatSender: '',
      authToken: ''
    };
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
   * Reset configuration to defaults from unified config file
   */
  async resetConfig(): Promise<void> {
    try {
      localStorage.removeItem('app-config');
      await this.loadConfig();
    } catch (error) {
      console.error('Error resetting config:', error);
      this.config = this.getDefaultConfig();
      this.configSubject.next(this.config);
    }
  }

  /**
   * Reload configuration from unified config file
   */
  async reloadConfig(): Promise<void> {
    await this.loadConfig();
  }

  /**
   * Get specific configuration section
   */
  getSection(section: string): any {
    return this.config[section as keyof AppConfig];
  }

  /**
   * Update specific configuration section
   */
  updateSection(section: string, data: any): void {
    this.updateConfig({ [section]: data });
  }

  // Legacy compatibility methods
  getStripeConfig() {
    return this.config.paymentGateways?.stripe || { publishableKey: '', secretKey: '', webhookSecret: '' };
  }

  getPayPalConfig() {
    return this.config.paymentGateways?.paypal || { clientId: '', clientSecret: '', environment: 'sandbox' };
  }

  getMoyasarConfig() {
    return this.config.paymentGateways?.moyasar || { publishableKey: '', secretKey: '' };
  }

  getSTCPayConfig() {
    return this.config.paymentGateways?.stcpay || { merchantId: '', apiKey: '', environment: 'test' };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.storeUrl) errors.push('Store URL is required');
    if (!this.config.apiUrl) errors.push('API URL is required');
    if (!this.config.consumerKey) errors.push('Consumer Key is required');
    if (!this.config.consumerSecret) errors.push('Consumer Secret is required');
    if (this.config.enabledPaymentGateways.length === 0) errors.push('At least one payment gateway must be enabled');

    return { isValid: errors.length === 0, errors };
  }
}