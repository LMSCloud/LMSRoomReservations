import Gettext from "gettext.js";

export default class TranslationHandler {
  constructor() {
    this._i18n = Gettext();
    this._locale = window.navigator.language;
  }

  async loadTranslations() {
    if (this._locale.startsWith('en')) {
      this._i18n.setLocale("en");
      return;
    }

    /** Loading translations via API */
    const response = await fetch(
      `/api/v1/contrib/roomreservations/static/locales/${this._locale}.json`
    );

    if (response.status === 200) {
      const translations = await response.json();
      this._i18n.loadJSON(translations, "messages");
      this._i18n.setLocale(this._locale);
      return;
    }

    /** If there is no json for the locale we don't interpolate
     *  and output that the translation is missing. */
    if (response.status >= 400) {
      console.info(
        `No translations found for locale ${this._locale}. Using default locale.`
      );
    }

    this._i18n.setLocale("en");
  }

  set locale(locale) {
    this._locale = locale;
  }

  get locale() {
    return this._locale;
  }

  get i18n() {
    return this._i18n;
  }
}
