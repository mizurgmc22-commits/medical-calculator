/**
 * ボンベ残量計算ロジック
 */

/**
 * ボンベサイズプリセット
 * 内容積(L) × 充填圧(MPa) で満タン時のガス量を算出
 */
export const cylinderSizes = [
  { id: 'small_500', name: '500L ボンベ（小型）', volume: 500, innerVolume: 3.4 },
  { id: 'medium_1500', name: '1,500L ボンベ（中型）', volume: 1500, innerVolume: 10.2 },
  { id: 'large_6000', name: '6,000L ボンベ（大型）', volume: 6000, innerVolume: 40.0 },
  { id: 'large_7000', name: '7,000L ボンベ（大型）', volume: 7000, innerVolume: 47.0 },
];

/**
 * ガス種別
 * 充填圧(MPa) はガスの種類によって異なる
 * ボンベ色はJIS規格に準拠
 */
export const gasTypes = [
  {
    id: 'o2',
    name: '酸素（O₂）',
    cylinderColor: '#1a1a1a',   // 黒（JIS: 黒色）
    labelColor: '#e0e0e0',      // ラベル文字色
    accentColor: '#888888',     // UI上のアクセント（黒ボンベを示すグレー）
    shoulderColor: '#333333',   // 肩部分も黒系
    fillPressure: 14.7,
    description: '医療用酸素。酸素療法、人工呼吸器、麻酔などで使用。',
    cylinderNote: 'ボンベ色: 黒',
  },
  {
    id: 'co2',
    name: '二酸化炭素（CO₂）',
    cylinderColor: '#16a34a',   // 緑（JIS: 緑色）
    labelColor: '#ffffff',
    accentColor: '#16a34a',
    fillPressure: 5.0,
    description: '腹腔鏡手術の気腹、凍結療法などで使用。液化ガスのため残圧での算出は参考値。',
    cylinderNote: 'ボンベ色: 緑',
  },
  {
    id: 'n2',
    name: '窒素（N₂）',
    cylinderColor: '#6b7280',   // ねずみ色（JIS: 灰色）
    labelColor: '#ffffff',
    accentColor: '#9ca3af',
    fillPressure: 14.7,
    description: '凍結治療、医療機器のパージなどで使用。',
    cylinderNote: 'ボンベ色: ねずみ色',
  },
  {
    id: 'he',
    name: 'ヘリウム（He）',
    cylinderColor: '#92400e',   // 褐色（JIS: 褐色/茶色）
    labelColor: '#ffffff',
    accentColor: '#d97706',
    fillPressure: 14.7,
    description: 'ヘリオックス療法（上気道閉塞時の呼吸補助）などで使用。',
    cylinderNote: 'ボンベ色: 褐色',
  },
];

/**
 * ボンベ残量を計算
 * 残りガス量(L) = ボンベ内容積(L) × 残圧(MPa) / 充填圧(MPa) × ボンベ容量(L) / ボンベ内容積(L)
 * 簡易式: 残りガス量(L) = ボンベ容量(L) × 残圧(MPa) / 充填圧(MPa)
 *
 * @param {number} cylinderVolume - ボンベ容量 (L) ※満タン時のガス体積
 * @param {number} remainingPressure - 残圧 (MPa)
 * @param {number} fillPressure - 充填圧 (MPa)
 * @returns {number} 残りガス量 (L)
 */
export function calcRemainingGas(cylinderVolume, remainingPressure, fillPressure) {
  return cylinderVolume * (remainingPressure / fillPressure);
}

/**
 * 使用可能時間を算出
 *
 * @param {number} remainingGas - 残りガス量 (L)
 * @param {number} flowRate - 流量 (L/min)
 * @returns {{ totalMinutes: number, hours: number, minutes: number }}
 */
export function calcRemainingTime(remainingGas, flowRate) {
  if (flowRate <= 0) return { totalMinutes: 0, hours: 0, minutes: 0 };
  const totalMinutes = remainingGas / flowRate;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return { totalMinutes, hours, minutes };
}

/**
 * 残量パーセンテージを算出
 */
export function calcRemainingPercent(remainingPressure, fillPressure) {
  if (fillPressure <= 0) return 0;
  return Math.min(100, Math.max(0, (remainingPressure / fillPressure) * 100));
}

/**
 * 流量ごとの使用可能時間テーブルを生成
 */
export function generateTimeTable(remainingGas, flowRates = [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 15]) {
  return flowRates.map((rate) => {
    const { totalMinutes, hours, minutes } = calcRemainingTime(remainingGas, rate);
    return {
      flowRate: rate,
      totalMinutes,
      hours,
      minutes,
      display: totalMinutes > 0 ? `${hours}時間${minutes}分` : '-',
    };
  });
}
