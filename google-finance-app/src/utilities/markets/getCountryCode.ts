// src/utilities/markets/getCountryCode.ts

export function getCountryCode(region: string): string {
  const countryMap: Record<string, string> = {
    us: "us",
    europe: "gb", // Default to UK for Europe
    asia: "in", // Default to India for Asia
    india: "in",
    uk: "gb",
    germany: "de",
    france: "fr",
    japan: "jp",
    china: "cn",
    currencies: "us", // Use US for currencies
    crypto: "us", // Use US for crypto
    futures: "us", // Use US for futures
  };

  return countryMap[region.toLowerCase()] || "us";
}
