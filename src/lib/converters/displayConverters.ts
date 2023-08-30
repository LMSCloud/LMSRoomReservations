import countryToCurrency from "country-to-currency";

/**
 * Returns the currency symbol for the specified locale.
 * @param locale
 * @param amount
 * @returns
 */
export function formatMonetaryAmountByLocale(locale: string, amount?: number | null): string {
    if (!amount) {
        return "";
    }

    const countryCode = locale.split("-")[1];
    try {
        const currencyFormatter = new Intl.NumberFormat(locale, {
            style: "currency",
            currency: countryToCurrency[countryCode as keyof typeof countryToCurrency],
        });

        return currencyFormatter.format(amount);
    } catch (error) {
        console.error(`Error formatting currency for locale ${locale}:`, error);

        return "";
    }
}
