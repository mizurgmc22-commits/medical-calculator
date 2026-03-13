/**
 * mm / Fr / inch 換算
 * Fr = 外径mm × 3
 * 1 inch = 25.4 mm
 */

export function mmToFr(mm) {
  return mm * 3;
}

export function frToMm(fr) {
  return fr / 3;
}

export function mmToInch(mm) {
  return mm / 25.4;
}

export function inchToMm(inch) {
  return inch * 25.4;
}

/**
 * G（ゲージ）対応表 - JIS T 3209 / ISO 9626 基準
 * 外径(mm) と 内径(mm) の対応
 */
export const gaugeTable = [
  { gauge: 7,  outerDiameter: 4.572, innerDiameter: 3.810, color: '' },
  { gauge: 8,  outerDiameter: 4.191, innerDiameter: 3.429, color: '' },
  { gauge: 9,  outerDiameter: 3.810, innerDiameter: 3.048, color: '' },
  { gauge: 10, outerDiameter: 3.404, innerDiameter: 2.692, color: '' },
  { gauge: 11, outerDiameter: 3.048, innerDiameter: 2.388, color: '' },
  { gauge: 12, outerDiameter: 2.769, innerDiameter: 2.159, color: '' },
  { gauge: 13, outerDiameter: 2.413, innerDiameter: 1.803, color: '' },
  { gauge: 14, outerDiameter: 2.108, innerDiameter: 1.600, color: 'オレンジ' },
  { gauge: 15, outerDiameter: 1.829, innerDiameter: 1.372, color: '' },
  { gauge: 16, outerDiameter: 1.651, innerDiameter: 1.194, color: '白' },
  { gauge: 17, outerDiameter: 1.473, innerDiameter: 1.067, color: '' },
  { gauge: 18, outerDiameter: 1.270, innerDiameter: 0.838, color: 'ピンク' },
  { gauge: 19, outerDiameter: 1.067, innerDiameter: 0.686, color: '' },
  { gauge: 20, outerDiameter: 0.9081, innerDiameter: 0.603, color: '黄' },
  { gauge: 21, outerDiameter: 0.8192, innerDiameter: 0.514, color: '緑' },
  { gauge: 22, outerDiameter: 0.7176, innerDiameter: 0.413, color: '黒' },
  { gauge: 23, outerDiameter: 0.6414, innerDiameter: 0.337, color: '水色' },
  { gauge: 24, outerDiameter: 0.5652, innerDiameter: 0.311, color: '紫' },
  { gauge: 25, outerDiameter: 0.5144, innerDiameter: 0.260, color: 'オレンジ' },
  { gauge: 26, outerDiameter: 0.4636, innerDiameter: 0.241, color: '茶' },
  { gauge: 27, outerDiameter: 0.4128, innerDiameter: 0.210, color: '灰' },
  { gauge: 28, outerDiameter: 0.3620, innerDiameter: 0.184, color: '' },
  { gauge: 29, outerDiameter: 0.3366, innerDiameter: 0.159, color: '' },
  { gauge: 30, outerDiameter: 0.3112, innerDiameter: 0.159, color: '黄' },
];

/**
 * よく使うサイズの換算表
 */
export const commonSizes = [
  { mm: 1.0,  fr: 3,  useCase: '吸引カテーテル（小児）' },
  { mm: 1.33, fr: 4,  useCase: '吸引カテーテル（新生児）' },
  { mm: 1.67, fr: 5,  useCase: '栄養カテーテル' },
  { mm: 2.0,  fr: 6,  useCase: '吸引カテーテル' },
  { mm: 2.67, fr: 8,  useCase: '胃管（小児）' },
  { mm: 3.33, fr: 10, useCase: '胃管（小児）' },
  { mm: 4.0,  fr: 12, useCase: '胃管、尿道カテーテル' },
  { mm: 4.67, fr: 14, useCase: '胃管、尿道カテーテル' },
  { mm: 5.33, fr: 16, useCase: '尿道カテーテル' },
  { mm: 6.0,  fr: 18, useCase: '尿道カテーテル、胸腔ドレーン' },
  { mm: 6.67, fr: 20, useCase: '尿道カテーテル、胸腔ドレーン' },
  { mm: 8.0,  fr: 24, useCase: '胸腔ドレーン' },
  { mm: 9.33, fr: 28, useCase: '胸腔ドレーン' },
  { mm: 10.67, fr: 32, useCase: '胸腔ドレーン（大径）' },
];

/**
 * 単位解説
 */
export const unitDescriptions = [
  {
    unit: 'mm',
    name: 'ミリメートル',
    description: 'メートル法に基づく外径表記。最も基本的な長さの単位。',
  },
  {
    unit: 'Fr',
    name: 'フレンチ（French）',
    description: 'カテーテル等の外径を表す規格単位。1 Fr = 1/3 mm（外径mm × 3 = Fr）。',
  },
  {
    unit: 'inch',
    name: 'インチ',
    description: 'ヤード・ポンド法の長さの単位。1 inch = 25.4 mm。',
  },
  {
    unit: 'G',
    name: 'ゲージ（Gauge）',
    description:
      '注射針等の太さを表す規格。数値が大きいほど細くなる。線形換算ではなくJIS/ISO規格テーブルに基づく。',
  },
];
