'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditProductPage() {
  const router = useRouter()
  // URL에서 동적 파라미터(id)를 가져옵니다.
  const { id } = useParams()

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

  // 텍스트 필드로 입력받는 이미지 주소
  const [imagesInput, setImagesInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  // 컴포넌트가 처음 로드될 때 기존 상품 정보를 불러와 입력 칸을 채웁니다.
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          const p = data.product
          setFormData({
            name: p.name,
            brand: p.brand,
            price: p.price,
            discount: p.discount,
            description: p.description,
            stock: p.stock,
            category: p.category,
            shippingFee: p.shippingFee || 0,
            hasSizeGroup: p.hasSizeGroup || false,
            isAvailable: p.isAvailable,
          })
          setImagesInput(p.images?.join(', ') || '')
        } else {
          alert('상품 정보를 불러오지 못했습니다.')
          router.push('/seller/products')
        }
      } catch (error) {
        console.error(error)
        alert('상품 정보를 불러오는데 오류가 발생했습니다.')
      } finally {
        setPageLoading(false)
      }
    }
    fetchProduct()
  }, [id, router])

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

  // 폼 제출 시 기존 상품(id)에 대한 수정(PUT) 요청을 보냅니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 쉼표로 분리하여 빈 문자열 무시 처리
    const images = imagesInput
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, images }),
      })

      if (res.ok) {
        alert('상품 정보가 성공적으로 수정되었습니다.')
        router.push('/seller/products') // 수정 완료 후 내 상품 목록으로 이동
      } else {
        const data = await res.json()
        alert(`상품 수정 실패: ${data.message}`)
      }
    } catch (error) {
      console.error(error)
      alert('상품 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <div className="py-20 text-center font-bold text-slate-500">불러오는 중...</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-slate-900">상품 정보 수정</h1>

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
            />
          </div>

          {/* 카테고리 */}
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

          {/* 체크박스 설정 */}
          <div className="flex flex-col justify-center gap-4 md:col-span-2 md:flex-row md:justify-start">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="hasSizeGroup"
                checked={formData.hasSizeGroup}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              카테고리별 규격 사이즈 자동 표기 기능 활성화
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              상품을 일반 고객에게 노출 및 판매 활성화
            </label>
          </div>

          {/* 다중 이미지 설정 */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              이미지 주소 (쉼표로 구분하여 여러 장 입력)
            </label>
            <input
              type="text"
              name="images"
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">상품 상세 설명 *</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3.5 font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '수정 중...' : '상품 정보 저장하기'}
        </button>
      </form>
    </div>
  )
}
