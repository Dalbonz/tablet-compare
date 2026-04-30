import { useState, useEffect } from 'react'

export default function ProductCard({ product, isReference, manufacturers, onRemove, onFetchProducts, onFetchSpecs, onUpdate }) {
  const [productList, setProductList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const handleManufacturerChange = async (e) => {
    const mfr = e.target.value
    onUpdate({ manufacturer: mfr, model: '', specs: null, imageUrl: null })
    if (mfr) {
      setLoadingProducts(true)
      const list = await onFetchProducts(mfr)
      setProductList(list)
      setLoadingProducts(false)
    } else {
      setProductList([])
    }
  }

  const handleModelChange = async (e) => {
    const model = e.target.value
    if (!model) return
    onUpdate({ model, specs: null, loading: true, imageUrl: null })
    const specs = await onFetchSpecs(product.manufacturer, model)
    onUpdate({ specs, loading: false, imageUrl: specs?.imageUrl || null })
  }

  useEffect(() => {
    if (product.manufacturer) {
      onFetchProducts(product.manufacturer).then(setProductList)
    }
  }, [])

  return (
    <div className={`product-card${isReference ? ' reference' : ''}`}>
      <button className="card-close-btn" onClick={onRemove}>×</button>

      <div className="card-label">제조사 선택</div>
      <select className="card-select" value={product.manufacturer} onChange={handleManufacturerChange}>
        <option value="">선택하세요</option>
        {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <div className="card-label">제품 선택</div>
      <select className="card-select" value={product.model} onChange={handleModelChange} disabled={!product.manufacturer || loadingProducts}>
        <option value="">{loadingProducts ? '로딩 중...' : '제품을 선택하세요'}</option>
        {productList.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <div className="product-image-area">
        {product.loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : product.imageUrl ? (
          <img src={product.imageUrl} alt={product.model} />
        ) : (
          <div className="product-image-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <line x1="12" y1="18" x2="12" y2="18.01"/>
            </svg>
          </div>
        )}
      </div>

      {product.model && <div className="product-name">{product.model}</div>}
    </div>
  )
}
