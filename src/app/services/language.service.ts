import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Language {
  code: string;
  name: string;
  flag?: string;
  direction: 'ltr' | 'rtl';
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private LANGUAGE_KEY = 'app_language';
  private languageSubject = new BehaviorSubject<string>('ar'); // Default to Arabic
  public language$ = this.languageSubject.asObservable();
  private defaultLanguage: string = 'ar';
  private supportedLanguages: string[] = ['ar', 'en', 'fr', 'es', 'de'];
  private currentLanguage: string = 'ar';
  private currentLanguageSubject = new BehaviorSubject<string>(this.currentLanguage);
  public currentLanguage$ = this.currentLanguageSubject.asObservable();


  public languages: Language[] = [
    { code: 'ar', name: 'العربية', flag: 'assets/flags/sa.svg', direction: 'rtl', isDefault: true },
    { code: 'en', name: 'English', flag: 'assets/flags/us.svg', direction: 'ltr' },
    { code: 'fr', name: 'Français', flag: 'assets/flags/fr.svg', direction: 'ltr' },
    { code: 'es', name: 'Español', flag: 'assets/flags/es.svg', direction: 'ltr' },
    { code: 'de', name: 'Deutsch', flag: 'assets/flags/de.svg', direction: 'ltr' }
  ];

  constructor(
    private translate: TranslateService,
    private storage: Storage,
    private configService: ConfigService
  ) {}

  /**
   * Initialize the language service
   * Should be called during app initialization
   */
  async initializeLanguage(): Promise<void> {
      try {
      // Ensure storage is created
      await this.storage.create();

      // Get config to use default language and supported languages
      const config = this.configService.getConfig();

      if (config) {
        // Update supported languages from config
        if (config.supportedLanguages && config.supportedLanguages.length > 0) {
          this.supportedLanguages = config.supportedLanguages;
        }

        // Update default language from config
        if (config.defaultLanguage) {
          this.defaultLanguage = config.defaultLanguage;
        }
      }

      // First, try to get the saved language from storage
      const savedLang = await this.storage.get(this.LANGUAGE_KEY);

        let selectedLanguage: string | null = null;

      if (savedLang && this.supportedLanguages.includes(savedLang)) {
          selectedLanguage = savedLang;
          console.log('Language service: Using saved language:', savedLang);
      } else {
        // Use browser language if available and supported
        const browserLanguage = this.getBrowserLanguage();
        if (browserLanguage && this.supportedLanguages.includes(browserLanguage)) {
            selectedLanguage = browserLanguage;
          console.log('Language service: Using browser language:', browserLanguage);
        } else {
          // Fallback to default language
          selectedLanguage = this.defaultLanguage;
          console.log('Language service: Using default language:', this.defaultLanguage);
        }
      }

          this.currentLanguage = selectedLanguage ?? 'ar'; // Fallback if null

      // Set available languages in the translation service
      this.translate.addLangs(this.languages.map(lang => lang.code));

      // Set the language in the translation service
      this.translate.setDefaultLang(this.currentLanguage);
      await this.translate.use(this.currentLanguage).toPromise();

      // Update the current language subject
      this.languageSubject.next(this.currentLanguage);


      // Apply RTL/LTR direction
      this.updateDirection();

      console.log('Language service: Initialized with language:', this.currentLanguage);
    } catch (error) {
      console.error('Error initializing language service:', error);
      // Fallback to default language on error
      this.currentLanguage = this.defaultLanguage;
      this.translate.setDefaultLang(this.defaultLanguage);
      await this.translate.use(this.defaultLanguage).toPromise();
      this.languageSubject.next(this.currentLanguage);
      this.updateDirection();
    }
  }

  /**
   * Get the browser language if it's supported by the app
   */
  private getBrowserLanguage(): string | null {
    const browserLang = this.translate.getBrowserLang();
    return browserLang && this.isLanguageSupported(browserLang)
      ? browserLang
      : null;
  }

  /**
   * Get the default language from configuration
   */
  private getDefaultLanguage(): string | null {
    const defaultLang = this.languages.find(lang => lang.isDefault);
    return defaultLang ? defaultLang.code : null;
  }

  /**
   * Check if a language is supported by the app
   */
  private isLanguageSupported(langCode: string): boolean {
    return this.languages.some(lang => lang.code === langCode);
  }

  /**
   * Set the current language
   * @param langCode The language code to set
   */
  async setLanguage(langCode: string): Promise<void> {
    // Find the language in our supported languages
    const lang = this.languages.find(l => l.code === langCode);
    if (!lang) {
      console.error(`Language ${langCode} is not supported`);
      return;
    }

    try {
      // Update translation service
      this.translate.use(langCode);

      // Save to storage for persistence
      await this.storage.set(this.LANGUAGE_KEY, langCode);

      // Update text direction
      this.setDocumentDirection(lang.direction);

      // Update the current language subject
      this.languageSubject.next(langCode);

      console.log(`Language set to ${langCode} with direction ${lang.direction}`);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  /**
   * Get the current language code
   */
  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }

  /**
   * Get the current language object
   */
  getCurrentLanguageObject(): Language | undefined {
    const langCode = this.languageSubject.value;
    return this.languages.find(l => l.code === langCode);
  }

  /**
   * Get the current text direction
   */
  getCurrentDirection(): 'ltr' | 'rtl' {
    const langCode = this.languageSubject.value;
    const lang = this.languages.find(l => l.code === langCode);
    return lang ? lang.direction : 'rtl'; // Default to RTL for this app
  }

  /**
   * Check if the current language is RTL
   */
  isRTL(): boolean {
    return this.getCurrentDirection() === 'rtl';
  }

  /**
   * Set the document direction attribute
   */
  private setDocumentDirection(direction: 'ltr' | 'rtl'): void {
    document.documentElement.dir = direction;
    document.body.dir = direction;
    document.documentElement.lang = this.languageSubject.value;
  }

  /**
   * Get an observable of the current direction
   */
  getDirectionChanges(): Observable<'ltr' | 'rtl'> {
    return new Observable<'ltr' | 'rtl'>(observer => {
      this.language$.subscribe(langCode => {
        const lang = this.languages.find(l => l.code === langCode);
        observer.next(lang ? lang.direction : 'rtl');
      });
    });
  }

  /**
   * Apply RTL/LTR direction
   */
  private updateDirection(): void {
    const currentLang = this.languages.find(l => l.code === this.currentLanguage);
    if (currentLang) {
      this.setDocumentDirection(currentLang.direction);
    } else {
      this.setDocumentDirection('ltr'); // Default
    }
  }
}