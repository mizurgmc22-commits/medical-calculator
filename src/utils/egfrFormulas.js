/**
 * eGFR / CCr 計算ロジック
 */

/**
 * eGFR算出（日本腎臓学会 推算式）
 * 194 × Cr^(-1.094) × Age^(-0.287) （女性は ×0.739）
 */
export function calcEgfr(cr, age, isFemale) {
  let egfr = 194 * Math.pow(cr, -1.094) * Math.pow(age, -0.287);
  if (isFemale) egfr *= 0.739;
  return egfr;
}

/**
 * CCr算出（Cockcroft-Gault式）
 * {(140 - Age) × W} / (72 × Cr) （女性は ×0.85）
 */
export function calcCcr(cr, age, weight, isFemale) {
  let ccr = ((140 - age) * weight) / (72 * cr);
  if (isFemale) ccr *= 0.85;
  return ccr;
}

/**
 * CKDステージ判定
 */
export function getCkdStage(egfr) {
  if (egfr >= 90) return { stage: 'G1', label: '正常または高値', color: 'success' };
  if (egfr >= 60) return { stage: 'G2', label: '正常または軽度低下', color: 'success' };
  if (egfr >= 45) return { stage: 'G3a', label: '軽度〜中等度低下', color: 'warning' };
  if (egfr >= 30) return { stage: 'G3b', label: '中等度〜高度低下', color: 'warning' };
  if (egfr >= 15) return { stage: 'G4', label: '高度低下', color: 'danger' };
  return { stage: 'G5', label: '末期腎不全', color: 'danger' };
}

/**
 * CKDステージ一覧
 */
export const ckdStages = [
  { stage: 'G1', range: '≧ 90', label: '正常または高値' },
  { stage: 'G2', range: '60 〜 89', label: '正常または軽度低下' },
  { stage: 'G3a', range: '45 〜 59', label: '軽度〜中等度低下' },
  { stage: 'G3b', range: '30 〜 44', label: '中等度〜高度低下' },
  { stage: 'G4', range: '15 〜 29', label: '高度低下' },
  { stage: 'G5', range: '< 15', label: '末期腎不全' },
];

/**
 * 計算式解説
 */
export const egfrFormulaDescriptions = [
  {
    name: 'eGFR（推算糸球体濾過量）',
    formula: '194 × Cr^(-1.094) × Age^(-0.287)（女性は×0.739）',
    description:
      '日本腎臓学会が策定した日本人向けeGFR推算式です。血清クレアチニン値・年齢・性別のみで簡便に算出できます。腎機能の経時的評価やCKDステージの分類に広く用いられています。',
  },
  {
    name: 'CCr（クレアチニンクリアランス）',
    formula: '{(140 - Age) × 体重(kg)} / (72 × Cr)（女性は×0.85）',
    description:
      'Cockcroft-Gault式。体重を考慮するため個体差を反映しやすく、薬剤の投与量調整（特に腎排泄型薬剤）の指標として広く使用されます。eGFRとは異なり体表面積で補正されません。',
  },
];
