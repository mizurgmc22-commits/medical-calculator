/**
 * ガンマ計算ロジック
 */

/**
 * γ（ガンマ）計算
 * γ (μg/kg/min) = 投与速度(mL/h) × 薬剤濃度(mg/mL) × 1000 / (体重(kg) × 60)
 *
 * @param {number} rate - 投与速度 (mL/h)
 * @param {number} concentration - 薬剤濃度 (mg/mL)
 * @param {number} weight - 体重 (kg)
 * @returns {number} γ (μg/kg/min)
 */
export function calcGamma(rate, concentration, weight) {
  return (rate * concentration * 1000) / (weight * 60);
}

/**
 * γ値から投与速度の逆算
 * 投与速度(mL/h) = γ × 体重(kg) × 60 / (薬剤濃度(mg/mL) × 1000)
 *
 * @param {number} gamma - 目標γ (μg/kg/min)
 * @param {number} concentration - 薬剤濃度 (mg/mL)
 * @param {number} weight - 体重 (kg)
 * @returns {number} 投与速度 (mL/h)
 */
export function calcRateFromGamma(gamma, concentration, weight) {
  return (gamma * weight * 60) / (concentration * 1000);
}

/**
 * 薬剤濃度算出
 * 濃度(mg/mL) = 薬剤量(mg) / 溶液量(mL)
 *
 * @param {number} drugAmount - 薬剤量 (mg)
 * @param {number} solutionVolume - 希釈後の総液量 (mL)
 * @returns {number} 濃度 (mg/mL)
 */
export function calcConcentration(drugAmount, solutionVolume) {
  if (solutionVolume <= 0) return 0;
  return drugAmount / solutionVolume;
}

/**
 * デフォルトの薬剤プリセット
 */
export const defaultDrugPresets = [];

/**
 * ガンマ計算式解説
 */
export const gammaFormulaDescriptions = [
  {
    name: 'γ（ガンマ）計算',
    formula: 'γ = 投与速度(mL/h) × 濃度(mg/mL) × 1000 ÷ (体重(kg) × 60)',
    description:
      '体重あたり1分間あたりの薬剤投与量（μg/kg/min）を算出します。血管作動薬やカテコラミンの投与量管理に使用されます。',
  },
  {
    name: '逆算（投与速度）',
    formula: '投与速度(mL/h) = γ × 体重(kg) × 60 ÷ (濃度(mg/mL) × 1000)',
    description:
      '目標のγ値から必要な投与速度（mL/h）を逆算します。目標投与量に合わせたシリンジポンプの設定に使用します。',
  },
];
