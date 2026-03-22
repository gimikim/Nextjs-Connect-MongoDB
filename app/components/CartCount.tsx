'use client'

import { useEffect, useState } from 'react'
import { getCartFromDB, syncCartToDB } from '@/app/actions/cart'

export default function CartCount() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const updateCount = () => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        // 장바구니에 담긴 총 수량을 계산합니다.
        const totalItems = parsed.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
        setCount(totalItems)
      } catch {
        setCount(0)
      }
    } else {
      setCount(0)
    }
  }

  useEffect(() => {
    setMounted(true)

    // DB에서 전역 장바구니 동기화 (새로고침, 로그인 등 재접속 시 로컬 스토리지 유실 방지)
    const initGlobalCart = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let localCart: any[] = []
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        try {
          localCart = JSON.parse(storedCart)
        } catch {
          console.error('Cart parse failed')
        }
      }

      try {
        const res = await getCartFromDB()

        if (res.success && res.cart) {
          const dbCart = res.cart
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mergedMap = new Map<string, any>()
          const dbCartIds = new Set(dbCart.map((i: { id: number }) => i.id))

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dbCart.forEach((item: any) => {
            mergedMap.set(`${item.productId}-${item.color}-${item.size}`, item)
          })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          localCart.forEach((item: any) => {
            // 이미 DB에 존재하는(동기화 완료된) 동일 로컬 항목은 두 번 합산되지 않도록 건너뜀 (x2 렌더링 증식 버그 방지)
            if (dbCartIds.has(item.id)) return

            const key = `${item.productId}-${item.color}-${item.size}`
            if (mergedMap.has(key)) {
              const existing = mergedMap.get(key)
              mergedMap.set(key, { ...existing, quantity: existing.quantity + item.quantity })
            } else {
              mergedMap.set(key, item)
            }
          })

          const finalCart = Array.from(mergedMap.values())
          const dbStr = JSON.stringify(dbCart)
          const finalStr = JSON.stringify(finalCart)

          // 백엔드(DB) 상태와 최종 병합본(final)이 다르다면 (= 게스트용 로컬 장바구니가 섞여 들어왔다면)
          // DB에 동기화.
          if (dbStr !== finalStr) {
            localStorage.setItem('cart', finalStr)
            updateCount()
            await syncCartToDB(finalCart)
          } else {
            // DB 변경점이 없어도 로컬 스토리지 캐시는 DB 상태와 강제로 덮어씌워 (다른 브라우저 최신화 보장)
            localStorage.setItem('cart', finalStr)
            updateCount()
          }
        } else {
          updateCount()
        }
      } catch {
        updateCount()
      }
    }

    initGlobalCart()

    // 같은 탭 내에서 로컬스토리지 변경 시 업데이트를 위한 커스텀 이벤트
    window.addEventListener('cartUpdated', updateCount)
    // 다른 탭에서 변경 시 업데이트를 위한 스토리지 이벤트
    window.addEventListener('storage', updateCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  if (!mounted) return <span>0</span>

  return <span>{count}</span>
}
