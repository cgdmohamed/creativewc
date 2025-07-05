
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { ThemeService } from './theme.service';
import { LanguageService } from './language.service';
import { RegionalService } from './regional.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigUsageService {
  private config: any;

  constructor(
    private configService: ConfigService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private regionalService: RegionalService
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
    if (!this.config.storeUrl && !this.config.store) {
      console.warn('⚠️ Store configuration missing');
      return;
    }
    
    const store = this.config.store || {
      storeUrl: this.config.storeUrl,
      apiUrl: this.config.apiUrl,
      wordpressUrl: this.config.wordpressUrl,
      consumerKey: this.config.consumerKey,
      consumerSecret: this.config.consumerSecret,
      authCode: this.config.authCode,
      jwtAuthUrl: this.config.jwtAuthUrl
    };
    console.log('🏪 Store Config:', {
      storeUrl: store.storeUrl || 'Not set',
      apiUrl: store.apiUrl || 'Not set',
      wordpressUrl: store.wordpressUrl || 'Not set',
      consumerKey: store.consumerKey ? '***configured***' : 'Not set',
      consumerSecret: store.consumerSecret ? '***configured***' : 'Not set',
      authCode: store.authCode ? '***configured***' : 'Not set',
      jwtAuthUrl: store.jwtAuthUrl || 'Not set'
    });

    // Validate required store fields
    const requiredFields = ['storeUrl', 'apiUrl', 'consumerKey', 'consumerSecret'];
    const missingFields = requiredFields.filter(field => !store[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing required store configuration fields:', missingFields);
    } else {
      console.log('✅ All required store configuration fields are present');
    }
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
    if (!this.config.defaultCurrency && !this.config.regional) {
      console.warn('⚠️ Regional configuration missing');
      return;
    }
    
    const regional = this.config.regional || {
      defaultCurrency: this.config.defaultCurrency,
      defaultLanguage: this.config.defaultLanguage,
      supportedLanguages: this.config.supportedLanguages,
      countryCode: this.config.countryCode,
      timezone: this.config.timezone,
      dateFormat: this.config.dateFormat,
      taxRate: this.config.taxRate,
      shippingEnabled: this.config.shippingEnabled
    };
    console.log('🌍 Regional Config:', {
      defaultCurrency: regional.defaultCurrency || 'USD',
      defaultLanguage: regional.defaultLanguage || 'en',
      supportedLanguages: regional.supportedLanguages || ['en', 'ar'],
      countryCode: regional.countryCode || 'US',
      timezone: regional.timezone || 'UTC',
      dateFormat: regional.dateFormat || 'MM/dd/yyyy',
      taxRate: regional.taxRate || 0.0,
      shippingEnabled: regional.shippingEnabled !== false
    });

    // Validate required regional fields
    const requiredFields = ['defaultCurrency', 'defaultLanguage', 'supportedLanguages'];
    const missingFields = requiredFields.filter(field => !regional[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing required regional configuration fields:', missingFields);
    } else {
      console.log('✅ All required regional configuration fields are present');
    }

    // Validate RTL/LTR language support
    this.validateLanguageDirectionSupport(regional);
    
    // Test regional service integration
    this.validateRegionalServiceIntegration();
  }

  private validateLanguageDirectionSupport(regional: any): void {
    const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
    const ltrLanguages = ['en', 'es', 'fr', 'de'];
    
    const supportedLanguages = regional.supportedLanguages || [];
    const hasRtlLanguages = supportedLanguages.some((lang: string) => rtlLanguages.includes(lang));
    const hasLtrLanguages = supportedLanguages.some((lang: string) => ltrLanguages.includes(lang));
    
    console.log('🔄 Language Direction Support:', {
      supportedLanguages: supportedLanguages,
      hasRtlSupport: hasRtlLanguages,
      hasLtrSupport: hasLtrLanguages,
      defaultLanguageDirection: rtlLanguages.includes(regional.defaultLanguage) ? 'RTL' : 'LTR',
      rtlLanguagesSupported: supportedLanguages.filter((lang: string) => rtlLanguages.includes(lang)),
      ltrLanguagesSupported: supportedLanguages.filter((lang: string) => ltrLanguages.includes(lang))
    });

    if (hasRtlLanguages) {
      console.log('✅ RTL language support detected - RTL styles and services should be active');
    }
    
    if (hasLtrLanguages) {
      console.log('✅ LTR language support detected');
    }
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
    const security = this.config.security;
    if (!security) {
      console.warn('⚠️ Security configuration missing - using defaults');
      console.log('🔒 Security Config: Using default security settings');
      return;
    }
    console.log('🔒 Security Config:', {
      enableCsrf: security.enableCsrf,
      enableRateLimit: security.enableRateLimit,
      sessionTimeout: security.sessionTimeout,
      maxLoginAttempts: security.maxLoginAttempts
    });
  }

  private validatePerformanceConfig(): void {
    const performance = this.config.performance;
    if (!performance) {
      console.warn('⚠️ Performance configuration missing - using defaults');
      console.log('⚡ Performance Config: Using default performance settings');
      return;
    }
    console.log('⚡ Performance Config:', {
      enableCaching: performance.enableCaching,
      cacheTimeout: performance.cacheTimeout,
      enableImageOptimization: performance.enableImageOptimization,
      enableLazyLoading: performance.enableLazyLoading
    });
  }

  private validateAnalyticsConfig(): void {
    const analytics = this.config.analytics;
    if (!analytics) {
      console.warn('⚠️ Analytics configuration missing - using defaults');
      console.log('📊 Analytics Config: Using default analytics settings');
      return;
    }
    console.log('📊 Analytics Config:', {
      enableGoogleAnalytics: analytics.enableGoogleAnalytics,
      googleAnalyticsId: analytics.googleAnalyticsId ? '***configured***' : 'not set',
      enableFacebookPixel: analytics.enableFacebookPixel,
      facebookPixelId: analytics.facebookPixelId ? '***configured***' : 'not set'
    });
  }

  private validateRegionalServiceIntegration(): void {
    const currentRegion = this.regionalService.getCurrentRegion();
    const regionalConfig = this.regionalService.getCurrentRegionalConfig();
    
    console.log('🏛️ Regional Service Integration:', {
      currentRegion: currentRegion?.country || 'Not set',
      currentCurrency: regionalConfig?.defaultCurrency || 'Not set',
      currentLanguage: regionalConfig?.defaultLanguage || 'Not set',
      isRtlRegion: this.regionalService.isCurrentRegionRtl(),
      shippingEnabled: this.regionalService.isShippingEnabled(),
      timezone: this.regionalService.getTimezone(),
      availableRegions: this.regionalService.getAvailableRegions().map(r => r.country),
      supportedCurrencies: this.regionalService.getSupportedCurrencies().map(c => c.code)
    });

    // Test currency formatting
    if (regionalConfig?.defaultCurrency) {
      const testAmount = 123.45;
      const formattedCurrency = this.regionalService.formatCurrency(testAmount);
      console.log('💰 Currency Formatting Test:', {
        amount: testAmount,
        formatted: formattedCurrency,
        currency: regionalConfig.defaultCurrency
      });
    }

    // Test date formatting
    const testDate = new Date(2024, 0, 15);
    const formattedDate = this.regionalService.formatDate(testDate);
    console.log('📅 Date Formatting Test:', {
      date: testDate.toISOString(),
      formatted: formattedDate,
      format: regionalConfig?.dateFormat || 'Default'
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
