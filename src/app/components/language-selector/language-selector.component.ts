import { Component, OnInit } from '@angular/core';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  template: `
    <ion-item button detail="false" (click)="openLanguageSelector()">
      <ion-icon name="language-outline" slot="start"></ion-icon>
      <ion-label>
        {{ 'SETTINGS.LANGUAGE' | translate }}
        <p>{{ currentLanguage?.name }}</p>
      </ion-label>
      <ion-icon [name]="languageService.isRTL() ? 'chevron-back' : 'chevron-forward'" slot="end"></ion-icon>
    </ion-item>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --inner-padding-end: 16px;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: Language | undefined;

  constructor(
    public languageService: LanguageService,
    private actionSheetCtrl: ActionSheetController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Get initial language
    const currentLangCode = this.languageService.getCurrentLanguage();
    this.currentLanguage = this.languageService.languages.find(l => l.code === currentLangCode);
    
    // Subscribe to language changes
    this.languageService.language$.subscribe(langCode => {
      this.currentLanguage = this.languageService.languages.find(l => l.code === langCode);
    });
  }

  async openLanguageSelector() {
    // Translate the header text
    let headerText = 'Select Language';
    try {
      headerText = await this.translate.get('SETTINGS.SELECT_LANGUAGE').toPromise();
    } catch (error) {
      console.error('Error translating header text', error);
    }
    
    const actionSheet = await this.actionSheetCtrl.create({
      header: headerText,
      buttons: this.languageService.languages.map(lang => ({
        text: lang.name,
        role: lang.code === this.languageService.getCurrentLanguage() ? 'selected' : undefined,
        handler: () => {
          this.languageService.setLanguage(lang.code);
          return true;
        }
      })),
      cssClass: this.languageService.isRTL() ? 'rtl-action-sheet' : ''
    });

    await actionSheet.present();
  }
}