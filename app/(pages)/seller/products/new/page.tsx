'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProductPage() {
  const router = useRouter()
  // 폼 입력 요소의 데이터를 저장할 상태 객체입니다.
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    discount: 0,
    description: '',
    stock: 0,
    category: '',
    shippingFee: 0,
    hasSizeGroup: false,
    isAvailable: true,
  })

  // 여러 이미지 주소들을 쉼표(,)로 구분해서 텍스트로 쉽게 입력받기 위한 상태입니다.
  const [imagesInput, setImagesInput] = useState('')
  const [loading, setLoading] = useState(false)

  // 사용자가 입력 필드를 변경할 때 폼 상태를 업데이트하는 핸들러입니다.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // 폼(상품 등록 정보)을 서버 API로 전송(POST)하는 처리 함수입니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 하나의 텍스트로 들어온 이미지 주소들을 쉼표로 분리하여 빈 문자열을 걸러냅니다.
    const images = imagesInput
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, images }),
      })

      if (res.ok) {
        alert('상품이 성공적으로 등록되었습니다.')
        // 성공 시 상품 목록 페이지로 되돌아갑니다.
        router.push('/seller/products')
      } else {
        const data = await res.json()
        alert(`상품 등록 실패: ${data.message}`)
      }
    } catch (error) {
      console.error(error)
      alert('상품 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-slate-900">새 상품 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 상품명 */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">상품명 *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예: 트렌디 오버핏 맨투맨"
            />
          </div>

          {/* 브랜드명 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">브랜드명 *</label>
            <input
              type="text"
              name="brand"
              required
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예: 아디다스"
            />
          </div>

          {/* 카테고리 (분류 지정) */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">카테고리 *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="의류">의류</option>
              <option value="신발">신발</option>
              <option value="가전">가전</option>
              <option value="리빙">리빙</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 가격 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">기본 가격(원) *</label>
            <input
              type="number"
              name="price"
              min="0"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 할인율 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">할인율(%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 배송비 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">배송비(원)</label>
            <input
              type="number"
              name="shippingFee"
              min="0"
              value={formData.shippingFee}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 재고 */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">재고 수량</label>
            <input
              type="number"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 카테고리별 사이즈 및 일반 설정 체크박스들 */}
          <div className="flex flex-col justify-center gap-4 md:col-span-2 md:flex-row md:justify-start">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="hasSizeGroup"
                checked={formData.hasSizeGroup}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              카테고리별 규격 사이즈(예: S, M, L) 표기 사용 여부
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              상품 즉시 노출 여부 (판매 가능)
            </label>
          </div>

          {/* 사진 게시 - 다수의 이미지 URL 입력 가능 */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">이미지 주소 (쉼표로 여러 장 구분)</label>
            <input
              type="text"
              name="images"
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg ..."
            />
          </div>

          {/* 상세 정보 */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">상품 상세 설명 *</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="소재, 핏감, 주의사항 등 상세한 정보를 적어주세요."
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3.5 font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '등록 중...' : '상품 등록하기'}
        </button>
      </form>
    </div>
  )
}
