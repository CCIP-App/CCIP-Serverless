export enum Locale {
  ZhTw = "zh-TW",
  EnUs = "en-US",
}

/**
 * Handles internationalized text with fallback support
 */
export class LocalizedText {
  constructor(private readonly translations: Map<Locale, string>) {}

  getText(locale: string): string {
    return (
      this.translations.get(locale as Locale) ||
      this.translations.get(Locale.EnUs) ||
      ""
    );
  }

  getAllTranslations(): Map<Locale, string> {
    return new Map(this.translations);
  }
}
