import { useState } from 'react';
import {
  calcBsaDuBois,
  calcBsaShintani,
  calcBsaMosteller,
  calcBmi,
  getBmiCategory,
  calcPbw,
  calcIbw,
  calcEbvSimple,
  calcEbvNadler,
  calcBee,
  calcAbl,
} from '../utils/bsaFormulas';
import './BsaCalculator.css';

export default function BsaCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [currentHt, setCurrentHt] = useState('');
  const [targetHt, setTargetHt] = useState('');

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [showFormulas, setShowFormulas] = useState(false);
  const [showOptionalInputs, setShowOptionalInputs] = useState(false);

  const validate = () => {
    const newErrors = {};
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const cHt = parseFloat(currentHt);
    const tHt = parseFloat(targetHt);

    if (!height || isNaN(h) || h <= 0 || h > 300) {
      newErrors.height = '有効な身長を入力してください（1〜300 cm）';
    }
    if (!weight || isNaN(w) || w <= 0 || w > 500) {
      newErrors.weight = '有効な体重を入力してください（1〜500 kg）';
    }
    if (age !== '' && (isNaN(a) || a < 0 || a > 150)) {
      newErrors.age = '有効な年齢を入力してください（0〜150 歳）';
    }
    if (currentHt !== '' && (isNaN(cHt) || cHt <= 0 || cHt > 100)) {
      newErrors.currentHt = '有効なHtを入力してください';
    }
    if (targetHt !== '' && (isNaN(tHt) || tHt <= 0 || tHt > 100)) {
      newErrors.targetHt = '有効なHtを入力してください';
    }
    if (cHt && tHt && tHt >= cHt) {
      newErrors.targetHt = '目標Htは初期Htより小さくしてください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const h = parseFloat(height);
    const w = parseFloat(weight);
    const isFemale = sex === 'female';

    const bmi = calcBmi(h, w);
    const bmiCategory = getBmiCategory(bmi);

    const res = {
      bsaShintani: calcBsaShintani(h, w),
      bsaDuBois: calcBsaDuBois(h, w),
      bsaMosteller: calcBsaMosteller(h, w),
      bmi,
      bmiCategory,
      pbw: calcPbw(h, isFemale),
      ibw: calcIbw(h),
      ebvSimple: calcEbvSimple(w, isFemale),
      ebvNadler: calcEbvNadler(h, w, isFemale),
    };

    if (age !== '') {
      res.bee = calcBee(h, w, parseFloat(age), isFemale);
    }

    if (currentHt !== '' && targetHt !== '') {
      // 許容出血量にはより正確なNadler式由来のEBVを使用
      res.abl = calcAbl(res.ebvNadler, parseFloat(currentHt), parseFloat(targetHt));
    }

    setResults(res);
  };

  const handleClear = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setCurrentHt('');
    setTargetHt('');
    setSex('male');
    setResults(null);
    setErrors({});
  };

  return (
    <div className="bsa-calculator">
      <h2 className="page-title">BSA・体格・血液量 計算機</h2>
      <p className="page-description">身長・体重・性別から体表面積、各種標準体重、循環血液量などを算出します</p>

      {/* 入力フォーム */}
      <div className="input-section">
        {/* 性別選択 */}
        <div className="input-group">
          <label className="input-label">性別</label>
          <div className="sex-toggle">
            <button
              className={`sex-btn ${sex === 'male' ? 'active' : ''}`}
              onClick={() => setSex('male')}
              type="button"
            >
              ♂ 男性
            </button>
            <button
              className={`sex-btn ${sex === 'female' ? 'active' : ''}`}
              onClick={() => setSex('female')}
              type="button"
            >
              ♀ 女性
            </button>
          </div>
        </div>

        <div className="input-row">
            <div className="input-group">
            <label htmlFor="height-input" className="input-label">身長 <span className="status-badge required">必須</span></label>
            <div className="input-wrapper">
                <input
                id="height-input"
                type="number"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className={`input-field ${errors.height ? 'error' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                />
                <span className="input-unit">cm</span>
            </div>
            {errors.height && <p className="error-message">{errors.height}</p>}
            </div>

            <div className="input-group">
            <label htmlFor="weight-input" className="input-label">体重 <span className="status-badge required">必須</span></label>
            <div className="input-wrapper">
                <input
                id="weight-input"
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                className={`input-field ${errors.weight ? 'error' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                />
                <span className="input-unit">kg</span>
            </div>
            {errors.weight && <p className="error-message">{errors.weight}</p>}
            </div>
        </div>

        {/* オプション入力のトグル */}
        <div className="optional-inputs-divider">
            <button 
                type="button" 
                className="optional-toggle-btn"
                onClick={() => setShowOptionalInputs(!showOptionalInputs)}
            >
                {showOptionalInputs ? '▲ オプション入力を隠す' : '▼ 年齢・Ht (基礎代謝・許容出血量) を入力する'}
            </button>
        </div>

        {/* オプション入力エリア */}
        {showOptionalInputs && (
            <div className="optional-inputs-area">
                <div className="input-group">
                    <label htmlFor="age-input" className="input-label">年齢 <span className="label-note">（基礎代謝量の算出に使用）</span></label>
                    <div className="input-wrapper">
                        <input
                        id="age-input"
                        type="number"
                        inputMode="numeric"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="40"
                        className={`input-field ${errors.age ? 'error' : ''}`}
                        onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                        />
                        <span className="input-unit">歳</span>
                    </div>
                    {errors.age && <p className="error-message">{errors.age}</p>}
                </div>

                <div className="input-row">
                    <div className="input-group">
                        <label htmlFor="currentHt-input" className="input-label">初期Ht <span className="label-note">（許容出血量）</span></label>
                        <div className="input-wrapper">
                            <input
                            id="currentHt-input"
                            type="number"
                            inputMode="decimal"
                            value={currentHt}
                            onChange={(e) => setCurrentHt(e.target.value)}
                            placeholder="40"
                            className={`input-field ${errors.currentHt ? 'error' : ''}`}
                            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                            />
                            <span className="input-unit">%</span>
                        </div>
                        {errors.currentHt && <p className="error-message">{errors.currentHt}</p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="targetHt-input" className="input-label">目標Ht <span className="label-note">（許容出血量）</span></label>
                        <div className="input-wrapper">
                            <input
                            id="targetHt-input"
                            type="number"
                            inputMode="decimal"
                            value={targetHt}
                            onChange={(e) => setTargetHt(e.target.value)}
                            placeholder="25"
                            className={`input-field ${errors.targetHt ? 'error' : ''}`}
                            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                            />
                            <span className="input-unit">%</span>
                        </div>
                        {errors.targetHt && <p className="error-message">{errors.targetHt}</p>}
                    </div>
                </div>
            </div>
        )}

        <div className="button-group">
          <button className="calc-button primary" onClick={handleCalculate} id="calc-btn">
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
          {/* BSA - メイン（新谷式） */}
          <div className="result-card main">
            <div className="result-label">体表面積 - BSA（新谷式）</div>
            <div className="result-value">
              {results.bsaShintani.toFixed(4)} <span className="result-unit">m²</span>
            </div>
            <div className="result-note">Du Bois式: {results.bsaDuBois.toFixed(4)} m² / Mosteller式: {results.bsaMosteller.toFixed(4)} m²</div>
          </div>

          <div className="result-row">
            {/* EBV 循環血液量 */}
            <div className="result-card highlight">
                <div className="result-label">循環血液量 (EBV)</div>
                <div className="result-value">
                {Math.round(results.ebvNadler)} <span className="result-unit">mL</span>
                </div>
                <div className="result-note">Nadler式でより正確に算出</div>
                <div className="result-note-sub">簡易目安 ({sex === 'female' ? '65' : '75'}mL/kg): {Math.round(results.ebvSimple)} mL</div>
            </div>

            {/* ABL 許容出血量 */}
            {results.abl !== undefined ? (
                 <div className="result-card danger-highlight">
                    <div className="result-label">許容出血量 (ABL)</div>
                    <div className="result-value">
                       {Math.round(results.abl)} <span className="result-unit">mL</span>
                    </div>
                    <div className="result-note">Grossの式（{currentHt}% → {targetHt}%）</div>
                 </div>
            ) : (
                <div className="result-card empty-state">
                    <div className="result-label">許容出血量 (ABL)</div>
                    <div className="result-placeholder">初期Ht・目標Htを入力すると<br/>算出されます</div>
                </div>
            )}
          </div>

          <div className="result-row">
              {/* BMI */}
            <div className="result-card">
                <div className="result-label">BMI</div>
                <div className="result-value">
                {results.bmi.toFixed(1)}
                <span className={`bmi-badge ${results.bmiCategory.color}`}>
                    {results.bmiCategory.label}
                </span>
                </div>
            </div>

            {/* BEE 基礎代謝量 */}
            {results.bee !== undefined ? (
                 <div className="result-card">
                    <div className="result-label">基礎代謝量 (BEE)</div>
                    <div className="result-value">
                       {Math.round(results.bee)} <span className="result-unit">kcal/日</span>
                    </div>
                    <div className="result-note">Harris-Benedictの式</div>
                 </div>
            ) : (
                <div className="result-card empty-state">
                    <div className="result-label">基礎代謝量 (BEE)</div>
                    <div className="result-placeholder">年齢を入力すると算出されます</div>
                </div>
            )}
          </div>

          {/* 各種体重 */}
          <div className="result-row">
            <div className="result-card">
                <div className="result-label">標準体重 (IBW)</div>
                <div className="result-value">
                {results.ibw.toFixed(1)} <span className="result-unit">kg</span>
                </div>
                <div className="result-note">日本肥満学会基準（BMI 22）</div>
                <div className="result-note-sub">栄養管理・薬剤用量の基準</div>
            </div>

            <div className="result-card">
                <div className="result-label">予測体重 (PBW)</div>
                <div className="result-value">
                {results.pbw.toFixed(1)} <span className="result-unit">kg</span>
                </div>
                <div className="result-note">ARDSNet基準</div>
                <div className="result-note-sub">人工呼吸器の一回換気量設定など</div>
            </div>
          </div>

        </div>
      )}

      {/* 計算式解説 */}
      <div className="formula-section">
        <button
          className="formula-toggle"
          onClick={() => setShowFormulas(!showFormulas)}
          aria-expanded={showFormulas}
        >
          <span>📖 各種指標・計算式の解説</span>
          <span className={`toggle-arrow ${showFormulas ? 'open' : ''}`}>▼</span>
        </button>

        {showFormulas && (
          <div className="formula-content">
            <div className="formula-group">
                <h3 className="formula-group-title">血液関連の指標</h3>
                
                <div className="formula-item">
                    <h4 className="formula-name">循環血液量（EBV: Estimated Blood Volume）</h4>
                    <p className="formula-desc">
                        人体を循環する血液の総量です。術中や出血時の管理における重要な指標です。<br/>
                        <strong>簡易式</strong>: 患者の体重を用い、男性 = 75mL/kg、女性 = 65mL/kg を目安とする日本の臨床に浸透した概算式です。<br/>
                        <strong>Nadlerの式</strong>: 身長と体重の両方を用いて算出する世界的な標準計算式です。「簡易式」は肥満患者の場合に過大評価となるため、Nadlerの式がより正確とされています。
                    </p>
                </div>
                
                <div className="formula-item">
                    <h4 className="formula-name">許容出血量（ABL: Allowable Blood Loss）</h4>
                    <code className="formula-code">Grossの式: ABL = EBV × (初期Ht - 目標Ht) / ((初期Ht + 目標Ht) / 2)</code>
                    <p className="formula-desc">
                        輸血を開始する前に許容される最大の出血量です。術前ヘマトクリット（初期Ht）と、患者が耐えうる最低ヘマトクリット（目標Ht）を用いて計算します。本アプリでは輸液等で血液が希釈されることを考慮したGrossの式を採用しています。
                    </p>
                </div>
            </div>

            <div className="formula-group divider"></div>

            <div className="formula-group">
                <h3 className="formula-group-title">体重・代謝・体格の指標</h3>

                <div className="formula-item">
                    <h4 className="formula-name">標準体重（IBW: Ideal Body Weight）</h4>
                    <code className="formula-code">IBW = 身長(m)² × 22</code>
                    <p className="formula-desc">
                        日本肥満学会が定める、統計的に最も疾病の少ないBMI 22を用いた体重です。栄養管理や、一部の薬剤（特に親水性の抗生剤など）の投与量決定に不可欠な指標です。
                    </p>
                </div>

                <div className="formula-item">
                    <h4 className="formula-name">予測体重（PBW: Predicted Body Weight）</h4>
                    <code className="formula-code">男性: 50 + 0.91 × (身長cm - 152.4)</code>
                    <code className="formula-code">女性: 45.5 + 0.91 × (身長cm - 152.4)</code>
                    <p className="formula-desc">
                        ARDSNet（急性呼吸窮迫症候群ネットワーク）が採用する式です。肺の大きさは身長によって決まり、肥満によって大きくならないという概念に基づき、人工呼吸器の一回換気量（6〜8 mL/kg PBW）の設定に用いられます。
                    </p>
                </div>

                <div className="formula-item">
                    <h4 className="formula-name">基礎代謝量（BEE: Basal Energy Expenditure）</h4>
                    <p className="formula-desc">
                        Harris-Benedictの式を用いて、生命維持に必要な最小限のカロリーを算出します。手術侵襲や感染症などのストレス係数（活動係数・傷害係数）を乗じることで、患者に必要な一日エネルギー量を決定します。
                    </p>
                </div>

                <div className="formula-item">
                    <h4 className="formula-name">体表面積（BSA: Body Surface Area）</h4>
                    <p className="formula-desc">
                        抗がん剤の投与量や心機能指標（心系数: CI）の算出などに使用されます。<br/>
                        ・<strong>新谷式</strong>: 日本人の体型データに基づくため国内臨床で最も適した式<br/>
                        ・<strong>Du Bois式</strong>: 世界的に最も普及している歴史的標準式<br/>
                        ・<strong>Mosteller式</strong>: √(身長×体重/3600) で表される簡便な近似式
                    </p>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
