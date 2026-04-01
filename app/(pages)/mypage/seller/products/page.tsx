'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Review {
  _id: string
  content: string
  rating: number
  createdAt: string
}

interface SellerProduct {
  _id: string
  name: string
  price: number
  stock: number
  images: string[]
  discount: number
  averageRating: number
  reviewCount: number
  reviews: Review[]
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/seller/products')
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
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-lg font-bold text-slate-500">상품 목록을 불러오는 중입니다...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">내 상품 목록</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">총 {products.length}개의 상품을 등록하셨습니다.</p>
        </div>
        <Link
          href="/mypage/seller/add"
          className="whitespace-nowrap rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
        >
          새 상품 등록하기
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-lg font-bold text-slate-400">아직 등록된 상품이 없습니다.</p>
          <Link
            href="/mypage/seller/add"
            className="inline-block text-blue-600 underline underline-offset-4 hover:text-blue-800"
          >
            첫 상품 등록하러 가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {products.map((p) => {
            const finalPrice = Math.floor((p.price * (100 - p.discount)) / 100)
            const displayImage =
              p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300x400?text=No+Image'

            return (
              <div
                key={p._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 transition-all hover:border-slate-300 hover:shadow-md md:flex-row"
              >
                {/* 이미지 영역 */}
                <div className="h-56 w-full shrink-0 bg-slate-100 md:h-auto md:w-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={displayImage} alt={p.name} className="h-full w-full object-cover" />
                </div>

                {/* 상품 및 리뷰 정보 영역 */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{p.name}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                          재고: {p.stock.toLocaleString()}개
                        </span>
                        {p.discount > 0 ? (
                          <>
                            <span className="font-bold text-red-500">{p.discount}%</span>
                            <span className="font-bold text-slate-900">{finalPrice.toLocaleString()}원</span>
                            <span className="font-medium text-slate-400 line-through">
                              {p.price.toLocaleString()}원
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-slate-900">{p.price.toLocaleString()}원</span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0">
                      <Link
                        href={`/mypage/seller/edit/${p._id}`}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        수정하기
                      </Link>
                    </div>
                  </div>

                  {/* 리뷰 & 별점 현황 */}
                  <div className="mt-auto pt-4">
                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-orange-100/50 bg-orange-50/50 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                        ⭐
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-orange-600">고객 평점</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-[1.1rem] font-black text-slate-900">{p.averageRating}</strong>
                          <span className="text-xs font-medium text-slate-400">/ 5.0 (총 {p.reviewCount}개)</span>
                        </div>
                      </div>
                    </div>

                    {/* 개별 리뷰 목록 (최근 3개) */}
                    {p.reviews && p.reviews.length > 0 ? (
                      <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-bold text-slate-500">최근 구매자 후기</p>
                        {p.reviews.slice(0, 3).map((review) => (
                          <div key={review._id} className="flex gap-2 text-[0.85rem] leading-snug">
                            <span className="shrink-0 font-bold text-amber-500">★ {review.rating}</span>
                            <span className="text-slate-700">{review.content}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                        <span className="text-sm font-medium text-slate-400">아직 등록된 후기가 없습니다.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
