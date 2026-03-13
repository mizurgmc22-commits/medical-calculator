import { useState, useEffect } from 'react';
import {
  calcGamma,
  calcRateFromGamma,
  calcConcentration,
  defaultDrugPresets,
  gammaFormulaDescriptions,
} from '../utils/gammaFormulas';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './GammaCalculator.css';

export default function GammaCalculator() {
  const { user } = useAuth();
  const [mode, setMode] = useState('gamma'); // 'gamma' or 'rate'
  const [weight, setWeight] = useState('');
  const [drugPresets, setDrugPresets] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // Added for toast notification

  // 初回読み込み（Firestore -> localStorage -> default）
  useEffect(() => {
    const loadPresets = async () => {
      if (!user) {
        setDrugPresets(defaultDrugPresets);
        setIsSyncing(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'gammaPresets');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const cloudPresets = docSnap.data().presets || [];
          setDrugPresets(cloudPresets);
          localStorage.setItem('gamma_drug_presets', JSON.stringify(cloudPresets));
        } else {
          // Firestoreにない場合、localStorageから移行を試みる
          const localSaved = localStorage.getItem('gamma_drug_presets');
          const initialPresets = localSaved ? JSON.parse(localSaved) : defaultDrugPresets;
          setDrugPresets(initialPresets);
          // Firestoreに初期保存
          await setDoc(docRef, { presets: initialPresets });
        }
      } catch (error) {
        console.error('Firestore sync error:', error);
        // エラー時はローカルを優先
        const localSaved = localStorage.getItem('gamma_drug_presets');
        setDrugPresets(localSaved ? JSON.parse(localSaved) : defaultDrugPresets);
      } finally {
        setIsSyncing(false);
      }
    };

    loadPresets();
  }, [user]);

  // 変更時の保存
  useEffect(() => {
    if (isSyncing) return; // 読み込み中は保存をスキップ

    localStorage.setItem('gamma_drug_presets', JSON.stringify(drugPresets));

    if (user) {
      const saveToCloud = async () => {
        try {
          const docRef = doc(db, 'users', user.uid, 'settings', 'gammaPresets');
          await setDoc(docRef, { presets: drugPresets });
          showToast('同期しました');
        } catch (error) {
          console.error('Failed to save to cloud:', error);
          showToast('同期エラー', true);
        }
      };
      saveToCloud();
    } else {
      showToast('ローカルに保存しました');
    }
  }, [drugPresets, user, isSyncing]);

  const showToast = (message, isError = false) => {
    setSaveStatus({ message, isError });
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [drugAmount, setDrugAmount] = useState('');
  const [solutionVolume, setSolutionVolume] = useState('');
  const [rate, setRate] = useState('');
  const [targetGamma, setTargetGamma] = useState('');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [showFormulas, setShowFormulas] = useState(false);
  const [showDrugManager, setShowDrugManager] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', drugAmount: '', solutionVolume: '' });

  // 薬剤選択時のハンドラ
  const handleDrugSelect = (drugId) => {
    setSelectedDrugId(drugId);
    if (!drugId) return;
    const drug = drugPresets.find((d) => d.id === drugId);
    if (drug) {
      setDrugAmount(String(drug.drugAmount));
      setSolutionVolume(String(drug.solutionVolume));
    }
  };

  const concentration = (() => {
    const da = parseFloat(drugAmount);
    const sv = parseFloat(solutionVolume);
    if (da > 0 && sv > 0) return calcConcentration(da, sv);
    return 0;
  })();

  const validate = () => {
    const newErrors = {};
    const w = parseFloat(weight);
    const da = parseFloat(drugAmount);
    const sv = parseFloat(solutionVolume);

    if (!weight || isNaN(w) || w <= 0 || w > 500) {
      newErrors.weight = '有効な体重を入力してください';
    }
    if (!drugAmount || isNaN(da) || da <= 0) {
      newErrors.drugAmount = '有効な薬剤量を入力してください';
    }
    if (!solutionVolume || isNaN(sv) || sv <= 0) {
      newErrors.solutionVolume = '有効な液量を入力してください';
    }

    if (mode === 'gamma') {
      const r = parseFloat(rate);
      if (!rate || isNaN(r) || r <= 0) {
        newErrors.rate = '有効な投与速度を入力してください';
      }
    } else {
      const tg = parseFloat(targetGamma);
      if (!targetGamma || isNaN(tg) || tg <= 0) {
        newErrors.targetGamma = '有効なγ値を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const w = parseFloat(weight);

    if (mode === 'gamma') {
      const r = parseFloat(rate);
      const gamma = calcGamma(r, concentration, w);
      setResults({
        mode: 'gamma',
        gamma,
        rate: r,
        concentration,
        hourlyDose: r * concentration, // mg/h
      });
    } else {
      const tg = parseFloat(targetGamma);
      const calculatedRate = calcRateFromGamma(tg, concentration, w);
      setResults({
        mode: 'rate',
        gamma: tg,
        rate: calculatedRate,
        concentration,
        hourlyDose: calculatedRate * concentration,
      });
    }
  };

  const handleClear = () => {
    setWeight('');
    setSelectedDrugId('');
    setDrugAmount('');
    setSolutionVolume('');
    setRate('');
    setTargetGamma('');
    setResults(null);
    setErrors({});
  };

  const handleAddDrug = () => {
    if (!newDrug.name || !newDrug.drugAmount || !newDrug.solutionVolume) return;
    const id = 'custom_' + Date.now();
    setDrugPresets((prev) => [
      ...prev,
      {
        id,
        name: newDrug.name,
        drugAmount: parseFloat(newDrug.drugAmount),
        solutionVolume: parseFloat(newDrug.solutionVolume),
        unit: 'mg',
        isCustom: true,
      },
    ]);
    setNewDrug({ name: '', drugAmount: '', solutionVolume: '' });
  };

  const handleDeleteDrug = (id) => {
    setDrugPresets((prev) => prev.filter((d) => d.id !== id));
    if (selectedDrugId === id) setSelectedDrugId('');
  };

  const handleResetDefault = () => {
    if (window.confirm('プリセットを初期状態に戻しますか？')) {
      setSelectedDrugId('');
      setDrugAmount('');
      setSolutionVolume('');
      setDrugPresets(defaultDrugPresets);
    }
  };

  return (
    <div className="gamma-calculator">
      <h2 className="page-title">ガンマ計算機</h2>
      <p className="page-description">薬剤投与速度のγ計算・逆算</p>

      {/* モード切替 */}
      <div className="input-section">
        <div className="input-group">
          <label className="input-label">計算モード</label>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'gamma' ? 'active' : ''}`}
              onClick={() => { setMode('gamma'); setResults(null); }}
              type="button"
            >
              γ算出
            </button>
            <button
              className={`mode-btn ${mode === 'rate' ? 'active' : ''}`}
              onClick={() => { setMode('rate'); setResults(null); }}
              type="button"
            >
              速度逆算
            </button>
          </div>
          <p className="mode-hint">
            {mode === 'gamma'
              ? '投与速度(mL/h) → γ値を算出'
              : '目標γ値 → 投与速度(mL/h)を算出'}
          </p>
        </div>

        {/* 体重 */}
        <div className="input-group">
          <label htmlFor="gamma-weight" className="input-label">体重</label>
          <div className="input-wrapper">
            <input
              id="gamma-weight"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className={`input-field ${errors.weight ? 'error' : ''}`}
            />
            <span className="input-unit">kg</span>
          </div>
          {errors.weight && <p className="error-message">{errors.weight}</p>}
        </div>

        {/* 薬剤選択 */}
        <div className="input-group">
          <label htmlFor="drug-select" className="input-label">
            薬剤プリセット
            <button
              className="manage-link"
              onClick={() => setShowDrugManager(!showDrugManager)}
              type="button"
            >
              {showDrugManager ? '閉じる' : '管理'}
            </button>
          </label>
          <select
            id="drug-select"
            value={selectedDrugId}
            onChange={(e) => handleDrugSelect(e.target.value)}
            className="input-field select-field"
          >
            <option value="">選択してください</option>
            {drugPresets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}（{d.drugAmount}mg / {d.solutionVolume}mL）
              </option>
            ))}
          </select>
        </div>

        {/* 薬剤管理パネル */}
        {showDrugManager && (
          <div className="drug-manager">
            <h4 className="drug-manager-title">
              💊 薬剤プリセット管理
              {saveStatus ? (
                 <span className={`sync-badge ${saveStatus.isError ? 'error' : 'success'}`}>
                    {saveStatus.isError ? '❌ ' : '✅ '} {saveStatus.message}
                 </span>
              ) : (
                user && <span className="sync-badge">☁️ クラウド同期ON</span>
              )}
            </h4>
            {isSyncing ? (
              <p className="sync-loading">読み込み中...</p>
            ) : (
              <>
                <div className="drug-list">
                  {drugPresets.length === 0 && <p className="empty-msg">登録された薬剤はありません</p>}
                  {drugPresets.map((d) => (
                    <div key={d.id} className="drug-list-item">
                      <div className="drug-info">
                        <span className="drug-name">{d.name}</span>
                        <span className="drug-spec">{d.drugAmount}mg / {d.solutionVolume}mL</span>
                      </div>
                      <button
                        className="drug-delete-btn"
                        onClick={() => handleDeleteDrug(d.id)}
                        type="button"
                        title="削除"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-drug-form">
                  <input
                    type="text"
                    value={newDrug.name}
                    onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                    placeholder="薬剤名"
                    className="input-field add-drug-input"
                  />
                  <div className="add-drug-row">
                    <input
                      type="number"
                      value={newDrug.drugAmount}
                      onChange={(e) => setNewDrug({ ...newDrug, drugAmount: e.target.value })}
                      placeholder="薬剤量(mg)"
                      className="input-field add-drug-input"
                    />
                    <input
                      type="number"
                      value={newDrug.solutionVolume}
                      onChange={(e) => setNewDrug({ ...newDrug, solutionVolume: e.target.value })}
                      placeholder="液量(mL)"
                      className="input-field add-drug-input"
                    />
                  </div>
                  <button className="calc-button primary add-drug-btn" onClick={handleAddDrug} type="button">
                    追加
                  </button>
                </div>
                <div className="drug-manager-footer">
                   <button className="reset-default-btn" onClick={handleResetDefault} type="button">
                     デフォルトに戻す
                   </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 薬剤量・液量（手動入力も可） */}
        <div className="input-group">
          <label htmlFor="drug-amount" className="input-label">薬剤設定：薬剤量 (手動入力・変更可)</label>
          <div className="input-wrapper">
            <input
              id="drug-amount"
              type="number"
              inputMode="decimal"
              value={drugAmount}
              onChange={(e) => { setDrugAmount(e.target.value); setSelectedDrugId(''); }}
              placeholder="例: 200"
              className={`input-field ${errors.drugAmount ? 'error' : ''}`}
            />
            <span className="input-unit">mg</span>
          </div>
          {errors.drugAmount && <p className="error-message">{errors.drugAmount}</p>}
        </div>
        
        <div className="input-group">
          <label htmlFor="solution-vol" className="input-label">薬剤設定：総液量 (手動入力・変更可)</label>
          <div className="input-wrapper">
            <input
              id="solution-vol"
              type="number"
              inputMode="decimal"
              value={solutionVolume}
              onChange={(e) => { setSolutionVolume(e.target.value); setSelectedDrugId(''); }}
              placeholder="例: 50"
              className={`input-field ${errors.solutionVolume ? 'error' : ''}`}
            />
            <span className="input-unit">mL</span>
          </div>
          {errors.solutionVolume && <p className="error-message">{errors.solutionVolume}</p>}
        </div>

        {/* 濃度表示 */}
        {concentration > 0 && (
          <div className="concentration-display">
            <span className="concentration-label">濃度:</span>
            <span className="concentration-value">{concentration.toFixed(3)} mg/mL</span>
          </div>
        )}

        {/* 投与速度 or 目標γ */}
        {mode === 'gamma' ? (
          <div className="input-group">
            <label htmlFor="rate-input" className="input-label">投与速度</label>
            <div className="input-wrapper">
              <input
                id="rate-input"
                type="number"
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="5"
                className={`input-field ${errors.rate ? 'error' : ''}`}
              />
              <span className="input-unit">mL/h</span>
            </div>
            {errors.rate && <p className="error-message">{errors.rate}</p>}
          </div>
        ) : (
          <div className="input-group">
            <label htmlFor="target-gamma" className="input-label">目標γ値</label>
            <div className="input-wrapper">
              <input
                id="target-gamma"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={targetGamma}
                onChange={(e) => setTargetGamma(e.target.value)}
                placeholder="3"
                className={`input-field ${errors.targetGamma ? 'error' : ''}`}
              />
              <span className="input-unit">μg/kg/min</span>
            </div>
            {errors.targetGamma && <p className="error-message">{errors.targetGamma}</p>}
          </div>
        )}

        <div className="button-group">
          <button className="calc-button primary" onClick={handleCalculate} id="gamma-calc-btn">
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
          <div className="result-card main">
            <div className="result-label">
              {results.mode === 'gamma' ? 'γ値' : '投与速度'}
            </div>
            <div className="result-value">
              {results.mode === 'gamma'
                ? results.gamma.toFixed(2)
                : results.rate.toFixed(2)}
              <span className="result-unit">
                {results.mode === 'gamma' ? 'μg/kg/min' : 'mL/h'}
              </span>
            </div>
          </div>

          <div className="result-row">
            <div className="result-card sub">
              <div className="result-label">
                {results.mode === 'gamma' ? '投与速度' : 'γ値'}
              </div>
              <div className="result-value-sm">
                {results.mode === 'gamma'
                  ? `${results.rate} mL/h`
                  : `${results.gamma} μg/kg/min`}
              </div>
            </div>
            <div className="result-card sub">
              <div className="result-label">時間投与量</div>
              <div className="result-value-sm">
                {results.hourlyDose.toFixed(2)} mg/h
              </div>
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
          <span>📖 計算式の解説</span>
          <span className={`toggle-arrow ${showFormulas ? 'open' : ''}`}>▼</span>
        </button>

        {showFormulas && (
          <div className="formula-content">
            {gammaFormulaDescriptions.map((f) => (
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
