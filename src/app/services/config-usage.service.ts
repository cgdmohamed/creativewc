
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { ThemeService } from './theme.service';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigUsageService {
  private config: any;

  constructor(
    private configService: ConfigService,
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {
    this.configService.getConfig$().subscribe(config => {
      if (config) {
        this.config = config;
        this.validateConfigUsage();
      }
    });
  }

  /**
   * Validate that all configuration properties are properly used
   */
  private validateConfigUsage(): void {
    console.log('🔍 Validating configuration usage...');
    
    // App Configuration
    this.validateAppConfig();
    
    // Store Configuration
    this.validateStoreConfig();
    
    // Theme Configuration
    this.validateThemeConfig();
    
    // Regional Configuration
    this.validateRegionalConfig();
    
    // Payment Configuration
    this.validatePaymentConfig();
    
    // SMS Configuration
    this.validateSmsConfig();
    
    // Notifications Configuration
    this.validateNotificationsConfig();
    
    // Features Configuration
    this.validateFeaturesConfig();
    
    // Development Configuration
    this.validateDevelopmentConfig();
    
    // Security Configuration
    this.validateSecurityConfig();
    
    // Performance Configuration
    this.validatePerformanceConfig();
    
    // Analytics Configuration
    this.validateAnalyticsConfig();
    
    console.log('✅ Configuration validation complete');
  }

  private validateSecurityConfig(): void {
    if (!this.config.security) {
      console.warn('⚠️ Security configuration missing');
      return;
    }
    
    const security = this.config.security;
    console.log('🔒 Security Config:', {
      enableCsrf: security.enableCsrf,
      enableRateLimit: security.enableRateLimit,
      sessionTimeout: security.sessionTimeout,
      maxLoginAttempts: security.maxLoginAttempts
    });
  }

  private validatePerformanceConfig(): void {
    if (!this.config.performance) {
      console.warn('⚠️ Performance configuration missing');
      return;
    }
    
    const performance = this.config.performance;
    console.log('⚡ Performance Config:', {
      enableCaching: performance.enableCaching,
      cacheTimeout: performance.cacheTimeout,
      enableImageOptimization: performance.enableImageOptimization,
      enableLazyLoading: performance.enableLazyLoading
    });
  }

  private validateAnalyticsConfig(): void {
    if (!this.config.analytics) {
      console.warn('⚠️ Analytics configuration missing');
      return;
    }
    
    const analytics = this.config.analytics;
    console.log('📊 Analytics Config:', {
      enableGoogleAnalytics: analytics.enableGoogleAnalytics,
      googleAnalyticsId: analytics.googleAnalyticsId ? '***configured***' : 'not set',
      enableFacebookPixel: analytics.enableFacebookPixel,
      facebookPixelId: analytics.facebookPixelId ? '***configured***' : 'not set'
    });
  }

  private validateAppConfig(): void {
    if (!this.config.app) return;
    
    const app = this.config.app;
    console.log('📱 App Config:', {
      name: app.name,
      version: app.version,
      appName: app.appName,
      appSlogan: app.appSlogan,
      storeDescription: app.storeDescription,
      logoUrl: app.logoUrl,
      splashScreenUrl: app.splashScreenUrl
    });
  }

  private validateStoreConfig(): void {
    if (!this.config.store) return;
    
    const store = this.config.store;
    console.log('🏪 Store Config:', {
      storeUrl: store.storeUrl,
      apiUrl: store.apiUrl,
      wordpressUrl: store.wordpressUrl,
      consumerKey: store.consumerKey ? '***' : 'Not set',
      consumerSecret: store.consumerSecret ? '***' : 'Not set',
      authCode: store.authCode ? '***' : 'Not set',
      jwtAuthUrl: store.jwtAuthUrl
    });
  }

  private validateThemeConfig(): void {
    if (!this.config.theme) return;
    
    const theme = this.config.theme;
    console.log('🎨 Theme Config:', {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      darkMode: theme.darkMode
    });
  }

  private validateRegionalConfig(): void {
    if (!this.config.regional) return;
    
    const regional = this.config.regional;
    console.log('🌍 Regional Config:', {
      defaultCurrency: regional.defaultCurrency,
      defaultLanguage: regional.defaultLanguage,
      supportedLanguages: regional.supportedLanguages,
      countryCode: regional.countryCode,
      timezone: regional.timezone,
      dateFormat: regional.dateFormat,
      taxRate: regional.taxRate,
      shippingEnabled: regional.shippingEnabled
    });
  }

  private validatePaymentConfig(): void {
    if (!this.config.payment) return;
    
    const payment = this.config.payment;
    console.log('💳 Payment Config:', {
      enabledPaymentGateways: payment.enabledPaymentGateways,
      defaultPaymentMethod: payment.defaultPaymentMethod,
      allowDemoCheckout: payment.allowDemoCheckout,
      gateways: Object.keys(payment.gateways || {})
    });
  }

  private validateSmsConfig(): void {
    if (!this.config.sms) return;
    
    const sms = this.config.sms;
    console.log('📱 SMS Config:', {
      enabled: sms.enabled,
      defaultProvider: sms.defaultProvider,
      providers: Object.keys(sms.providers || {})
    });
  }

  private validateNotificationsConfig(): void {
    if (!this.config.notifications) return;
    
    const notifications = this.config.notifications;
    console.log('🔔 Notifications Config:', {
      oneSignalAppId: notifications.oneSignalAppId ? '***' : 'Not set',
      enablePushNotifications: notifications.enablePushNotifications,
      enableEmailNotifications: notifications.enableEmailNotifications,
      enableSmsNotifications: notifications.enableSmsNotifications
    });
  }

  private validateFeaturesConfig(): void {
    if (!this.config.features) return;
    
    const features = this.config.features;
    console.log('⚙️ Features Config:', features);
  }

  private validateDevelopmentConfig(): void {
    if (!this.config.development) return;
    
    const development = this.config.development;
    console.log('🛠️ Development Config:', development);
  }

  private validateSecurityConfig(): void {
    if (!this.config.security) return;
    
    const security = this.config.security;
    console.log('🔒 Security Config:', security);
  }

  private validatePerformanceConfig(): void {
    if (!this.config.performance) return;
    
    const performance = this.config.performance;
    console.log('⚡ Performance Config:', performance);
  }

  private validateAnalyticsConfig(): void {
    if (!this.config.analytics) return;
    
    const analytics = this.config.analytics;
    console.log('📊 Analytics Config:', {
      enableGoogleAnalytics: analytics.enableGoogleAnalytics,
      googleAnalyticsId: analytics.googleAnalyticsId ? '***' : 'Not set',
      enableFacebookPixel: analytics.enableFacebookPixel,
      facebookPixelId: analytics.facebookPixelId ? '***' : 'Not set'
    });
  }

  /**
   * Get configuration value by path
   */
  getConfigValue(path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    return this.config?.features?.[feature] || false;
  }

  /**
   * Get payment gateway configuration
   */
  getPaymentGateway(gateway: string): any {
    return this.config?.payment?.gateways?.[gateway];
  }

  /**
   * Get SMS provider configuration
   */
  getSmsProvider(provider: string): any {
    return this.config?.sms?.providers?.[provider];
  }
}
