import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { ConfigService } from '../../services/config.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { RegionalService } from '../../services/regional.service';

@Component({
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ 'SETTINGS' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <!-- App Information -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ 'APP_INFO' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="phone-portrait-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ config?.app?.appName || config?.appName || 'DRZN Shopping' }}</h3>
              <p>{{ config?.app?.appSlogan || config?.appSlogan || 'Shop smarter, not harder' }}</p>
              <p>{{ 'Version' | translate }}: {{ config?.app?.version || config?.version || '1.0.0' }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="storefront-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'STORE_INFO' | translate }}</h3>
              <p>{{ config?.app?.storeDescription || config?.storeDescription || 'Your premier shopping destination' }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Regional Settings -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ 'REGIONAL_SETTINGS' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item button (click)="changeLanguage()">
            <ion-icon name="language-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'LANGUAGE' | translate }}</h3>
              <p>{{ 'Current' | translate }}: {{ currentLanguage | uppercase }}</p>
              <p>{{ 'Supported' | translate }}: {{ getSupportedLanguages() }}</p>
            </ion-label>
          </ion-item>

          <ion-item button (click)="changeCurrency()">
            <ion-icon name="cash-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'CURRENCY' | translate }}</h3>
              <p>{{ getCurrentCurrencyDisplay() }}</p>
            </ion-label>
          </ion-item>

          <ion-item button (click)="changeRegion()">
            <ion-icon name="globe-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'REGION' | translate }}</h3>
              <p>{{ getCurrentRegionDisplay() }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'DATE_FORMAT' | translate }}</h3>
              <p>{{ config?.regional?.dateFormat || 'MM/dd/yyyy' }} ({{ getSampleDate() }})</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="time-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'TIMEZONE' | translate }}</h3>
              <p>{{ config?.regional?.timezone || 'UTC' }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="calculator-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'TAX_RATE' | translate }}</h3>
              <p>{{ getTaxRateDisplay() }}%</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="car-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'SHIPPING' | translate }}</h3>
              <p>{{ config?.regional?.shippingEnabled ? ('ENABLED' | translate) : ('DISABLED' | translate) }}</p>
            </ion-label>
            <ion-toggle 
              [checked]="config?.regional?.shippingEnabled !== false" 
              (ionChange)="toggleShipping($event)">
            </ion-toggle>
          </ion-item>

          <ion-item>
            <ion-icon name="swap-horizontal-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'TEXT_DIRECTION' | translate }}</h3>
              <p>{{ getTextDirectionDisplay() }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="location-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'REGION' | translate }}</h3>
              <p>{{ 'Country' | translate }}: {{ config?.regional?.countryCode || 'US' }}</p>
              <p>{{ 'Timezone' | translate }}: {{ config?.regional?.timezone || 'UTC' }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Theme Settings -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ 'THEME_SETTINGS' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="moon-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'DARK_MODE' | translate }}</h3>
              <p>{{ 'Toggle dark mode appearance' | translate }}</p>
            </ion-label>
            <ion-toggle 
              [checked]="isDarkMode" 
              (ionChange)="toggleDarkMode($event)">
            </ion-toggle>
          </ion-item>

          <ion-item>
            <ion-icon name="color-palette-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'THEME_COLORS' | translate }}</h3>
              <p>{{ 'Primary' | translate }}: {{ config?.theme?.primaryColor || '#ffd60a' }}</p>
              <p>{{ 'Secondary' | translate }}: {{ config?.theme?.secondaryColor || '#003566' }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Features -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ 'FEATURES' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="heart-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'WISHLIST' | translate }}</h3>
              <p>{{ getFeatureStatus('enableWishlist') }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="star-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'REVIEWS' | translate }}</h3>
              <p>{{ getFeatureStatus('enableReviews') }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="notifications-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'NOTIFICATIONS' | translate }}</h3>
              <p>{{ 'Push' | translate }}: {{ getNotificationStatus('enablePushNotifications') }}</p>
              <p>{{ 'SMS' | translate }}: {{ getNotificationStatus('enableSmsNotifications') }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="card-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'PAYMENT_METHODS' | translate }}</h3>
              <p>{{ getEnabledPaymentMethods() }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Development Settings -->
        <ion-item-group *ngIf="config?.development">
          <ion-item-divider>
            <ion-label>{{ 'DEVELOPMENT' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="code-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'DEVELOPMENT_MODE' | translate }}</h3>
              <p>{{ 'Demo Data' | translate }}: {{ config.development.useDemoData ? 'Enabled' : 'Disabled' }}</p>
              <p>{{ 'Debug Mode' | translate }}: {{ config.development.enableDebugMode ? 'Enabled' : 'Disabled' }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Security Settings -->
        <ion-item-group *ngIf="config?.security">
          <ion-item-divider>
            <ion-label>{{ 'SECURITY' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="shield-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'SECURITY_SETTINGS' | translate }}</h3>
              <p>{{ 'CSRF Protection' | translate }}: {{ config.security.enableCsrf ? 'Enabled' : 'Disabled' }}</p>
              <p>{{ 'Rate Limiting' | translate }}: {{ config.security.enableRateLimit ? 'Enabled' : 'Disabled' }}</p>
              <p>{{ 'Session Timeout' | translate }}: {{ config.security.sessionTimeout }}s</p>
              <p>{{ 'Max Login Attempts' | translate }}: {{ config.security.maxLoginAttempts }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Performance Settings -->
        <ion-item-group *ngIf="config?.performance">
          <ion-item-divider>
            <ion-label>{{ 'PERFORMANCE' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="speedometer-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'PERFORMANCE_SETTINGS' | translate }}</h3>
              <p>{{ 'Caching' | translate }}: {{ config.performance.enableCaching ? 'Enabled' : 'Disabled' }}</p>
              <p>{{ 'Cache Timeout' | translate }}: {{ config.performance.cacheTimeout }}s</p>
              <p>{{ 'Image Optimization' | translate }}: {{ config.performance.enableImageOptimization ? 'Enabled' : 'Disabled' }}</p>
              <p>{{ 'Lazy Loading' | translate }}: {{ config.performance.enableLazyLoading ? 'Enabled' : 'Disabled' }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Analytics Settings -->
        <ion-item-group *ngIf="config?.analytics">
          <ion-item-divider>
            <ion-label>{{ 'ANALYTICS' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-icon name="analytics-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ 'ANALYTICS_SETTINGS' | translate }}</h3>
              <p>{{ 'Google Analytics' | translate }}: {{ config.analytics.enableGoogleAnalytics ? 'Enabled' : 'Disabled' }}</p>
              <p>{{ 'Facebook Pixel' | translate }}: {{ config.analytics.enableFacebookPixel ? 'Enabled' : 'Disabled' }}</p>
              <p *ngIf="config.analytics.googleAnalyticsId">{{ 'GA ID' | translate }}: {{ config.analytics.googleAnalyticsId }}</p>
              <p *ngIf="config.analytics.facebookPixelId">{{ 'FB Pixel ID' | translate }}: {{ config.analytics.facebookPixelId }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Configuration Management -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ 'CONFIGURATION' | translate }}</ion-label>
          </ion-item-divider>

          <ion-item button (click)="viewFullConfiguration()">
            <ion-icon name="settings-outline" slot="start"></ion-icon>
            <ion-label>{{ 'VIEW_FULL_CONFIGURATION' | translate }}</ion-label>
          </ion-item>

          <ion-item button (click)="resetConfiguration()">
            <ion-icon name="refresh-outline" slot="start"></ion-icon>
            <ion-label>{{ 'RESET_CONFIGURATION' | translate }}</ion-label>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item-divider {
      --background: var(--ion-color-light);
      --color: var(--ion-color-dark);
      font-weight: 600;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }

    ion-icon {
      margin-right: 16px;
    }

    ion-label h3 {
      font-weight: 600;
      margin-bottom: 4px;
    }

    ion-label p {
      color: var(--ion-color-medium);
      font-size: 0.9em;
      margin: 2px 0;
    }
  `]
})
export class SettingsPage implements OnInit {
  config: any = null;
  currentLanguage: string = 'en';
  isDarkMode: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private configService: ConfigService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private regionalService: RegionalService
  ) {}

  ngOnInit() {
    this.loadConfiguration();
    this.loadCurrentLanguage();
    this.loadThemeSettings();
  }

  private loadConfiguration(): void {
    this.configService.getConfig$().subscribe(config => {
      this.config = config;
    });
  }

  private loadCurrentLanguage(): void {
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  private loadThemeSettings(): void {
    this.isDarkMode = this.themeService.currentTheme.darkMode;
  }

  getSupportedLanguages(): string {
    const languages = this.config?.regional?.supportedLanguages || this.config?.supportedLanguages || ['en', 'ar'];
    return languages.join(', ').toUpperCase();
  }

  getFeatureStatus(feature: string): string {
    const enabled = this.config?.features?.[feature];
    return enabled ? 'Enabled' : 'Disabled';
  }

  getNotificationStatus(feature: string): string {
    const enabled = this.config?.notifications?.[feature];
    return enabled ? 'Enabled' : 'Disabled';
  }

  getEnabledPaymentMethods(): string {
    const methods = this.config?.payment?.enabledPaymentGateways || this.config?.enabledPaymentGateways || ['cod'];
    return methods.join(', ').toUpperCase();
  }

  async changeLanguage(): Promise<void> {
    const supportedLanguages = this.config?.regional?.supportedLanguages || this.config?.supportedLanguages || ['en', 'ar'];

    const inputs = supportedLanguages.map((lang: string) => ({
      name: 'language',
      type: 'radio',
      label: this.getLanguageName(lang),
      value: lang,
      checked: this.currentLanguage === lang
    }));

    const alert = await this.alertController.create({
      header: 'Select Language',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {
            if (data) {
              this.languageService.setLanguage(data);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private getLanguageName(code: string): string {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'ar': 'العربية',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch'
    };
    return languageNames[code] || code.toUpperCase();
  }

  getCurrentCurrencyDisplay(): string {
    const currency = this.config?.regional?.defaultCurrency || 'USD';
    const currencyInfo = this.regionalService.getCurrencyInfo(currency);
    return `${currencyInfo.name} (${currencyInfo.symbol})`;
  }

  getCurrentRegionDisplay(): string {
    const currentRegion = this.regionalService.getCurrentRegion();
    return currentRegion?.country || 'Unknown';
  }

  getSampleDate(): string {
    const sampleDate = new Date(2024, 0, 15); // January 15, 2024
    return this.regionalService.formatDate(sampleDate);
  }

  getTaxRateDisplay(): string {
    const regionalConfig = this.regionalService.getCurrentRegionalConfig();
    const taxRate = regionalConfig?.taxRate || 0;
    return (taxRate * 100).toFixed(1);
  }

  getTextDirectionDisplay(): string {
    const isRtl = this.languageService.isRTL();
    const isRegionRtl = this.regionalService.isCurrentRegionRtl();
    return isRtl || isRegionRtl ? 'Right to Left (RTL)' : 'Left to Right (LTR)';
  }

  async changeCurrency(): Promise<void> {
    const supportedCurrencies = this.regionalService.getSupportedCurrencies();
    const currentCurrency = this.config?.regional?.defaultCurrency || 'USD';

    const inputs = supportedCurrencies.map(currency => ({
      name: 'currency',
      type: 'radio',
      label: `${currency.name} (${currency.symbol})`,
      value: currency.code,
      checked: currentCurrency === currency.code
    }));

    const alert = await this.alertController.create({
      header: 'Select Currency',
      inputs: inputs as any,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: async (currency: string) => {
            await this.regionalService.updateRegionalSettings({ defaultCurrency: currency });
            const toast = await this.toastController.create({
              message: 'Currency updated successfully',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  async changeRegion(): Promise<void> {
    const availableRegions = this.regionalService.getAvailableRegions();
    const currentCountry = this.config?.regional?.countryCode || 'US';

    const inputs = availableRegions.map(region => ({
      name: 'region',
      type: 'radio',
      label: `${region.country} (${region.currency})`,
      value: Object.keys(this.regionalService['regions']).find(key => 
        this.regionalService['regions'][key].country === region.country
      ),
      checked: currentCountry === Object.keys(this.regionalService['regions']).find(key => 
        this.regionalService['regions'][key].country === region.country
      )
    }));

    const alert = await this.alertController.create({
      header: 'Select Region',
      inputs: inputs as any,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: async (countryCode: string) => {
            await this.regionalService.setRegion(countryCode);
            const toast = await this.toastController.create({
              message: 'Region updated successfully',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleShipping(event: any): Promise<void> {
    const shippingEnabled = event.detail.checked;
    await this.regionalService.updateRegionalSettings({ shippingEnabled });
    
    const toast = await this.toastController.create({
      message: `Shipping ${shippingEnabled ? 'enabled' : 'disabled'}`,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  private updateRegionalConfig(updates: any): void {
    const currentRegional = this.config?.regional || {};
    const updatedRegional = { ...currentRegional, ...updates };
    
    this.configService.updateSection('regional', updatedRegional);
    
    // Update local config reference
    if (this.config) {
      this.config.regional = updatedRegional;
    }
  }

  toggleDarkMode(event: any): void {
    this.themeService.toggleDarkMode();
  }

  async viewFullConfiguration(): Promise<void> {
    const configText = JSON.stringify(this.config, null, 2);
    const alert = await this.alertController.create({
      header: 'Full Configuration',
      message: `<pre style="font-size: 12px; max-height: 400px; overflow-y: auto;">${configText}</pre>`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async resetConfiguration(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Reset Configuration',
      message: 'Are you sure you want to reset the configuration to defaults?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: async () => {
            await this.configService.resetConfig();
            const toast = await this.toastController.create({
              message: 'Configuration reset successfully',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }
}