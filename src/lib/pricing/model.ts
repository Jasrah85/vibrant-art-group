export type SizeTier = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type DetailLevel = "MINIMAL" | "MODERATE" | "DETAILED" | "HIGH" | "PHOTO";
export type BackgroundLevel = "NONE" | "ABSTRACT" | "SIMPLE" | "FULL" | "COMPLEX";

export type Medium =
  | "acrylic"
  | "watercolor"
  | "graphite"
  | "charcoal"
  | "colored_pencil"
  | "clay_small"
  | "wood_small"
  | "metal_small"
  | "3d_print_existing"
  | "3d_design_print"
  | "sublimation_design"
  | "sublimation_printed_sheet"
  | "heat_transfer_finished_item"
  // special review
  | "mural"
  | "custom_shoes_clothing"
  | "mailbox_paint"
  | "bottle_art";

export const SIZE_BASE: Record<Exclude<SizeTier, "XXL">, number> = {
  XS: 120,
  S: 220,
  M: 400,
  L: 700,
  XL: 1200,
};

export const DETAIL_MULT: Record<DetailLevel, number> = {
  MINIMAL: 1.0,
  MODERATE: 1.2,
  DETAILED: 1.5,
  HIGH: 1.9,
  PHOTO: 2.4,
};

export const BACKGROUND_MULT: Record<BackgroundLevel, number> = {
  NONE: 1.0,
  ABSTRACT: 1.1,
  SIMPLE: 1.25,
  FULL: 1.5,
  COMPLEX: 1.9,
};

export const MEDIUM_MULT: Record<Medium, number | "REVIEW"> = {
  graphite: 1.0,
  charcoal: 1.0,
  colored_pencil: 1.2,
  watercolor: 1.3,
  acrylic: 1.4,

  clay_small: 1.6,
  wood_small: 1.7,
  metal_small: 1.9,

  "3d_print_existing": 1.1,
  "3d_design_print": 1.6,

  sublimation_design: 1.0,
  sublimation_printed_sheet: 1.2,
  heat_transfer_finished_item: 1.4,

  mural: "REVIEW",
  custom_shoes_clothing: "REVIEW",
  mailbox_paint: "REVIEW",
  bottle_art: "REVIEW",
};

export function depositPctFor(estimateTotal: number): number {
  if (estimateTotal < 400) return 0.3;
  if (estimateTotal < 1000) return 0.4;
  return 0.5;
}
