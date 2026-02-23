import { expect, test, describe, mock, beforeEach } from "bun:test";
import { RatesService } from "../rates.service";

mock.module("@workspace/currencyfreaks", () => ({
  getRates: mock(() => Promise.resolve({ rates: { USD: "1", EUR: "0.85" } })),
  convertCurrency: mock(() => Promise.resolve(100)),
}));

describe("RatesService", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("should return OK when getting exchange rates with base USD", async () => {
    const result = await RatesService.getExchangeRates("USD");
    expect(result.success).toBe(true);
    expect(result.data?.EUR).toBe("0.85");
  });

  test("should return OK when getting exchange rates with base EUR", async () => {
    const result = await RatesService.getExchangeRates("EUR");
    expect(result.success).toBe(true);
  });

  test("should return OK when converting currency", async () => {
    const result = await RatesService.convertCurrency("100", "USD", "EUR");
    expect(result.success).toBe(true);
  });
});
