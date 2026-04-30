import { useState } from 'react'

const ALL_CATEGORIES = ['기본 정보','바디','디스플레이','AP (성능)','메모리','카메라','사운드','배터리','통신 사양','센서','MISC']

export default function SettingsPanel({ settings, manufacturers, onSave, onClose }) {
  const [s, setS] = useState({ ...settings })

  const toggle = (cat) => {
    setS(prev => ({
      ...prev,
      visibleCategories: prev.visibleCategories.includes(cat)
        ? prev.visibleCategories.filter(c => c !== cat)
        : [...prev.visibleCategories, cat]
    }))
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ 설정</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        {/* 언어 */}
        <div className="settings-section">
          <h3>언어 / Language</h3>
          <div className="settings-row">
            <div><div className="settings-label">표시 언어</div></div>
            <select className="settings-select" value={s.language} onChange={e => setS({...s, language: e.target.value})}>
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* 통화 */}
        <div className="settings-section">
          <h3>가격 표시</h3>
          <div className="settings-row">
            <div>
              <div className="settings-label">기본 통화</div>
              <div className="settings-desc">중국 제품은 CNY + USD 환산 병기</div>
            </div>
            <select className="settings-select" value={s.currency} onChange={e => setS({...s, currency: e.target.value})}>
              <option value="USD">USD ($)</option>
              <option value="KRW">KRW (₩)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* 비교 임계값 */}
        <div className="settings-section">
          <h3>성능 비교 기준 (%)</h3>
          <div className="settings-row">
            <div>
              <div className="settings-label">&gt;&gt; 우위 기준</div>
              <div className="settings-desc">이 % 이상이면 강한 우위</div>
            </div>
            <input className="settings-input" type="number" min="5" max="50"
              value={s.thresholds.superior}
              onChange={e => setS({...s, thresholds: {...s.thresholds, superior: Number(e.target.value)}})}
            />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">&gt; 우위 기준</div>
              <div className="settings-desc">이 % 이상이면 약한 우위</div>
            </div>
            <input className="settings-input" type="number" min="1" max="30"
              value={s.thresholds.slightlySuper}
              onChange={e => setS({...s, thresholds: {...s.thresholds, slightlySuper: Number(e.target.value)}})}
            />
          </div>
        </div>

        {/* 표시 항목 */}
        <div className="settings-section">
          <h3>표시 카테고리</h3>
          <div className="category-check-grid">
            {ALL_CATEGORIES.map(cat => (
              <label key={cat} className="category-check">
                <input type="checkbox"
                  checked={s.visibleCategories.includes(cat)}
                  onChange={() => toggle(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* 기본 제조사 */}
        <div className="settings-section">
          <h3>기본값</h3>
          <div className="settings-row">
            <div>
              <div className="settings-label">기본 제조사</div>
              <div className="settings-desc">앱 시작 시 자동 선택</div>
            </div>
            <select className="settings-select" value={s.defaultManufacturer} onChange={e => setS({...s, defaultManufacturer: e.target.value})}>
              <option value="">선택 안함</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* 테마 */}
        <div className="settings-section">
          <h3>테마</h3>
          <div className="settings-row">
            <div><div className="settings-label">화면 테마</div></div>
            <select className="settings-select" value={s.theme} onChange={e => setS({...s, theme: e.target.value})}>
              <option value="light">라이트</option>
              <option value="dark">다크 (준비 중)</option>
            </select>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-btn-cancel" onClick={onClose}>취소</button>
          <button className="settings-btn-save" onClick={() => onSave(s)}>저장</button>
        </div>
      </div>
    </div>
  )
}

