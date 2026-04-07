'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

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
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 파라미터에서 현재 상태를 읽어옵니다.
  const categoryParam = searchParams.get('category') || '전체'
  const searchParam = searchParams.get('search') || ''

  const [products, setProducts] = useState<DBProduct[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ['전체', '의류', '신발', '가전', '리빙']

  // 등록된 실제 상품 목록을 서버(MongoDB)에서 불러옵니다.
  const fetchProducts = async (search = '', category = '전체') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category && category !== '전체') params.append('category', category)

      const queryString = params.toString()
      const url = queryString ? `/api/products?${queryString}` : '/api/products'

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

  // URL 파라미터(search, category)가 변경될 때마다 데이터를 다시 불러오고 상태를 동기화합니다.
  useEffect(() => {
    fetchProducts(searchParam, categoryParam)
  }, [searchParam, categoryParam])

  // 카테고리를 변경했을 때 URL을 업데이트합니다.
  const handleCategoryChange = (cat: string) => {
    // 카테고리 클릭 시 검색어는 초기화 시켜 독립적으로 동작하게 합니다.
    const params = new URLSearchParams()

    if (cat && cat !== '전체') {
      params.set('category', cat)
    }

    router.push(`/?${params.toString()}`)
  }

  // 이제 서버에서 필터링된 상품들을 그대로 사용합니다.
  const filteredProducts = products

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 md:flex-row">
      {/* 왼쪽 사이드바 영역 */}
      <aside className="w-full shrink-0 md:w-64">
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-extrabold tracking-tight text-slate-900">카테고리</h3>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.95rem] font-bold transition-all duration-200 ${
                  categoryParam === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                {categoryParam === cat && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 오른쪽 메인 상품 목록 영역 */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">🔥 실시간 추천 아이템</h2>
            <p className="mt-2 font-medium text-slate-500">지금 사용자들에게 가장 사랑받는 베스트셀러</p>
          </div>
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
                        <span className="text-lg font-bold text-slate-900 md:text-xl">
                          {p.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}
      </div>
    </main>
  )
}
