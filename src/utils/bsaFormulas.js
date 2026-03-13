/**
 * BSA計算式
 */

// Du Bois式: BSA = 0.007184 × H^0.725 × W^0.425
export function calcBsaDuBois(heightCm, weightKg) {
  return 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
}

// 新谷式: BSA = 0.007241 × H^0.725 × W^0.425
export function calcBsaShintani(heightCm, weightKg) {
  return 0.007241 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
}

// Mosteller式: BSA = √(H × W / 3600)
export function calcBsaMosteller(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

/**
 * BMI計算
 * BMI = W(kg) / H(m)²
 */
export function calcBmi(heightCm, weightKg) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * BMI判定
 */
export function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: '低体重', color: 'info' };
  if (bmi < 25.0) return { label: '普通体重', color: 'success' };
  if (bmi < 30.0) return { label: '肥満(1度)', color: 'warning' };
  if (bmi < 35.0) return { label: '肥満(2度)', color: 'warning' };
  if (bmi < 40.0) return { label: '肥満(3度)', color: 'danger' };
  return { label: '肥満(4度)', color: 'danger' };
}

/**
 * 予測体重 (PBW: Predicted Body Weight) - ARDSNet式
 * 男性: PBW = 50 + 0.91 × (身長cm - 152.4)
 * 女性: PBW = 45.5 + 0.91 × (身長cm - 152.4)
 */
export function calcPbw(heightCm, isFemale) {
  const base = isFemale ? 45.5 : 50;
  return base + 0.91 * (heightCm - 152.4);
}

/**
 * 標準体重 (IBW: Ideal Body Weight) - 日本肥満学会
 * IBW = 身長(m)² × 22
 */
export function calcIbw(heightCm) {
  const heightM = heightCm / 100;
  return heightM * heightM * 22;
}

/**
 * 循環血液量 (EBV: Estimated Blood Volume)
 * 簡易式: 男性 75mL/kg, 女性 65mL/kg
 * Nadler式: 身長(m)と体重(kg)から算出
 */
export function calcEbvSimple(weightKg, isFemale) {
  return weightKg * (isFemale ? 65 : 75);
}

export function calcEbvNadler(heightCm, weightKg, isFemale) {
  const hM3 = Math.pow(heightCm / 100, 3);
  if (isFemale) {
    return (0.3561 * hM3 + 0.03308 * weightKg + 0.1833) * 1000;
  } else {
    return (0.3669 * hM3 + 0.03219 * weightKg + 0.6041) * 1000;
  }
}

/**
 * 基礎代謝量 (BEE: Basal Energy Expenditure) - Harris-Benedictの式
 */
export function calcBee(heightCm, weightKg, age, isFemale) {
  if (isFemale) {
    return 655.1 + 9.563 * weightKg + 1.850 * heightCm - 4.676 * age;
  } else {
    return 66.47 + 13.75 * weightKg + 5.003 * heightCm - 6.775 * age;
  }
}

/**
 * 許容出血量 (ABL: Allowable Blood Loss) - Grossの式
 * ABL = EBV × (初期Ht - 目標Ht) / ((初期Ht + 目標Ht) / 2)
 */
export function calcAbl(ebv, currentHt, targetHt) {
  return (ebv * (currentHt - targetHt)) / ((currentHt + targetHt) / 2);
}

/**
 * 計算式の解説データ
 */
export const formulaDescriptions = [
  {
    name: 'Du Bois式',
    formula: 'BSA = 0.007184 × 身長(cm)^0.725 × 体重(kg)^0.425',
    description:
      '1916年にDu BoisとDu Boisが提唱した最も歴史ある計算式です。世界的に最も広く使用されている標準的な計算式ですが、西洋人のデータを基に作成されているため、日本人の体型には若干のずれが生じる場合があります。',
  },
  {
    name: '新谷式',
    formula: 'BSA = 0.007241 × 身長(cm)^0.725 × 体重(kg)^0.425',
    description:
      '日本人の体型データを基に補正された計算式です。国内の臨床現場で広く採用されており、日本人患者への適用に最も適しています。',
  },
  {
    name: 'Mosteller式',
    formula: 'BSA = √(身長(cm) × 体重(kg) / 3600)',
    description:
      '1987年にMostellerが提唱した簡易計算式です。計算が非常に簡便で暗算にも適しており、臨床現場での迅速な概算に有用です。',
  },
];
