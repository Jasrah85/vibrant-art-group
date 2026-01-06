import {
  BackgroundLevel,
  DetailLevel,
  Medium,
  SizeTier,
  SIZE_BASE,
  DETAIL_MULT,
  BACKGROUND_MULT,
  MEDIUM_MULT,
  depositPctFor,
} from "./model";

export type EstimateInput = {
  sizeTier: SizeTier;
  detailLevel: DetailLevel;
  backgroundLevel: BackgroundLevel;
  medium: Medium;
  rush?: boolean;
};

export type EstimateResult = {
  reviewRequired: boolean;
  base: number;
  total: number;
  low: number;
  high: number;
  depositPct: number;
  depositLow: number;
  depositHigh: number;
};

export function calculateEstimate(input: EstimateInput): EstimateResult {
  // Review required for XXL or special mediums
  if (input.sizeTier === "XXL") {
    return {
      reviewRequired: true,
      base: 0,
      total: 0,
      low: 0,
      high: 0,
      depositPct: 0,
      depositLow: 0,
      depositHigh: 0,
    };
  }

  const mediumMult = MEDIUM_MULT[input.medium];
  if (mediumMult === "REVIEW") {
    return {
      reviewRequired: true,
      base: 0,
      total: 0,
      low: 0,
      high: 0,
      depositPct: 0,
      depositLow: 0,
      depositHigh: 0,
    };
  }

  const base = SIZE_BASE[input.sizeTier];
  const total =
    base *
    DETAIL_MULT[input.detailLevel] *
    BACKGROUND_MULT[input.backgroundLevel] *
    (mediumMult as number) *
    (input.rush ? 1.35 : 1.0);

  // show a range ±20% (tune later)
  const low = Math.round(total * 0.8);
  const high = Math.round(total * 1.2);

  const depositPct = depositPctFor(total);
  const depositLow = Math.round(low * depositPct);
  const depositHigh = Math.round(high * depositPct);

  return {
    reviewRequired: false,
    base,
    total: Math.round(total),
    low,
    high,
    depositPct,
    depositLow,
    depositHigh,
  };
}
