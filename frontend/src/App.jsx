import { useState, useRef } from 'react'
import ProductCard from './components/ProductCard'
import AddProductPanel from './components/AddProductPanel'
import CompareTable from './components/CompareTable'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '/api'

const MANUFACTURERS = [
  'Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Huawei',
  'Microsoft', 'Google', 'Sony', 'ASUS', 'OnePlus'
]

export default function App() {
  const [products, setProducts] = useState([]) // { id, manufacturer, model, specs, loading, imageUrl }
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addPanelPos, setAddPanelPos] = useState({ top: 0, left: 0 })
  const addBtnRef = useRef(null)

  const fetchProducts = async (manufacturer) => {
    try {
      const res = await fetch(`${WORKER_URL}/products?manufacturer=${encodeURIComponent(manufacturer)}`)
      const data = await res.json()
      return data.products || []
    } catch {
      return []
    }
  }

  const fetchSpecs = async (manufacturer, model) => {
    try {
      const res = await fetch(`${WORKER_URL}/specs?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`)
      return await res.json()
    } catch {
      return null
    }
  }

  const handleAddProduct = async (manufacturer, model) => {
    if (products.length >= 5) return
    const id = Date.now()
    setProducts(prev => [...prev, { id, manufacturer, model, specs: null, loading: true, imageUrl: null }])
    setShowAddPanel(false)
    const specs = await fetchSpecs(manufacturer, model)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, specs, loading: false, imageUrl: specs?.imageUrl || null } : p))
  }

  const handleRemoveProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleAddClick = () => {
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect()
      setAddPanelPos({ top: rect.bottom + 8, left: Math.max(rect.left - 100, 64) })
    }
    setShowAddPanel(true)
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <line x1="12" y1="18" x2="12" y2="18.01"/>
          </svg>
        </div>
        <button className="sidebar-btn active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
          </svg>
          비교하기
        </button>
        <button className="sidebar-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          설정
        </button>
      </aside>

      <div className="main-layout">
        {/* Header */}
        <header className="header">
          <h1>Tablet Compare Pro</h1>
        </header>

        <div className="content">
          {/* Product cards */}
          <div className="product-cards-row">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                isReference={idx === 0}
                manufacturers={MANUFACTURERS}
                onRemove={() => handleRemoveProduct(product.id)}
                onFetchProducts={fetchProducts}
                onFetchSpecs={fetchSpecs}
                onUpdate={(updated) =>
                  setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updated } : p))
                }
              />
            ))}

            {products.length < 5 && (
              <button
                ref={addBtnRef}
                className="add-product-btn"
                onClick={handleAddClick}
              >
                <div className="plus-circle">+</div>
                제품 추가
              </button>
            )}
          </div>

          {/* Add product panel */}
          {showAddPanel && (
            <div className="add-panel-overlay" onClick={() => setShowAddPanel(false)}>
              <div
                className="add-panel"
                style={{ top: addPanelPos.top, left: addPanelPos.left }}
                onClick={e => e.stopPropagation()}
              >
                <AddProductPanel
                  manufacturers={MANUFACTURERS}
                  onFetchProducts={fetchProducts}
                  onAdd={handleAddProduct}
                  onClose={() => setShowAddPanel(false)}
                />
              </div>
            </div>
          )}

          {/* Compare table */}
          {products.length > 0 && (
            <CompareTable products={products} />
          )}

          {/* Bottom info */}
          <div className="info-bar">
            <div className="info-card">
              <h4>사용 방법</h4>
              <ol>
                <li>제조사를 선택하면 해당 브랜드의 제품 목록이 최신순으로 표시됩니다.</li>
                <li>제품을 선택하면 스펙이 자동으로 채워집니다.</li>
                <li>최대 5개 제품까지 비교할 수 있습니다. (기준은 첫 번째 제품입니다.)</li>
              </ol>
            </div>
            <div className="info-card">
              <h4>성능 비교 기준</h4>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-superior">&gt;&gt; 20%↑</span>
                <span>20% 이상 우위</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-slightly-superior">&gt; 110%</span>
                <span>5~20% 우위</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-equal">= 100%</span>
                <span>±5% 이내</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-slightly-inferior">&lt; 90%</span>
                <span>5~20% 열세</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-inferior">&lt;&lt; 70%</span>
                <span>20% 이상 열세</span>
              </div>
            </div>
            <div className="info-card">
              <h4>표시 예시</h4>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-superior">120% &gt;&gt;</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-slightly-superior">110% &gt;</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-equal">100% =</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-slightly-inferior">90% &lt;</span>
              </div>
              <div className="legend-row">
                <span className="legend-badge compare-badge badge-inferior">70% &lt;&lt;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
