import { useState } from 'react'

export default function AddProductPanel({ manufacturers, onFetchProducts, onAdd, onClose }) {
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [productList, setProductList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const handleManufacturerChange = async (e) => {
    const mfr = e.target.value
    setManufacturer(mfr)
    setModel('')
    if (mfr) {
      setLoadingProducts(true)
      const list = await onFetchProducts(mfr)
      setProductList(list)
      setLoadingProducts(false)
    } else {
      setProductList([])
    }
  }

  return (
    <>
      <div className="add-panel-header">
        <h3>새 제품 추가</h3>
        <button className="add-panel-close" onClick={onClose}>×</button>
      </div>

      <div className="card-label">제조사 선택</div>
      <select className="card-select" value={manufacturer} onChange={handleManufacturerChange}>
        <option value="">선택하세요</option>
        {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <div className="card-label">제품 선택</div>
      <select className="card-select" value={model} onChange={e => setModel(e.target.value)} disabled={!manufacturer || loadingProducts}>
        <option value="">{loadingProducts ? '로딩 중...' : '제품을 선택하세요'}</option>
        {productList.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <div className="add-panel-actions">
        <button className="btn-cancel" onClick={onClose}>취소</button>
        <button className="btn-add" disabled={!manufacturer || !model} onClick={() => onAdd(manufacturer, model)}>추가</button>
      </div>
    </>
  )
}

