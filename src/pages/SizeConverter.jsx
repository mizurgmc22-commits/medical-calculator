import { useState } from 'react';
import {
  mmToFr,
  mmToInch,
  frToMm,
  inchToMm,
  gaugeTable,
  commonSizes,
  unitDescriptions,
} from '../utils/sizeConversion';
import './SizeConverter.css';

export default function SizeConverter() {
  const [activeUnit, setActiveUnit] = useState('mm');
  const [inputValue, setInputValue] = useState('');
  const [gaugeFilter, setGaugeFilter] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showCommonSizes, setShowCommonSizes] = useState(false);

  // 換算結果の計算
  const getConvertedValues = () => {
    const val = parseFloat(inputValue);
    if (!inputValue || isNaN(val) || val <= 0) return null;

    let mm;
    switch (activeUnit) {
      case 'mm':
        mm = val;
        break;
      case 'fr':
        mm = frToMm(val);
        break;
      case 'inch':
        mm = inchToMm(val);
        break;
      default:
        mm = val;
    }

    return {
      mm: mm,
      fr: mmToFr(mm),
      inch: mmToInch(mm),
    };
  };

  const converted = getConvertedValues();

  // ゲージフィルタ処理
  const filteredGaugeTable = gaugeTable.filter((row) => {
    if (!gaugeFilter) return true;
    const filter = gaugeFilter.toLowerCase();
    return (
      row.gauge.toString().includes(filter) ||
      row.outerDiameter.toString().includes(filter) ||
      row.innerDiameter.toString().includes(filter) ||
      (row.color && row.color.includes(filter))
    );
  });

  const units = [
    { key: 'mm', label: 'mm' },
    { key: 'fr', label: 'Fr' },
    { key: 'inch', label: 'inch' },
  ];

  return (
    <div className="size-converter">
      <h2 className="page-title">サイズ換算計算機</h2>
      <p className="page-description">mm / Fr / inch の相互換算、Gゲージ対応表</p>

      {/* セクション① mm / Fr / inch 換算 */}
      <section className="converter-section">
        <h3 className="section-heading">📐 mm / Fr / inch 換算</h3>

        <div className="unit-tabs">
          {units.map((u) => (
            <button
              key={u.key}
              className={`unit-tab ${activeUnit === u.key ? 'active' : ''}`}
              onClick={() => {
                setActiveUnit(u.key);
                setInputValue('');
              }}
            >
              {u.label}
            </button>
          ))}
        </div>

        <div className="convert-input-section">
          <div className="input-wrapper">
            <input
              id="size-input"
              type="number"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="値を入力"
              className="input-field"
            />
            <span className="input-unit">
              {units.find((u) => u.key === activeUnit)?.label}
            </span>
          </div>
        </div>

        {converted && (
          <div className="convert-results">
            {units
              .filter((u) => u.key !== activeUnit)
              .map((u) => (
                <div key={u.key} className="convert-result-item">
                  <span className="convert-label">{u.label}</span>
                  <span className="convert-value">
                    {converted[u.key].toFixed(4).replace(/\.?0+$/, '')}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* よく使うサイズ表 */}
        <div className="common-sizes-section">
          <button
            className="formula-toggle common-sizes-toggle"
            onClick={() => setShowCommonSizes(!showCommonSizes)}
            aria-expanded={showCommonSizes}
            type="button"
          >
            <span>📋 よく使うサイズ一覧</span>
            <span className={`toggle-arrow ${showCommonSizes ? 'open' : ''}`}>▼</span>
          </button>
          
          {showCommonSizes && (
            <div className="common-sizes-content">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>mm</th>
                      <th>Fr</th>
                      <th>用途</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonSizes.map((row) => (
                      <tr key={row.fr}>
                        <td>{row.mm}</td>
                        <td>{row.fr}</td>
                        <td className="use-case">{row.useCase}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* セクション② Gゲージ対応表 */}
      <section className="converter-section">
        <h3 className="section-heading">💉 G（ゲージ）対応表</h3>

        <div className="filter-wrapper">
          <input
            id="gauge-filter"
            type="text"
            inputMode="text"
            value={gaugeFilter}
            onChange={(e) => setGaugeFilter(e.target.value)}
            placeholder="G値、外径mm、色で検索..."
            className="input-field filter-input"
          />
        </div>

        <div className="table-wrapper">
          <table className="data-table gauge-table">
            <thead>
              <tr>
                <th>G</th>
                <th>外径 (mm)</th>
                <th>内径 (mm)</th>
                <th>色</th>
              </tr>
            </thead>
            <tbody>
              {filteredGaugeTable.map((row) => (
                <tr key={row.gauge}>
                  <td className="gauge-value">{row.gauge}G</td>
                  <td>{row.outerDiameter.toFixed(3)}</td>
                  <td>{row.innerDiameter.toFixed(3)}</td>
                  <td>
                    {row.color && (
                      <span className="color-badge">{row.color}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredGaugeTable.length === 0 && (
                <tr>
                  <td colSpan={4} className="no-results">
                    該当するデータがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 単位解説 */}
      <div className="formula-section">
        <button
          className="formula-toggle"
          onClick={() => setShowInfo(!showInfo)}
          aria-expanded={showInfo}
        >
          <span>📖 単位の解説</span>
          <span className={`toggle-arrow ${showInfo ? 'open' : ''}`}>▼</span>
        </button>

        {showInfo && (
          <div className="formula-content">
            {unitDescriptions.map((u) => (
              <div key={u.unit} className="formula-item">
                <h4 className="formula-name">{u.unit}（{u.name}）</h4>
                <p className="formula-desc">{u.description}</p>
              </div>
            ))}
            <div className="formula-item">
              <h4 className="formula-name">換算関係</h4>
              <code className="formula-code">1 Fr = 1/3 mm | 1 inch = 25.4 mm</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
