import { useState } from 'react';
import {
  calcEgfr,
  calcCcr,
  getCkdStage,
  ckdStages,
  egfrFormulaDescriptions,
} from '../utils/egfrFormulas';
import './EgfrCalculator.css';

export default function EgfrCalculator() {
  const [cr, setCr] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState('male');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [showFormulas, setShowFormulas] = useState(false);
  const [showCkdTable, setShowCkdTable] = useState(false);

  const validate = () => {
    const newErrors = {};
    const crVal = parseFloat(cr);
    const ageVal = parseFloat(age);
    const wVal = parseFloat(weight);

    if (!cr || isNaN(crVal) || crVal <= 0 || crVal > 30) {
      newErrors.cr = '有効なCr値を入力してください（0.1〜30 mg/dL）';
    }
    if (!age || isNaN(ageVal) || ageVal < 1 || ageVal > 150 || !Number.isInteger(ageVal)) {
      newErrors.age = '有効な年齢を入力してください（1〜150 歳）';
    }
    if (!weight || isNaN(wVal) || wVal <= 0 || wVal > 500) {
      newErrors.weight = '有効な体重を入力してください（1〜500 kg）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const crVal = parseFloat(cr);
    const ageVal = parseInt(age);
    const wVal = parseFloat(weight);
    const isFemale = sex === 'female';

    const egfr = calcEgfr(crVal, ageVal, isFemale);
    const ccr = calcCcr(crVal, ageVal, wVal, isFemale);
    const ckdStage = getCkdStage(egfr);

    setResults({ egfr, ccr, ckdStage });
  };

  const handleClear = () => {
    setCr('');
    setAge('');
    setWeight('');
    setSex('male');
    setResults(null);
    setErrors({});
  };

  return (
    <div className="egfr-calculator">
      <h2 className="page-title">eGFR / CCr 計算機</h2>
      <p className="page-description">腎機能を評価し、薬剤投与量調整の参考に</p>

      {/* 入力フォーム */}
      <div className="input-section">
        {/* 性別選択 */}
        <div className="input-group">
          <label className="input-label">性別</label>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${sex === 'male' ? 'active' : ''}`}
              onClick={() => setSex('male')}
              type="button"
            >
              ♂ 男性
            </button>
            <button
              className={`toggle-btn ${sex === 'female' ? 'active' : ''}`}
              onClick={() => setSex('female')}
              type="button"
            >
              ♀ 女性
            </button>
          </div>
        </div>

        {/* 血清Cr */}
        <div className="input-group">
          <label htmlFor="cr-input" className="input-label">血清クレアチニン（Cr）</label>
          <div className="input-wrapper">
            <input
              id="cr-input"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={cr}
              onChange={(e) => setCr(e.target.value)}
              placeholder="1.0"
              className={`input-field ${errors.cr ? 'error' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
            <span className="input-unit">mg/dL</span>
          </div>
          {errors.cr && <p className="error-message">{errors.cr}</p>}
        </div>

        {/* 年齢 */}
        <div className="input-group">
          <label htmlFor="age-input" className="input-label">年齢</label>
          <div className="input-wrapper">
            <input
              id="age-input"
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="65"
              className={`input-field ${errors.age ? 'error' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
            <span className="input-unit">歳</span>
          </div>
          {errors.age && <p className="error-message">{errors.age}</p>}
        </div>

        {/* 体重 */}
        <div className="input-group">
          <label htmlFor="weight-input-egfr" className="input-label">
            体重 <span className="label-note">（CCr算出に使用）</span>
          </label>
          <div className="input-wrapper">
            <input
              id="weight-input-egfr"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className={`input-field ${errors.weight ? 'error' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
            <span className="input-unit">kg</span>
          </div>
          {errors.weight && <p className="error-message">{errors.weight}</p>}
        </div>

        <div className="button-group">
          <button className="calc-button primary" onClick={handleCalculate} id="egfr-calc-btn">
            計算
          </button>
          <button className="calc-button secondary" onClick={handleClear}>
            クリア
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      {results && (
        <div className="results-section">
          {/* eGFR */}
          <div className="result-card main">
            <div className="result-label">eGFR</div>
            <div className="result-value">
              {results.egfr.toFixed(1)}
              <span className="result-unit">mL/min/1.73m²</span>
            </div>
          </div>

          {/* CKDステージ */}
          <div className={`result-card ckd-stage-card ${results.ckdStage.color}`}>
            <div className="ckd-stage-label">CKDステージ</div>
            <div className="ckd-stage-value">{results.ckdStage.stage}</div>
            <div className="ckd-stage-desc">{results.ckdStage.label}</div>
          </div>

          {/* CCr */}
          <div className="result-card">
            <div className="result-label">CCr（Cockcroft-Gault式）</div>
            <div className="result-value">
              {results.ccr.toFixed(1)}
              <span className="result-unit">mL/min</span>
            </div>
            <div className="result-note">体表面積未補正値</div>
          </div>
        </div>
      )}

      {/* CKDステージ分類表 */}
      <div className="formula-section">
        <button
          className="formula-toggle"
          onClick={() => setShowCkdTable(!showCkdTable)}
          aria-expanded={showCkdTable}
        >
          <span>📊 CKDステージ分類表</span>
          <span className={`toggle-arrow ${showCkdTable ? 'open' : ''}`}>▼</span>
        </button>

        {showCkdTable && (
          <div className="formula-content">
            <div className="table-wrapper">
              <table className="data-table ckd-table">
                <thead>
                  <tr>
                    <th>ステージ</th>
                    <th>eGFR</th>
                    <th>重症度</th>
                  </tr>
                </thead>
                <tbody>
                  {ckdStages.map((s) => (
                    <tr
                      key={s.stage}
                      className={results && results.ckdStage.stage === s.stage ? 'active-stage' : ''}
                    >
                      <td className="stage-cell">{s.stage}</td>
                      <td>{s.range}</td>
                      <td>{s.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 計算式解説 */}
      <div className="formula-section">
        <button
          className="formula-toggle"
          onClick={() => setShowFormulas(!showFormulas)}
          aria-expanded={showFormulas}
        >
          <span>📖 計算式の解説</span>
          <span className={`toggle-arrow ${showFormulas ? 'open' : ''}`}>▼</span>
        </button>

        {showFormulas && (
          <div className="formula-content">
            {egfrFormulaDescriptions.map((f) => (
              <div key={f.name} className="formula-item">
                <h4 className="formula-name">{f.name}</h4>
                <code className="formula-code">{f.formula}</code>
                <p className="formula-desc">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
