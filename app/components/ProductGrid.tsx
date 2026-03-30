'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// 화면에 보여줄 때 필요한 API의 상품 데이터 타입 형태입니다.
export interface DBProduct {
  _id: string
  name: string
  brand: string
  price: number
  discount: number
  category: string
  images: string[]
}

export default function ProductGrid() {
  const [products, setProducts] = useState<DBProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')

  // 사용자가 검색할 상품명 입력을 담는 상태입니다.
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['전체', '의류', '신발', '가전', '리빙']

  // 등록된 실제 상품 목록을 서버(MongoDB)에서 불러옵니다. 검색어가 있으면 동적으로 적용됩니다.
  const fetchProducts = async (search = '') => {
    setLoading(true)
    try {
      // 검색어가 존재하면 쿼리 스트링으로 필터링 요청을 보냅니다.
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  // 페이지가 나타날 때 최초 1회 전체 상품을 불러옵니다.
  useEffect(() => {
    fetchProducts()
  }, [])

  // 검색 폼을 제출(엔터 키 또는 버튼 클릭)했을 때의 동작입니다.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(searchTerm) // 현재 입력된 단어로 검색을 수행합니다.
  }

  // API에서 가져온 상품들 중, 선택한 카테고리에 맞는 상품만 화면에 필터링합니다.
  const filteredProducts =
    selectedCategory === '전체' ? products : products.filter((p) => p.category === selectedCategory)

  return (
    <main className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">🔥 실시간 추천 아이템</h2>
          <p className="mt-2 font-medium text-slate-500">지금 사용자들에게 가장 사랑받는 베스트셀러</p>
        </div>

        {/* 상품 검색 입력 폼 영역 */}
        <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2 md:w-auto">
          <input
            type="text"
            placeholder="원하시는 상품을 검색해보세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-slate-300 px-5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700"
          >
            상품 검색
          </button>
        </form>
      </div>

      {/* 카테고리 필터 버튼 그룹 */}
      <div className="mb-10 mt-4 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2 text-[0.95rem] font-bold transition-all duration-200 ${
              selectedCategory === cat
                ? '-translate-y-0.5 transform bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        // 로딩 중일 때 표시할 메시지
        <div className="py-20 text-center font-bold text-slate-500">상품을 불러오는 중...</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center font-medium text-slate-500">
              해당 조건에 맞는 상품이 없습니다. 새로 등록해 보세요.
            </div>
          ) : (
            filteredProducts.map((p) => {
              // 실제 판매 가격(할인율 반영) 계산
              const finalPrice = Math.floor((p.price * (100 - p.discount)) / 100)

              // 등록된 상품 사진이 있으면 첫 번째 사진을, 없으면 회색 빈 칸을 표시합니다.
              const displayImage =
                p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300x400?text=No+Image'

              return (
                // DB에서 가져온 MongoDB Object ID(_id)를 활용해 링크를 동적으로 생성합니다.
                <Link href={`/products/${p._id}`} key={p._id} className="group flex cursor-pointer flex-col">
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-100 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImage}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {p.discount > 0 && (
                      <div className="absolute left-3 top-3 rounded-md bg-red-500 px-2 py-1.5 text-[0.7rem] font-bold tracking-wider text-white shadow-md">
                        {p.discount >= 20 ? 'HOT ITEM' : 'BEST'}
                      </div>
                    )}
                  </div>

                  <p className="mb-1 text-xs font-bold text-slate-400">{p.brand}</p>
                  <h3 className="mb-2 line-clamp-2 text-[0.95rem] font-semibold leading-snug text-slate-800 group-hover:underline md:text-base">
                    {p.name}
                  </h3>

                  <div className="mt-auto flex flex-wrap items-baseline gap-2">
                    {p.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-red-500 md:text-xl">{p.discount}%</span>
                        <span className="text-lg font-bold text-slate-900 md:text-xl">
                          {finalPrice.toLocaleString()}원
                        </span>
                        <span className="mt-1 w-full text-xs font-medium text-slate-400 line-through sm:mt-0 sm:w-auto sm:text-sm">
                          {p.price.toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-slate-900 md:text-xl">{p.price.toLocaleString()}원</span>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </main>
  )
}
