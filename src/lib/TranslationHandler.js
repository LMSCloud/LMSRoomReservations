import Gettext from "gettext.js";

export default class TranslationHandler {
  constructor() {
    this._i18n = Gettext();
    this._locale = window.navigator.language;
  }

  async loadTranslations() {
    /** Loading translations via API */
    const response = await fetch(
      `/api/v1/contrib/roomreservations/static/locales/${this._locale}.json`
      );
      const translations = await response.json();
      
      if (response.status === 200) {
        this._i18n.loadJSON(translations, "messages");
        this._i18n.setLocale(this._locale);
        console.log(this._locale);
      return;
    }

    if (response.status >= 400) {
      throw Error(`[${response.status}] Error: ${response.error}`);
    }
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
