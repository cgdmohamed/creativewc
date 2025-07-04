
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { LanguageService } from './language.service';
import { Storage } from '@ionic/storage-angular';

export interface RegionalConfig {
  defaultCurrency: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  countryCode: string;
  timezone: string;
  dateFormat: string;
  taxRate: number;
  shippingEnabled: boolean;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  rtlPosition?: 'before' | 'after';
}

export interface RegionInfo {
  country: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  isRtlRegion: boolean;
  supportedLanguages: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RegionalService {
  private regionalConfig: RegionalConfig;
  private regionalConfigSubject = new BehaviorSubject<RegionalConfig | null>(null);
  private currentRegionSubject = new BehaviorSubject<RegionInfo | null>(null);
  
  private readonly REGIONAL_STORAGE_KEY = 'regional_settings';
  
  // Currency definitions with RTL support
  private currencies: { [key: string]: CurrencyInfo } = {
    'USD': { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
    'EUR': { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
    'GBP': { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
    'SAR': { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', position: 'after', rtlPosition: 'before' },
    'AED': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', position: 'after', rtlPosition: 'before' },
    'QAR': { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', position: 'after', rtlPosition: 'before' },
    'KWD': { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', position: 'after', rtlPosition: 'before' },
    'BHD': { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', position: 'after', rtlPosition: 'before' },
    'OMR': { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', position: 'after', rtlPosition: 'before' },
    'JOD': { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar', position: 'after', rtlPosition: 'before' },
    'EGP': { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', position: 'after', rtlPosition: 'before' }
  };

  // Region definitions
  private regions: { [key: string]: RegionInfo } = {
    'US': {
      country: 'United States',
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/dd/yyyy',
      isRtlRegion: false,
      supportedLanguages: ['en', 'es']
    },
    'SA': {
      country: 'Saudi Arabia',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'AE': {
      country: 'United Arab Emirates',
      currency: 'AED',
      timezone: 'Asia/Dubai',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'QA': {
      country: 'Qatar',
      currency: 'QAR',
      timezone: 'Asia/Qatar',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'KW': {
      country: 'Kuwait',
      currency: 'KWD',
      timezone: 'Asia/Kuwait',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'BH': {
      country: 'Bahrain',
      currency: 'BHD',
      timezone: 'Asia/Bahrain',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'OM': {
      country: 'Oman',
      currency: 'OMR',
      timezone: 'Asia/Muscat',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'JO': {
      country: 'Jordan',
      currency: 'JOD',
      timezone: 'Asia/Amman',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'EG': {
      country: 'Egypt',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: true,
      supportedLanguages: ['ar', 'en']
    },
    'GB': {
      country: 'United Kingdom',
      currency: 'GBP',
      timezone: 'Europe/London',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: false,
      supportedLanguages: ['en']
    },
    'DE': {
      country: 'Germany',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      dateFormat: 'dd.MM.yyyy',
      isRtlRegion: false,
      supportedLanguages: ['de', 'en']
    },
    'FR': {
      country: 'France',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: false,
      supportedLanguages: ['fr', 'en']
    },
    'ES': {
      country: 'Spain',
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      dateFormat: 'dd/MM/yyyy',
      isRtlRegion: false,
      supportedLanguages: ['es', 'en']
    }
  };

  constructor(
    private configService: ConfigService,
    private languageService: LanguageService,
    private storage: Storage
  ) {
    this.init();
  }

  private async init(): Promise<void> {
    // Load configuration
    this.configService.getConfig$().subscribe(config => {
      if (config?.regional) {
        this.regionalConfig = config.regional;
        this.regionalConfigSubject.next(this.regionalConfig);
        this.updateCurrentRegion();
      }
    });

    // Load saved regional settings
    const savedSettings = await this.storage.get(this.REGIONAL_STORAGE_KEY);
    if (savedSettings) {
      this.applyRegionalSettings(savedSettings);
    }
  }

  /**
   * Get regional configuration as observable
   */
  get regionalConfig$(): Observable<RegionalConfig | null> {
    return this.regionalConfigSubject.asObservable();
  }

  /**
   * Get current region info as observable
   */
  get currentRegion$(): Observable<RegionInfo | null> {
    return this.currentRegionSubject.asObservable();
  }

  /**
   * Get current regional configuration
   */
  getCurrentRegionalConfig(): RegionalConfig | null {
    return this.regionalConfig;
  }

  /**
   * Get current region info
   */
  getCurrentRegion(): RegionInfo | null {
    return this.currentRegionSubject.value;
  }

  /**
   * Update current region based on country code
   */
  private updateCurrentRegion(): void {
    if (!this.regionalConfig) return;

    const regionInfo = this.regions[this.regionalConfig.countryCode] || {
      country: 'Unknown',
      currency: this.regionalConfig.defaultCurrency,
      timezone: this.regionalConfig.timezone,
      dateFormat: this.regionalConfig.dateFormat,
      isRtlRegion: this.isRtlLanguage(this.regionalConfig.defaultLanguage),
      supportedLanguages: this.regionalConfig.supportedLanguages
    };

    this.currentRegionSubject.next(regionInfo);
  }

  /**
   * Check if language is RTL
   */
  private isRtlLanguage(lang: string): boolean {
    const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
    return rtlLanguages.includes(lang);
  }

  /**
   * Get currency information
   */
  getCurrencyInfo(currencyCode: string): CurrencyInfo {
    return this.currencies[currencyCode] || {
      code: currencyCode,
      symbol: currencyCode,
      name: currencyCode,
      position: 'before'
    };
  }

  /**
   * Format currency amount with proper RTL/LTR support
   */
  formatCurrency(amount: number, currencyCode?: string, isRtl?: boolean): string {
    const currency = currencyCode || this.regionalConfig?.defaultCurrency || 'USD';
    const currencyInfo = this.getCurrencyInfo(currency);
    const isRtlContext = isRtl !== undefined ? isRtl : this.languageService.isRTL();
    
    // Determine symbol position based on context
    let position = currencyInfo.position;
    if (isRtlContext && currencyInfo.rtlPosition) {
      position = currencyInfo.rtlPosition;
    }

    const formattedAmount = this.formatNumber(amount);
    
    if (position === 'before') {
      return `${currencyInfo.symbol} ${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  }

  /**
   * Format number with proper locale support
   */
  formatNumber(amount: number): string {
    const locale = this.getNumberFormatLocale();
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get number format locale based on region and language
   */
  private getNumberFormatLocale(): string {
    const language = this.regionalConfig?.defaultLanguage || 'en';
    const country = this.regionalConfig?.countryCode || 'US';
    
    // Map to proper locale strings
    const localeMap: { [key: string]: string } = {
      'ar-SA': 'ar-SA',
      'ar-AE': 'ar-AE',
      'ar-QA': 'ar-QA',
      'ar-KW': 'ar-KW',
      'ar-BH': 'ar-BH',
      'ar-OM': 'ar-OM',
      'ar-JO': 'ar-JO',
      'ar-EG': 'ar-EG',
      'en-US': 'en-US',
      'en-GB': 'en-GB',
      'en-SA': 'en-SA',
      'de-DE': 'de-DE',
      'fr-FR': 'fr-FR',
      'es-ES': 'es-ES'
    };

    const localeKey = `${language}-${country}`;
    return localeMap[localeKey] || localeMap[language] || 'en-US';
  }

  /**
   * Format date with regional settings
   */
  formatDate(date: Date): string {
    const dateFormat = this.regionalConfig?.dateFormat || 'MM/dd/yyyy';
    const locale = this.getNumberFormatLocale();
    
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      // Fallback to simple format
      return date.toLocaleDateString();
    }
  }

  /**
   * Get supported currencies for current region
   */
  getSupportedCurrencies(): CurrencyInfo[] {
    const currentRegion = this.getCurrentRegion();
    if (!currentRegion) {
      return Object.values(this.currencies);
    }

    // Return currencies relevant to the region
    const regionCurrencies = [currentRegion.currency];
    
    // Add common international currencies
    if (!regionCurrencies.includes('USD')) regionCurrencies.push('USD');
    if (!regionCurrencies.includes('EUR')) regionCurrencies.push('EUR');
    
    return regionCurrencies.map(code => this.getCurrencyInfo(code));
  }

  /**
   * Update regional settings
   */
  async updateRegionalSettings(settings: Partial<RegionalConfig>): Promise<void> {
    if (!this.regionalConfig) return;

    const updatedConfig = { ...this.regionalConfig, ...settings };
    
    // Update configuration service
    this.configService.updateSection('regional', updatedConfig);
    
    // Save to storage
    await this.storage.set(this.REGIONAL_STORAGE_KEY, updatedConfig);
    
    // Update local state
    this.regionalConfig = updatedConfig;
    this.regionalConfigSubject.next(updatedConfig);
    this.updateCurrentRegion();

    // If language changed, update language service
    if (settings.defaultLanguage) {
      await this.languageService.setLanguage(settings.defaultLanguage);
    }
  }

  /**
   * Apply saved regional settings
   */
  private async applyRegionalSettings(settings: Partial<RegionalConfig>): Promise<void> {
    if (settings.defaultLanguage) {
      await this.languageService.setLanguage(settings.defaultLanguage);
    }
  }

  /**
   * Get tax amount
   */
  calculateTax(amount: number): number {
    const taxRate = this.regionalConfig?.taxRate || 0;
    return amount * taxRate;
  }

  /**
   * Get shipping status
   */
  isShippingEnabled(): boolean {
    return this.regionalConfig?.shippingEnabled !== false;
  }

  /**
   * Get timezone
   */
  getTimezone(): string {
    return this.regionalConfig?.timezone || 'UTC';
  }

  /**
   * Check if current region is RTL
   */
  isCurrentRegionRtl(): boolean {
    const currentRegion = this.getCurrentRegion();
    return currentRegion?.isRtlRegion || false;
  }

  /**
   * Get available regions
   */
  getAvailableRegions(): RegionInfo[] {
    return Object.values(this.regions);
  }

  /**
   * Set region by country code
   */
  async setRegion(countryCode: string): Promise<void> {
    const regionInfo = this.regions[countryCode];
    if (!regionInfo) {
      console.warn(`Region ${countryCode} not supported`);
      return;
    }

    await this.updateRegionalSettings({
      countryCode,
      defaultCurrency: regionInfo.currency,
      timezone: regionInfo.timezone,
      dateFormat: regionInfo.dateFormat
    });
  }
}
