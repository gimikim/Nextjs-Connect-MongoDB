import Order from '@/db/models/order'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedMockOrders(userId: string | any, address: string, name: string, phone: string) {
  // 사용자의 주문 내역 화면을 다채롭게 채우기 위해
  // 배송완료 2건 (하나는 과거, 하나는 최근), 배송중 1건으로 가상의 주문 3건을 생성합니다.
  const now = new Date()

  const mockOrders = [
    {
      userId,
      orderNumber: `ORD-${now.getTime().toString().slice(-6)}-1`,
      totalAmount: 140300,
      status: '배송완료',
      shippingAddress: address,
      recipientName: name,
      recipientPhone: phone,
      // 한 달 전 구매 건
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      items: [
        {
          productId: 1,
          name: '시그니처 오버핏 트렌치 코트',
          brand: 'MODERN',
          price: 159000,
          discount: 30,
          finalPrice: 111300,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
        },
        {
          productId: 5,
          name: '에센셜 코튼 100% 베이직 티셔츠',
          brand: 'MODERN',
          price: 29000,
          discount: 0,
          finalPrice: 29000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
        },
      ],
    },
    {
      userId,
      orderNumber: `ORD-${(now.getTime() - 10000).toString().slice(-6)}-2`,
      totalAmount: 75650,
      status: '배송완료',
      shippingAddress: address,
      recipientName: name,
      recipientPhone: phone,
      // 8개월 전 구매 건 (이전 연도 또는 더 과거 데이터 필터 테스트용)
      createdAt: new Date(now.getFullYear(), now.getMonth() - 8, 10),
      items: [
        {
          productId: 2,
          name: '프리미엄 레더 스니커즈 블랑',
          brand: 'SNEAKERS',
          price: 89000,
          discount: 15,
          finalPrice: 75650,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
        },
      ],
    },
    {
      userId,
      orderNumber: `ORD-${(now.getTime() - 20000).toString().slice(-6)}-3`,
      totalAmount: 33250,
      status: '배송중',
      shippingAddress: address,
      recipientName: name,
      recipientPhone: phone,
      // 최근 3일 전 구매 건
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: 8,
          name: '천연 유기농 아로마 디퓨저',
          brand: 'HOME',
          price: 35000,
          discount: 5,
          finalPrice: 33250,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1608528577891-eb05fcd393ed?w=600&q=80',
        },
      ],
    },
  ]

  await Order.insertMany(mockOrders)
}
