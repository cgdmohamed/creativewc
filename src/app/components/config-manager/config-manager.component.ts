
import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ConfigService } from '../../services/config.service';
import { AppConfig } from '../../interfaces/config.interface';

@Component({
  selector: 'app-config-manager',
  template: `
    <ion-content>
      <ion-header>
        <ion-toolbar>
          <ion-title>Configuration Manager</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="config-sections" *ngIf="config">
        <!-- App Information -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>App Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">App Name</ion-label>
              <ion-input [(ngModel)]="config.appName" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">App Slogan</ion-label>
              <ion-input [(ngModel)]="config.appSlogan" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Store Description</ion-label>
              <ion-textarea [(ngModel)]="config.storeDescription" (ionBlur)="updateConfig()"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Store URL</ion-label>
              <ion-input [(ngModel)]="config.storeUrl" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">WordPress URL</ion-label>
              <ion-input [(ngModel)]="config.wordpressUrl" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Theme Configuration -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Theme Configuration</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Primary Color</ion-label>
              <ion-input type="color" [(ngModel)]="config.theme.primaryColor" (ionChange)="updateTheme()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Secondary Color</ion-label>
              <ion-input type="color" [(ngModel)]="config.theme.secondaryColor" (ionChange)="updateTheme()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.theme.darkMode" (ionChange)="updateTheme()"></ion-checkbox>
              <ion-label>Dark Mode</ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Store Configuration -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Store Configuration</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">API URL</ion-label>
              <ion-input [(ngModel)]="config.apiUrl" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Consumer Key</ion-label>
              <ion-input [(ngModel)]="config.consumerKey" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Consumer Secret</ion-label>
              <ion-input [(ngModel)]="config.consumerSecret" type="password" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Regional Settings -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Regional Settings</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Default Currency</ion-label>
              <ion-select [(ngModel)]="config.defaultCurrency" (ionChange)="updateConfig()">
                <ion-select-option value="USD">USD</ion-select-option>
                <ion-select-option value="SAR">SAR</ion-select-option>
                <ion-select-option value="EUR">EUR</ion-select-option>
                <ion-select-option value="GBP">GBP</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Default Language</ion-label>
              <ion-select [(ngModel)]="config.defaultLanguage" (ionChange)="updateConfig()">
                <ion-select-option value="en">English</ion-select-option>
                <ion-select-option value="ar">العربية</ion-select-option>
                <ion-select-option value="es">Español</ion-select-option>
                <ion-select-option value="fr">Français</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Country Code</ion-label>
              <ion-input [(ngModel)]="config.countryCode" (ionBlur)="updateConfig()"></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Payment Configuration -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Payment Configuration</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label>Enabled Payment Gateways</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="paymentGateways.cod" (ionChange)="updatePaymentGateways()"></ion-checkbox>
              <ion-label>Cash on Delivery</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="paymentGateways.stripe" (ionChange)="updatePaymentGateways()"></ion-checkbox>
              <ion-label>Stripe</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="paymentGateways.paypal" (ionChange)="updatePaymentGateways()"></ion-checkbox>
              <ion-label>PayPal</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="paymentGateways.moyasar" (ionChange)="updatePaymentGateways()"></ion-checkbox>
              <ion-label>Moyasar</ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Features -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Features</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enablePushNotifications" (ionChange)="updateConfig()"></ion-checkbox>
              <ion-label>Push Notifications</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enableOtp" (ionChange)="updateConfig()"></ion-checkbox>
              <ion-label>OTP Verification</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enableWishlist" (ionChange)="updateConfig()"></ion-checkbox>
              <ion-label>Wishlist</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enableReviews" (ionChange)="updateConfig()"></ion-checkbox>
              <ion-label>Product Reviews</ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Actions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" (click)="exportConfig()">Export Configuration</ion-button>
            <ion-button expand="block" (click)="importConfig()">Import Configuration</ion-button>
            <ion-button expand="block" color="warning" (click)="resetConfig()">Reset to Defaults</ion-button>
            <ion-button expand="block" color="success" (click)="reloadConfig()">Reload from File</ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .config-sections {
      padding: 16px;
    }

    ion-card {
      margin-bottom: 16px;
    }

    ion-item {
      margin-bottom: 8px;
    }
  `]
})
export class ConfigManagerComponent implements OnInit {
  config: AppConfig;
  paymentGateways = {
    cod: false,
    stripe: false,
    paypal: false,
    moyasar: false
  };

  constructor(
    private configService: ConfigService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    try {
      await this.configService.waitForConfig();
      this.config = { ...this.configService.getConfig() };

      // Initialize payment gateways checkboxes
      this.paymentGateways = {
        cod: this.config.enabledPaymentGateways?.includes('cod') || false,
        stripe: this.config.enabledPaymentGateways?.includes('stripe') || false,
        paypal: this.config.enabledPaymentGateways?.includes('paypal') || false,
        moyasar: this.config.enabledPaymentGateways?.includes('moyasar') || false
      };
    } catch (error) {
      console.error('Error loading config:', error);
      this.showToast('Error loading configuration', 'danger');
    }
  }

  updateConfig() {
    this.configService.updateConfig(this.config);
    this.showToast('Configuration updated', 'success');
  }

  updateTheme() {
    this.configService.updateTheme(this.config.theme);
    this.showToast('Theme updated', 'success');
  }

  updatePaymentGateways() {
    const enabledGateways = [];
    if (this.paymentGateways.cod) enabledGateways.push('cod');
    if (this.paymentGateways.stripe) enabledGateways.push('stripe');
    if (this.paymentGateways.paypal) enabledGateways.push('paypal');
    if (this.paymentGateways.moyasar) enabledGateways.push('moyasar');

    this.config.enabledPaymentGateways = enabledGateways;
    this.updateConfig();
  }

  exportConfig() {
    const configJson = this.configService.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-config.json';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Configuration exported', 'success');
  }

  async importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const result = this.configService.importConfig(e.target.result);
          await this.showToast(result.message, result.success ? 'success' : 'danger');
          if (result.success) {
            await this.loadConfig();
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  async resetConfig() {
    const alert = await this.alertController.create({
      header: 'Reset Configuration',
      message: 'Are you sure you want to reset all configuration to defaults? This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset',
          handler: async () => {
            try {
              await this.configService.resetConfig();
              await this.loadConfig();
              this.showToast('Configuration reset to defaults', 'success');
            } catch (error) {
              this.showToast('Error resetting configuration', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async reloadConfig() {
    try {
      await this.configService.reloadConfig();
      await this.loadConfig();
      this.showToast('Configuration reloaded from file', 'success');
    } catch (error) {
      this.showToast('Error reloading configuration', 'danger');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }
}
