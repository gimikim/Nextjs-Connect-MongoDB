'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function SellerEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '의류',
    price: '',
    discount: '0',
    stock: '',
    description: '',
    image: '',
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          const p = data.product
          setFormData({
            name: p.name || '',
            brand: p.brand || '',
            category: p.category || '의류',
            price: p.price ? p.price.toString() : '0',
            discount: p.discount ? p.discount.toString() : '0',
            stock: p.stock ? p.stock.toString() : '0',
            description: p.description || '',
            image: p.images && p.images.length > 0 ? p.images[0] : '',
          })
        } else {
          alert('상품 정보를 불러오는데 실패했습니다.')
          router.push('/mypage/seller/products')
        }
      } catch (error) {
        console.error(error)
        alert('상품 정보를 불러오는 중 오류가 발생했습니다.')
        router.push('/mypage/seller/products')
      } finally {
        setFetching(false)
      }
    }
    fetchProduct()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const submitFile = new FormData()
    submitFile.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: submitFile,
      })
      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, image: data.url }))
      } else {
        alert('이미지 업로드에 실패했습니다. (용량/확장자 문제 등)')
      }
    } catch (err) {
      console.error(err)
      alert('네트워크 통신 중 오류가 발생했습니다.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submitData = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      images: formData.image ? [formData.image] : [],
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (res.ok) {
        alert('상품 정보가 성공적으로 수정되었습니다.')
        router.push('/mypage/seller/products')
      } else {
        const errorData = await res.json()
        alert(errorData.message || '상품 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-lg font-bold text-slate-500">상품 정보를 불러오는 중입니다...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">상품 수정</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            상품 이미지 (로컬 파일 또는 외부 링크)
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex h-[3.15rem] cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-5 text-[0.95rem] font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600">
              <span>{uploadingImage ? '전송 중...' : '🖼️ 내 PC에서 사진 찾기'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            <span className="text-[0.85rem] font-bold text-slate-400">또는</span>

            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="이미지 주소 직접 입력 (예: https://...jpg)"
              className="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {formData.image && (
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.image} alt="상품 사진 미리보기" className="h-full w-full object-cover" />
              </div>
              <p className="text-sm font-medium text-blue-600">성공적으로 이미지가 불러와졌습니다!</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700">상품명 *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="mb-2 block text-sm font-semibold text-slate-700">브랜드명 *</label>
            <input
              type="text"
              name="brand"
              required
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full md:w-1/4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">카테고리 *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="의류">의류</option>
              <option value="신발">신발</option>
              <option value="가전">가전</option>
              <option value="리빙">리빙</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700">가격 (원) *</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700">할인율 (%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700">수량(재고) *</label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">상품 설명 *</label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          ></textarea>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
          >
            {loading ? '수정 중...' : '상품 수정하기'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/mypage/seller/products')}
            className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
