'use client'

import { useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { products } from '../../../../lib/data' // 앱 데이터 저장소에서 상품 정보를 불러옵니다.

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // URL 파라미터로 전달받은 id를 기반으로 상품 조회
  const productId = parseInt(params.id, 10)
  const product = products.find((p) => p.id === productId)
  const router = useRouter()

  // 상품이 존재하지 않으면 Next.js의 notFound()를 호출하여 404 페이지를 렌더링
  if (!product) {
    notFound()
  }

  // 1. 상태 관리를 통해 메인 노출 이미지 및 사용자 구매 수량을 동적으로 처리합니다.
  const [selectedImage, setSelectedImage] = useState(product.gallery[0] || product.image)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  // 할인율이 적용된 개당 최종 금액입니다.
  const finalPrice = Math.floor((product.price * (100 - product.discount)) / 100)

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

  // 장바구니 담기 실행 함수
  const handleAddToCart = () => {
    // 상품 옵션 선택 검증
    if (!selectedColor || !selectedSize) {
      alert('색상과 사이즈를 모두 선택해 주세요.')
      return
    }

    const cartItem = {
      id: Date.now(), // 고유 장바구니 아이템 ID
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: selectedImage,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    }

    // 로컬 스토리지에서 기존 장바구니 불러오기
    const storedCart = localStorage.getItem('cart')
    const cart = storedCart ? JSON.parse(storedCart) : []
    
    // 장바구니에 아이템 추가 및 저장
    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))

    // 장바구니 페이지로 이동
    router.push('/cart')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 md:py-24">
      {/* 화면 전체를 여유롭게 쓰는 컨테이너 디자인 적용 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 md:flex-row lg:gap-20">
          {/* 상품 이미지 갤러리 영역 */}
          <div className="flex w-full shrink-0 flex-col gap-4 md:w-1/2">
            {/* 메인 이미지 렌더링 로직 - 선택된 이미지가 보이도록 state 활용 */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* 할인이 있는 제품에만 강조 뱃지를 표시 */}
              {product.discount > 0 && (
                <div className="absolute left-4 top-4 rounded-lg bg-red-500 px-3 py-2 text-sm font-bold tracking-wider text-white shadow-lg">
                  {product.discount >= 20 ? 'HOT ITEM' : 'BEST'}
                </div>
              )}
            </div>

            {/* 썸네일 리스트 렌더링 로직 - 갤러리 배열을 펼쳐서 클릭 시 메인 이미지 변경 */}
            {product.gallery.length > 1 && (
              <div className="scrollbar-hide flex w-full gap-3 overflow-x-auto pb-2">
                {product.gallery.map((imgUrl, index) => (
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

            {/* 상품 상세 및 고시 정보 (상품 이미지 하단) */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600 md:mt-8">
              <h3 className="mb-4 border-b border-slate-200 pb-3 font-bold text-slate-900">상품 필수 정보</h3>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">성별</span>
                  <span className="text-slate-800">남여공용</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">높이</span>
                  <span className="text-slate-800">2cm</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">깔창 종류</span>
                  <span className="text-slate-800">뒷굽깔창</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">소재</span>
                  <span className="text-slate-800">메모리폼</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">사용대상 구분</span>
                  <span className="text-slate-800">남녀공용</span>
                </li>
                <li className="flex">
                  <span className="w-32 shrink-0 font-medium text-slate-500">쿠팡상품번호</span>
                  <span className="text-slate-800">4314116035 - 5010920379</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 상품 상세 정보 및 인터랙션 영역 */}
          <div className="flex w-full flex-col md:py-8">
            <span className="mb-2 text-sm font-bold tracking-widest text-slate-400">{product.brand}</span>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{product.name}</h1>

            {/* 가격 정보 표시 */}
            <div className="mb-6 flex flex-wrap items-baseline gap-3 border-b border-slate-100 pb-6">
              {product.discount > 0 ? (
                <>
                  <span className="text-3xl font-black text-red-500 md:text-4xl">{product.discount}%</span>
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

            {/* 배송 정보 영역 */}
            <div className="mb-6 border-b border-slate-100 pb-6 text-[0.95rem] text-slate-600">
              <div className="flex items-center gap-4">
                <span className="w-20 shrink-0 font-bold text-slate-900">배송비</span>
                <span className="font-semibold text-slate-800">
                  무료배송 <span className="ml-1 text-sm font-normal text-slate-400">(도서산간 지역 3,000원 추가)</span>
                </span>
              </div>
            </div>

            {/* 추가된: 상품 상세 긴 설명 텍스트 영역 */}
            {product.description && (
              <div className="mb-10 text-[0.95rem] leading-relaxed text-slate-600">
                <h3 className="mb-3 text-[1.05rem] font-bold text-slate-900">상품 상세 설명</h3>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* 추가된: 옵션 선택 영역 (색상, 사이즈) */}
            <div className="mb-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900">색상</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">색상을 선택하세요</option>
                  <option value="블랙">블랙</option>
                  <option value="화이트">화이트</option>
                  <option value="그레이">그레이</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900">사이즈</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">사이즈를 선택하세요</option>
                  <option value="230">230mm</option>
                  <option value="240">240mm</option>
                  <option value="250">250mm</option>
                  <option value="260">260mm</option>
                  <option value="270">270mm</option>
                  <option value="280">280mm</option>
                </select>
              </div>
            </div>

            {/* 추가된: 수량 조절 및 총 결제 금액 영역 */}
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
                  disabled={quantity >= 10}
                >
                  <span className="mb-0.5 text-xl font-bold">+</span>
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-end justify-between">
              <span className="text-lg font-bold text-slate-900">총 상품 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-blue-600">{totalPrice.toLocaleString()}</span>
                <span className="font-bold text-slate-900">원</span>
              </div>
            </div>

            {/* 액션 버튼 영역 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-4 text-lg font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-slate-50 active:scale-[0.98]"
              >
                장바구니 담기
              </button>
              <button className="flex-1 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.23)] active:scale-[0.98]">
                바로 구매하기 ({quantity}개)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
