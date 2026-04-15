'use client'

import { useState, useEffect, use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import ProductReviewSection from '@/app/components/ProductReviewSection'
import { syncCartToDB } from '@/app/actions/cart'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const unwrappedParams = use(params)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${unwrappedParams.id}`)
        if (!res.ok) {
          throw new Error('NotFound')
        }
        const data = await res.json()
        setProduct(data.product)

        // 메인 이미지 설정
        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(data.product.images[0])
        } else if (data.product.image) {
          setSelectedImage(data.product.image) // 구버전 데이터 호환용
        } else {
          setSelectedImage('https://via.placeholder.com/600x800?text=No+Image')
        }
      } catch (err) {
        console.error(err)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [unwrappedParams.id])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-xl font-bold text-slate-400">상품 정보를 불러오는 중입니다...</div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  // 할인율이 적용된 개당 최종 금액입니다.
  const discount = product.discount || 0
  const finalPrice = Math.floor((product.price * (100 - discount)) / 100)
  const gallery = product.images || product.gallery || [product.image]

  // 수량 감소 기능 (최소 1개)
  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  // 수량 증가 기능 (최대 주문 수량 제한 예시로 10개)
  const handleIncreaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1)
  }

  // 선택된 수량에 맞춰 총 결제 금액 계산
  const totalPrice = finalPrice * quantity

  // 바로 구매하기 실행 함수
  const handleBuyNow = async () => {
    if (!selectedColor || !selectedSize) {
      alert('색상과 사이즈를 모두 선택해 주세요.')
      return
    }

    try {
      const authCheck = await fetch('/api/me')
      if (!authCheck.ok) {
        alert('상품을 구매하시려면 먼저 로그인이 필요합니다.')
        router.push('/auth?type=login')
        return
      }
    } catch {
      alert('접속 상태를 확인할 수 없습니다.')
      return
    }

    const buyItem = {
      id: Date.now(),
      productId: product._id,
      name: product.name,
      price: finalPrice,
      image: selectedImage,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    }

    localStorage.setItem('checkoutItems', JSON.stringify([buyItem]))
    router.push('/checkout')
  }

  // 장바구니 담기 실행 함수
  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      alert('색상과 사이즈를 모두 선택해 주세요.')
      return
    }

    const cartItem = {
      id: Date.now(),
      productId: product._id,
      name: product.name,
      price: finalPrice,
      image: selectedImage,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    }

    const storedCart = localStorage.getItem('cart')
    const cart = storedCart ? JSON.parse(storedCart) : []

    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))

    try {
      await syncCartToDB(cart)
    } catch (e) {
      console.error('Failed to sync cart', e)
    }

    router.push('/cart')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 md:flex-row lg:gap-20">
          {/* 상품 이미지 갤러리 영역 */}
          <div className="flex w-full shrink-0 flex-col gap-4 md:w-1/2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {discount > 0 && (
                <div className="absolute left-4 top-4 rounded-lg bg-red-500 px-3 py-2 text-sm font-bold tracking-wider text-white shadow-lg">
                  {discount >= 20 ? 'HOT ITEM' : 'BEST'}
                </div>
              )}
            </div>

            {/* 썸네일 리스트 */}
            {gallery && gallery.length > 1 && (
              <div className="scrollbar-hide flex w-full gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === imgUrl
                        ? 'border-blue-600 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 고정 상품 고시 정보 */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600 md:mt-8">
              <h3 className="mb-4 border-b border-slate-200 pb-3 font-bold text-slate-900">상품 필수 정보</h3>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">브랜드</span>
                  <span className="text-slate-800">{product.brand || '브랜드 없음'}</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">카테고리</span>
                  <span className="text-slate-800">{product.category || '일반상품'}</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">배송구분</span>
                  <span className="text-slate-800">일반배송</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 상품 상세 및 결제 영역 */}
          <div className="flex w-full flex-col md:py-8">
            <span className="mb-2 text-sm font-bold tracking-widest text-slate-400">{product.brand || 'NO BRAND'}</span>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{product.name}</h1>

            {/* 가격 정보 */}
            <div className="mb-6 flex flex-wrap items-baseline gap-3 border-b border-slate-100 pb-6">
              {discount > 0 ? (
                <>
                  <span className="text-3xl font-black text-red-500 md:text-4xl">{discount}%</span>
                  <span className="text-3xl font-black text-slate-900 md:text-4xl">
                    {finalPrice.toLocaleString()}원
                  </span>
                  <span className="mt-1 w-full text-lg font-medium tracking-tight text-slate-400 line-through sm:w-auto">
                    {product.price.toLocaleString()}원
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-slate-900 md:text-4xl">
                  {product.price.toLocaleString()}원
                </span>
              )}
            </div>

            <div className="mb-6 border-b border-slate-100 pb-6 text-[0.95rem] text-slate-600">
              <div className="flex items-center gap-4">
                <span className="w-20 shrink-0 font-bold text-slate-900">배송비</span>
                <span className="font-semibold text-slate-800">
                  {product.shippingFee ? `${product.shippingFee.toLocaleString()}원` : '무료배송'}{' '}
                  <span className="ml-1 text-sm font-normal text-slate-400">(도서산간 지역 추가요금 발생)</span>
                </span>
              </div>
            </div>

            {/* 상세 설명 */}
            {product.description && (
              <div className="mb-10 text-[0.95rem] leading-relaxed text-slate-600">
                <h3 className="mb-3 text-[1.05rem] font-bold text-slate-900">상품 상세 설명</h3>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* 옵션 선택 */}
            <div className="mb-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900">색상 (기본옵션)</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">색상을 선택하세요</option>
                  <option value="기본">기본 색상</option>
                  <option value="블랙">블랙</option>
                  <option value="화이트">화이트</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900">사이즈/규격</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">사이즈를 선택하세요</option>
                  <option value="FREE">FREE</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                </select>
              </div>
            </div>

            {/* 수량 및 총액 */}
            <div className="mb-6 mt-auto flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <span className="font-bold text-slate-900">구매 수량</span>
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1">
                <button
                  onClick={handleDecreaseQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors hover:bg-slate-200"
                  disabled={quantity <= 1}
                >
                  <span className="mb-1 text-xl font-bold">-</span>
                </button>
                <span className="w-6 text-center font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors hover:bg-slate-200"
                  disabled={quantity >= product.stock}
                >
                  <span className="mb-0.5 text-xl font-bold">+</span>
                </button>
                <span className="ml-2 text-sm font-medium text-slate-400">(재고: {product.stock || 100})</span>
              </div>
            </div>

            <div className="mb-6 flex items-end justify-between">
              <span className="text-lg font-bold text-slate-900">총 결제예정 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-blue-600">{totalPrice.toLocaleString()}</span>
                <span className="font-bold text-slate-900">원</span>
              </div>
            </div>

            {/* 결제하기/장바구니 담기 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-4 text-lg font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-slate-50 disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                장바구니 담기
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.23)] disabled:bg-slate-300 disabled:shadow-none"
              >
                {product.stock === 0 ? '품절' : `바로 구매하기 (${quantity}개)`}
              </button>
            </div>
          </div>
        </div>

        {/* 리뷰 영역 */}
        <ProductReviewSection productId={product._id} />
      </div>
    </div>
  )
}
