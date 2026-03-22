'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product } from '../../lib/data' // 분리된 데이터 모듈에서 Product 타입을 가져와 타입 안정성을 유지합니다.

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')

  const categories = ['전체', '의류', '신발', '가전', '리빙']

  const filteredProducts =
    selectedCategory === '전체' ? products : products.filter((p) => p.category === selectedCategory)

  return (
    <main className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">🔥 실시간 추천 아이템</h2>
          <p className="mt-2 font-medium text-slate-500">지금 사용자들에게 가장 사랑받는 베스트셀러</p>
        </div>
        <Link href="#" className="hidden font-bold text-blue-600 hover:underline sm:inline-block">
          전체 상품 보기 &rarr;
        </Link>
      </div>

      {/* 카테고리 필터 버튼 그룹 */}
      <div className="mb-10 flex flex-wrap gap-3">
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

      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center font-medium text-slate-500">
            해당 카테고리의 상품이 없습니다.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const finalPrice = Math.floor((p.price * (100 - p.discount)) / 100)
            return (
              // 상품 카드를 Next.js의 Link 태그로 감싸서 클릭 시 상품 상세 페이지(/products/[id])로 이동하도록 설정합니다.
              <Link href={`/products/${p.id}`} key={p.id} className="group flex cursor-pointer flex-col">
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
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
    </main>
  )
}
