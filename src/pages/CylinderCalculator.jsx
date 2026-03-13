import { useState } from 'react';
import {
  cylinderSizes,
  gasTypes,
  calcRemainingGas,
  calcRemainingTime,
  calcRemainingPercent,
  generateTimeTable,
} from '../utils/cylinderFormulas';
import './CylinderCalculator.css';

export default function CylinderCalculator() {
  const [selectedGas, setSelectedGas] = useState('o2');
  const [selectedCylinder, setSelectedCylinder] = useState('small_500');
  const [pressure, setPressure] = useState('');
  const [flowRate, setFlowRate] = useState('');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const gas = gasTypes.find((g) => g.id === selectedGas);
  const cylinder = cylinderSizes.find((c) => c.id === selectedCylinder);

  const validate = () => {
    const newErrors = {};
    const p = parseFloat(pressure);
    const f = parseFloat(flowRate);

    if (!pressure || isNaN(p) || p < 0 || p > 20) {
      newErrors.pressure = '有効な残圧を入力してください（0〜20 MPa）';
    }
    if (!flowRate || isNaN(f) || f <= 0 || f > 30) {
      newErrors.flowRate = '有効な流量を入力してください（0.1〜30 L/min）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const p = parseFloat(pressure);
    const f = parseFloat(flowRate);

    const remainingGas = calcRemainingGas(cylinder.volume, p, gas.fillPressure);
    const remainingTime = calcRemainingTime(remainingGas, f);
    const remainingPercent = calcRemainingPercent(p, gas.fillPressure);
    const timeTable = generateTimeTable(remainingGas);

    setResults({
      remainingGas,
      remainingTime,
      remainingPercent,
      timeTable,
    });
  };

  const handleClear = () => {
    setPressure('');
    setFlowRate('');
    setResults(null);
    setErrors({});
  };

  // 残量パーセンテージに応じた色
  const getGaugeColor = (percent) => {
    if (percent > 50) return '#10b981';
    if (percent > 25) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="cylinder-calculator">
      <h2 className="page-title">ボンベ残量計算機</h2>
      <p className="page-description">残圧・流量からボンベの使用可能時間を算出</p>

      <div className="input-section">
        {/* ガス種別 */}
        <div className="input-group">
          <label className="input-label">ガス種別</label>
          <div className="gas-grid">
            {gasTypes.map((g) => (
              <button
                key={g.id}
                className={`gas-btn ${selectedGas === g.id ? 'active' : ''}`}
                onClick={() => setSelectedGas(g.id)}
                type="button"
                style={{
                  '--gas-color': g.cylinderColor,
                  '--gas-accent': g.accentColor,
                  borderColor: selectedGas === g.id ? g.accentColor : undefined,
                }}
              >
                <span className="gas-color-bar" style={{ backgroundColor: g.cylinderColor }} />
                <span className="gas-name">{g.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ボンベサイズ */}
        <div className="input-group">
          <label htmlFor="cylinder-select" className="input-label">ボンベサイズ</label>
          <select
            id="cylinder-select"
            value={selectedCylinder}
            onChange={(e) => setSelectedCylinder(e.target.value)}
            className="input-field select-field"
          >
            {cylinderSizes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 残圧 */}
        <div className="input-group">
          <label htmlFor="pressure-input" className="input-label">
            残圧
            <span className="label-note">（充填圧: {gas.fillPressure} MPa）</span>
          </label>
          <div className="input-wrapper">
            <input
              id="pressure-input"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={pressure}
              onChange={(e) => setPressure(e.target.value)}
              placeholder={String(gas.fillPressure)}
              className={`input-field ${errors.pressure ? 'error' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
            <span className="input-unit">MPa</span>
          </div>
          {errors.pressure && <p className="error-message">{errors.pressure}</p>}
        </div>

        {/* 流量 */}
        <div className="input-group">
          <label htmlFor="flow-rate-input" className="input-label">流量</label>
          <div className="input-wrapper">
            <input
              id="flow-rate-input"
              type="number"
              inputMode="decimal"
              step="0.5"
              value={flowRate}
              onChange={(e) => setFlowRate(e.target.value)}
              placeholder="3"
              className={`input-field ${errors.flowRate ? 'error' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
            <span className="input-unit">L/min</span>
          </div>
          {errors.flowRate && <p className="error-message">{errors.flowRate}</p>}
        </div>

        <div className="button-group">
          <button className="calc-button primary" onClick={handleCalculate} id="cylinder-calc-btn">
            計算
          </button>
          <button className="calc-button secondary" onClick={handleClear}>
            クリア
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      {results && (() => {
        const pct = Math.min(results.remainingPercent, 100);
        // タコメーター: 225°(0%) → 315°(100%) の270°範囲
        const startAngle = 225;
        const totalSweep = 270;
        const needleAngle = startAngle - (pct / 100) * totalSweep;
        const needleRad = (needleAngle * Math.PI) / 180;
        const cx = 150, cy = 150, r = 110;
        const needleLen = 85;
        const nx = cx + needleLen * Math.cos(needleRad);
        const ny = cy - needleLen * Math.sin(needleRad);
        const ticks = [];
        for (let i = 0; i <= 10; i++) {
          const angle = ((startAngle - (i / 10) * totalSweep) * Math.PI) / 180;
          const isMajor = i % 2 === 0;
          const innerR = isMajor ? r - 16 : r - 10;
          const outerR = r + 2;
          ticks.push({
            x1: cx + innerR * Math.cos(angle),
            y1: cy - innerR * Math.sin(angle),
            x2: cx + outerR * Math.cos(angle),
            y2: cy - outerR * Math.sin(angle),
            isMajor,
            label: i * 10,
            lx: cx + (innerR - 14) * Math.cos(angle),
            ly: cy - (innerR - 14) * Math.sin(angle),
          });
        }
        const gaugeColor = getGaugeColor(pct);

        return (
        <div className="results-section">
          {/* タコメーター風ゲージ */}
          <div className="tacho-card">
            <svg viewBox="0 0 300 210" className="tacho-svg">
              <defs>
                <filter id="needleShadow">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={gaugeColor} floodOpacity="0.8" />
                </filter>
              </defs>

              {/* 外周リング */}
              <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="var(--border-color)" strokeWidth="1" opacity="0.3" />

              {/* 目盛り線 + ラベル */}
              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.isMajor ? 'var(--text-secondary)' : 'var(--text-tertiary)'} strokeWidth={t.isMajor ? 2 : 1} opacity={t.isMajor ? 0.8 : 0.4} />
                  {t.isMajor && (
                    <text x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="central" className="tacho-tick-label">
                      {t.label}
                    </text>
                  )}
                </g>
              ))}

              {/* ニードル（針） */}
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={gaugeColor} strokeWidth="3" strokeLinecap="round" filter="url(#needleShadow)" className="tacho-needle" />
              {/* 中心ボス */}
              <circle cx={cx} cy={cy} r="8" fill="var(--bg-card)" stroke={gaugeColor} strokeWidth="3" />
              <circle cx={cx} cy={cy} r="3" fill={gaugeColor} />

              {/* 中央パーセンテージ */}
              <text x={cx} y={cy + 38} textAnchor="middle" className="tacho-percent-text" fill={gaugeColor}>
                {Math.round(pct)}%
              </text>
              <text x={cx} y={cy + 54} textAnchor="middle" className="tacho-sub-label">
                残量
              </text>

              {/* 下部の使用可能時間 */}
              <text x={cx} y={cy + 80} textAnchor="middle" className="tacho-time-text">
                {results.remainingTime.hours}h {results.remainingTime.minutes}m
              </text>
              <text x={cx} y={cy + 95} textAnchor="middle" className="tacho-time-label">
                {flowRate} L/min 使用時
              </text>
            </svg>
          </div>

          {/* 残りガス量 + 情報 */}
          <div className="result-row">
            <div className="result-card">
              <div className="result-label">残りガス量</div>
              <div className="result-value">
                {Math.round(results.remainingGas).toLocaleString()}
                <span className="result-unit">L</span>
              </div>
              <div className="result-note">
                {cylinder.name}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">使用可能時間</div>
              <div className="result-value time-value">
                <span className="time-number">{results.remainingTime.hours}</span>
                <span className="time-unit-inline">h</span>
                <span className="time-number">{results.remainingTime.minutes}</span>
                <span className="time-unit-inline">m</span>
              </div>
              <div className="result-note">
                {gas.name}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* 流量別テーブル */}
      {results && (
        <div className="formula-section">
          <button
            className="formula-toggle"
            onClick={() => setShowTable(!showTable)}
            aria-expanded={showTable}
          >
            <span>📊 流量別 使用可能時間</span>
            <span className={`toggle-arrow ${showTable ? 'open' : ''}`}>▼</span>
          </button>

          {showTable && (
            <div className="formula-content">
              <div className="table-wrapper">
                <table className="data-table time-table">
                  <thead>
                    <tr>
                      <th>流量 (L/min)</th>
                      <th>使用可能時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.timeTable.map((row) => (
                      <tr
                        key={row.flowRate}
                        className={
                          parseFloat(flowRate) === row.flowRate ? 'active-stage' : ''
                        }
                      >
                        <td className="stage-cell">{row.flowRate}</td>
                        <td>{row.display}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ガス種別の解説 */}
      <div className="formula-section">
        <button
          className="formula-toggle"
          onClick={() => setShowInfo(!showInfo)}
          aria-expanded={showInfo}
        >
          <span>📖 ガス種別の解説</span>
          <span className={`toggle-arrow ${showInfo ? 'open' : ''}`}>▼</span>
        </button>

        {showInfo && (
          <div className="formula-content">
            {gasTypes.map((g) => (
              <div key={g.id} className="formula-item">
                <h4 className="formula-name">
                  <span className="gas-color-dot" style={{ backgroundColor: g.cylinderColor, border: `2px solid ${g.accentColor}` }} />
                  {g.name}
                </h4>
                <p className="formula-desc">{g.description}</p>
                <code className="formula-code">{g.cylinderNote} ／ 充填圧: {g.fillPressure} MPa</code>
              </div>
            ))}
            <div className="formula-item">
              <h4 className="formula-name">計算式</h4>
              <code className="formula-code">
                残りガス量(L) = ボンベ容量(L) × 残圧(MPa) ÷ 充填圧(MPa)
              </code>
              <code className="formula-code" style={{ marginTop: '4px' }}>
                使用可能時間(min) = 残りガス量(L) ÷ 流量(L/min)
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
