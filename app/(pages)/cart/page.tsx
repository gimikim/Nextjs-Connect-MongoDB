'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([]) // 체크된 아이템들의 ID 저장
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        setCartItems(parsed)
        // 기본적으로 모든 아이템을 선택 상태로 둡니다.
        setSelectedItems(parsed.map((item: CartItem) => item.id))
      } catch {
        console.error('Failed to parse cart JSON')
      }
    }
  }, [])

  const handleRemoveItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedCart)
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id)) // 선택 목록에서도 제거
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    const updatedCart = cartItems.filter((item) => !selectedItems.includes(item.id))
    setCartItems(updatedCart)
    setSelectedItems([])
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleCheckout = async () => {
    const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id))
    if (selectedCartItems.length === 0) return

    // 로그인 여부 체크
    try {
      const authCheck = await fetch('/api/me')
      if (!authCheck.ok) {
        alert('결제를 진행하시려면 먼저 로그인이 필요합니다.')
        router.push('/auth?type=login')
        return
      }
    } catch {
      alert('접속 상태를 확인할 수 없습니다.')
      return
    }

    localStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems))
    router.push('/checkout')
  }

  // Hydration 처리를 위한 로딩 (localStorage는 클라이언트에서만 접근 가능)
  if (!mounted) return <div className="min-h-screen bg-slate-50" />

  // 선택된 상품들만 합산을 계산합니다.
  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id))
  const totalAmount = selectedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee: number = 0 // 전 상품 무료배송 정책 (도서산간 제외)

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900">장바구니</h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* 장바구니 목록 영역 */}
          <div className="flex-1 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mb-4 text-6xl">🛒</div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">장바구니가 비어있습니다</h3>
                <p className="mb-8 text-slate-500">원하는 상품을 장바구니에 담아보세요!</p>
                <Link
                  href="/"
                  className="inline-block rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white transition-colors hover:bg-blue-700"
                >
                  쇼핑 계속하기
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 전체 선택 및 선택 삭제 헤더 */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span className="font-bold text-slate-700">
                      전체 선택 ({selectedItems.length}/{cartItems.length})
                    </span>
                  </label>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedItems.length === 0}
                    className="text-sm font-bold text-slate-500 transition-colors hover:text-red-500 disabled:opacity-50 disabled:hover:text-slate-500"
                  >
                    선택 삭제
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    {/* 개별 체크박스 */}
                    <div className="flex shrink-0 items-center justify-start sm:w-8 sm:justify-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </div>

                    {/* 상품 이미지 */}
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex flex-1 flex-col">
                      <Link
                        href={`/products/${item.productId}`}
                        className="mb-1 text-lg font-bold text-slate-900 transition-colors hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <div className="mb-3 text-sm text-slate-500">
                        색상: {item.color} / 사이즈: {item.size} / 수량: {item.quantity}개
                      </div>
                      <div className="font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()}원</div>
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="sm:ml-4">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 결제 정보 고정 영역 */}
          <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[340px]">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">결제 정보</h2>

              <div className="mb-6 space-y-4 text-slate-600">
                <div className="flex justify-between">
                  <span>총 상품 금액</span>
                  <span className="font-medium text-slate-900">{totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span className="font-medium text-slate-900">
                    {deliveryFee === 0 ? '무료' : `${(deliveryFee as number).toLocaleString()}원`}
                  </span>
                </div>
              </div>

              <div className="mb-8 flex items-end justify-between border-t border-slate-100 pt-6">
                <span className="font-bold text-slate-900">총 결제 금액</span>
                <span className="text-2xl font-black text-blue-600">
                  {(totalAmount + deliveryFee).toLocaleString()}원
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.23)] disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
              >
                결제하기 {selectedItems.length > 0 && `(${selectedItems.length}건)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
