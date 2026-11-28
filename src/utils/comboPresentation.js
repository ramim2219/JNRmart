// Combo display helpers. A combo has its own price, distinct from product variants.
// These values are for display only; order totals must be recalculated on the backend.
export function comboPriceValues(combo) {
  const pricing = combo?.pricing ?? {};
  const finalValue = pricing.final_price ?? pricing.current_price;
  const actualValue = pricing.actual_price;
  const finalPrice = finalValue == null || finalValue === "" ? NaN : Number(finalValue);
  const actualPrice = actualValue == null || actualValue === "" ? NaN : Number(actualValue);
  const hasPrice = Number.isFinite(finalPrice) && finalPrice > 0;
  const hasOriginal = Number.isFinite(actualPrice) && actualPrice > finalPrice && hasPrice;
  const discount = hasOriginal ? Math.round(((actualPrice - finalPrice) / actualPrice) * 100) : 0;
  return { finalPrice, actualPrice, hasPrice, hasOriginal, discount };
}

export function formatComboPrice(value, currency) {
  if (!Number.isFinite(value)) return "Price unavailable";
  const money = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  if (currency?.symbol) return `${currency.symbol} ${money}`;
  if (currency?.code) return `${currency.code} ${money}`;
  return money;
}

export function comboImageUrl(input) {
  if (typeof input !== "string") return "";
  const raw = input.trim().replace(/\\/g, "/");
  if (!raw) return "";
  if (/^(data:image\/|blob:)/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname.toLowerCase()) && /^\/storage\//i.test(url.pathname)) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch { /* Keep the supplied path when URL cannot be parsed. */ }
    return raw;
  }
  const path = raw.replace(/^\/+/, "").replace(/^public\//i, "");
  if (/^(storage|images|assets)\//i.test(path)) return `/${path}`;
  return `/storage/${path}`;
}
