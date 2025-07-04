import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ConfigService } from '../../services/config.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ConfigManagerComponent } from '../../components/config-manager/config-manager.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-list-header>
          <ion-label>Configuration</ion-label>
        </ion-list-header>

        <ion-item button (click)="openConfigManager()">
          <ion-icon name="settings-outline" slot="start"></ion-icon>
          <ion-label>
            <h2>Configuration Manager</h2>
            <p>Manage app settings, colors, and features</p>
          </ion-label>
        </ion-item>

        <ion-list-header>
          <ion-label>Quick Settings</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-icon name="color-palette-outline" slot="start"></ion-icon>
          <ion-label>Primary Color</ion-label>
          <ion-input 
            type="color" 
            [value]="primaryColor" 
            (ionChange)="updatePrimaryColor($event)"
            slot="end">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-icon name="moon-outline" slot="start"></ion-icon>
          <ion-label>Dark Mode</ion-label>
          <ion-toggle 
            [checked]="darkMode" 
            (ionChange)="toggleDarkMode()"
            slot="end">
          </ion-toggle>
        </ion-item>

        <ion-item>
          <ion-icon name="language-outline" slot="start"></ion-icon>
          <ion-label>Language</ion-label>
          <ion-select [value]="currentLanguage" (ionChange)="changeLanguage($event)" slot="end">
            <ion-select-option value="en">English</ion-select-option>
            <ion-select-option value="ar">العربية</ion-select-option>
            <ion-select-option value="es">Español</ion-select-option>
            <ion-select-option value="fr">Français</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class SettingsPage implements OnInit {
  primaryColor: string = '#ec1c24';
  darkMode: boolean = false;
  currentLanguage: string = 'en';
  config: any;
  supportedLanguages: string[] = [];
  availableFeatures: any = {};

  constructor(
    private modalController: ModalController,
    private configService: ConfigService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private alertController: AlertController,
  ) {}

  async ngOnInit() {
    await this.loadCurrentSettings();

    // Subscribe to config changes
    this.configService.getConfig$().subscribe(config => {
      if (config) {
        console.log('Config loaded in settings:', config);
        // Update any settings that depend on config
        this.loadCurrentSettings();
      }
    });
  }

  async loadCurrentSettings() {
    const config = this.configService.getConfig();
    const theme = this.themeService.currentTheme;

    this.primaryColor = config.theme?.primaryColor || '#ec1c24';
    this.darkMode = theme.darkMode;
    this.currentLanguage = config.defaultLanguage || 'en';
  }

  async openConfigManager() {
    const modal = await this.modalController.create({
      component: ConfigManagerComponent,
      cssClass: 'config-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      await this.loadCurrentSettings();
    }
  }

  updatePrimaryColor(event: any) {
    const color = event.detail.value;
    this.primaryColor = color;
    this.configService.updatePrimaryColor(color);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
    this.darkMode = !this.darkMode;
  }

  changeLanguage(event: any) {
    const language = event.detail.value;
    this.currentLanguage = language;
    this.configService.updateConfig({ defaultLanguage: language });
  }
}