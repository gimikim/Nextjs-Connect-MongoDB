'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  price: number
  stock: number
  category: string
  isAvailable: boolean
  createdAt: string
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // 컴포넌트 마운트 시 데이터베이스에서 판매자 본인이 올린 상품 목록을 불러옵니다.
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

  if (loading) return <div className="py-20 text-center font-bold text-slate-500">로딩 중...</div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">내 상품 관리</h1>
        {/* 새 상품을 등록할 수 있는 폼 페이지로 이동하는 버튼입니다. */}
        <Link
          href="/seller/products/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700"
        >
          + 새 상품 등록
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 text-center font-semibold">상품명</th>
              <th className="px-6 py-4 text-center font-semibold">카테고리</th>
              <th className="px-6 py-4 text-center font-semibold">가격</th>
              <th className="px-6 py-4 text-center font-semibold">재고</th>
              <th className="px-6 py-4 text-center font-semibold">상태</th>
              <th className="px-6 py-4 text-center font-semibold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  등록된 상품이 없습니다. 첫 상품을 등록해 보세요!
                </td>
              </tr>
            ) : (
              // 등록된 상품의 배열 구조를 순회하면서 행 단위로 보여좁니다.
              products.map((p) => (
                <tr key={p._id} className="text-center hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-slate-500">{p.category}</td>
                  <td className="px-6 py-4 text-slate-900">{p.price.toLocaleString()}원</td>
                  <td className="px-6 py-4 text-slate-500">{p.stock}개</td>
                  <td className="px-6 py-4">
                    {/* 판매 중인지, 중단했는지에 따라 스타일을 다르게 보여줍니다. */}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.isAvailable ? '판매중' : '판매중지'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/seller/products/${p._id}/edit`} className="font-bold text-blue-600 hover:underline">
                      수정
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
