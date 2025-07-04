
import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-config-manager',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Configuration Manager</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="saveConfig()">
            <ion-icon name="save-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="resetConfig()">
            <ion-icon name="refresh-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-accordion-group>
        <!-- App Settings -->
        <ion-accordion value="app">
          <ion-item slot="header">
            <ion-label>App Settings</ion-label>
          </ion-item>
          <div slot="content">
            <ion-item>
              <ion-input [(ngModel)]="config.appName" label="App Name" labelPlacement="stacked"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input [(ngModel)]="config.appSlogan" label="App Slogan" labelPlacement="stacked"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input [(ngModel)]="config.storeDescription" label="Store Description" labelPlacement="stacked"></ion-input>
            </ion-item>
          </div>
        </ion-accordion>

        <!-- Store Settings -->
        <ion-accordion value="store">
          <ion-item slot="header">
            <ion-label>Store Settings</ion-label>
          </ion-item>
          <div slot="content">
            <ion-item>
              <ion-input [(ngModel)]="config.storeUrl" label="Store URL" labelPlacement="stacked"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input [(ngModel)]="config.consumerKey" label="Consumer Key" labelPlacement="stacked"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input [(ngModel)]="config.consumerSecret" label="Consumer Secret" labelPlacement="stacked" type="password"></ion-input>
            </ion-item>
          </div>
        </ion-accordion>

        <!-- Theme Settings -->
        <ion-accordion value="theme">
          <ion-item slot="header">
            <ion-label>Theme Settings</ion-label>
          </ion-item>
          <div slot="content">
            <ion-item>
              <ion-input [(ngModel)]="config.theme.primaryColor" label="Primary Color" labelPlacement="stacked" type="color"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input [(ngModel)]="config.theme.secondaryColor" label="Secondary Color" labelPlacement="stacked" type="color"></ion-input>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.theme.darkMode"></ion-checkbox>
              <ion-label>Dark Mode</ion-label>
            </ion-item>
          </div>
        </ion-accordion>

        <!-- Payment Settings -->
        <ion-accordion value="payment">
          <ion-item slot="header">
            <ion-label>Payment Settings</ion-label>
          </ion-item>
          <div slot="content">
            <ion-item>
              <ion-checkbox [(ngModel)]="config.paymentMethods.cod"></ion-checkbox>
              <ion-label>Cash on Delivery</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.paymentMethods.stripe"></ion-checkbox>
              <ion-label>Stripe</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.paymentMethods.paypal"></ion-checkbox>
              <ion-label>PayPal</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.paymentMethods.moyasar"></ion-checkbox>
              <ion-label>Moyasar</ion-label>
            </ion-item>
          </div>
        </ion-accordion>

        <!-- SMS Settings -->
        <ion-accordion value="sms">
          <ion-item slot="header">
            <ion-label>SMS Settings</ion-label>
          </ion-item>
          <div slot="content">
            <ion-item>
              <ion-select [(ngModel)]="config.defaultSmsProvider" label="Default SMS Provider" labelPlacement="stacked">
                <ion-select-option value="twilio">Twilio</ion-select-option>
                <ion-select-option value="firebase">Firebase</ion-select-option>
                <ion-select-option value="taqnyat">Taqnyat</ion-select-option>
              </ion-select>
            </ion-item>
          </div>
        </ion-accordion>

        <!-- Features -->
        <ion-accordion value="features">
          <ion-item slot="header">
            <ion-label>Features</ion-label>
          </ion-item>
          <div slot="content">
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enableOtp"></ion-checkbox>
              <ion-label>Enable OTP</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enableWishlist"></ion-checkbox>
              <ion-label>Enable Wishlist</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enableReviews"></ion-checkbox>
              <ion-label>Enable Reviews</ion-label>
            </ion-item>
            <ion-item>
              <ion-checkbox [(ngModel)]="config.features.enablePushNotifications"></ion-checkbox>
              <ion-label>Enable Push Notifications</ion-label>
            </ion-item>
          </div>
        </ion-accordion>
      </ion-accordion-group>

      <ion-button expand="block" (click)="exportConfig()" fill="outline" class="ion-margin">
        <ion-icon name="download-outline" slot="start"></ion-icon>
        Export Configuration
      </ion-button>

      <ion-button expand="block" (click)="importConfig()" fill="outline" class="ion-margin">
        <ion-icon name="cloud-upload-outline" slot="start"></ion-icon>
        Import Configuration
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ConfigManagerComponent implements OnInit {
  config: any = {};

  constructor(
    private configService: ConfigService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadConfig();
  }

  loadConfig() {
    this.config = { ...this.configService.getConfig() };
  }

  async saveConfig() {
    try {
      this.configService.updateConfig(this.config);
      const toast = await this.toastController.create({
        message: 'Configuration saved successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error saving configuration',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async resetConfig() {
    const alert = await this.alertController.create({
      header: 'Reset Configuration',
      message: 'Are you sure you want to reset all configuration to defaults?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: async () => {
            await this.configService.resetConfig();
            this.loadConfig();
            const toast = await this.toastController.create({
              message: 'Configuration reset to defaults',
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

  async exportConfig() {
    const configJson = this.configService.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app-config.json';
    link.click();
    URL.revokeObjectURL(url);
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
          const toast = await this.toastController.create({
            message: result.message,
            duration: 2000,
            color: result.success ? 'success' : 'danger'
          });
          await toast.present();
          if (result.success) {
            this.loadConfig();
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}
