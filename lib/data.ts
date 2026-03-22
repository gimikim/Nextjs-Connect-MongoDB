export type Product = {
  id: number
  name: string
  brand: string
  category: string
  price: number
  discount: number
  image: string
  gallery: string[] // 추가: 다각도 상품 이미지 모음
  description: string // 추가: 상품 상세 설명
}

// 애플리케이션 전반에서 공통으로 사용할 샘플 상품 데이터 리스트입니다.
export const products: Product[] = [
  {
    id: 1,
    name: '시그니처 오버핏 트렌치 코트',
    brand: 'MODERN',
    category: '의류',
    price: 159000,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
      'https://images.unsplash.com/photo-1434389678369-182cb1ab5e5a?w=600&q=80',
      'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&q=80',
      'https://images.unsplash.com/photo-1574626003295-88556db2da6d?w=600&q=80',
    ],
    description:
      '클래식한 디자인과 현대적인 오버핏 실루엣이 결합된 프리미엄 트렌치 코트입니다. 방풍 및 생활 방수 기능이 뛰어난 고밀도 코튼 혼방 소재를 사용하여 변덕스러운 날씨에도 우아함을 유지할 수 있습니다. 넉넉한 핏으로 체형에 관계없이 멋스러운 스타일링이 가능합니다.',
  },
  {
    id: 2,
    name: '프리미엄 레더 스니커즈 블랑',
    brand: 'SNEAKERS',
    category: '신발',
    price: 89000,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
    ],
    description:
      '이탈리아산 프리미엄 천연 가죽으로 제작되어 부드럽고 편안한 착화감을 자랑하는 레더 스니커즈입니다. 미니멀한 화이트 컬러 베이스에 깔끔한 스티치 포인트를 주어 어떤 착장에도 무난하게 어울리며, 인체공학적 인솔 탑재로 장시간 보행에도 발이 피로하지 않습니다.',
  },
  {
    id: 3,
    name: '노이즈 캔슬링 하이파이 헤드폰',
    brand: 'SOUND.X',
    category: '가전',
    price: 299000,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
    ],
    description:
      '최첨단 액티브 노이즈 캔슬링(ANC) 기술을 탑재하여 주변 소음을 완벽히 차단하고 오롯이 음악에만 집중할 수 있게 해주는 최고급 하이파이 헤드폰입니다. 40mm 다이나믹 드라이버가 뿜어내는 풍성한 베이스와 선명한 고음을 경험해 보세요.',
  },
  {
    id: 4,
    name: '미니멀 세라믹 머그 잔 세트',
    brand: 'LIVING',
    category: '리빙',
    price: 25000,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
      'https://images.unsplash.com/photo-1577401239170-897940cb41bd?w=600&q=80',
      'https://images.unsplash.com/photo-1575411326442-f04bf409deff?w=600&q=80',
    ],
    description:
      '핸드메이드 느낌을 살린 무광 세라믹 소재의 2인 머그 잔 세트입니다. 일상적인 커피 한 잔도 특별하게 만들어주는 감성적인 디자인으로, 열 보존율이 뛰어나 따뜻한 음료를 오랫동안 즐기기에 적합합니다. 패키징이 정성스러워 집들이 선물용으로도 인기가 많은 제품입니다.',
  },
  {
    id: 5,
    name: '에센셜 코튼 100% 베이직 티셔츠',
    brand: 'MODERN',
    category: '의류',
    price: 29000,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
    ],
    description:
      '수퍼 코마사 순면 100% 원단을 사용하여 피부 자극이 없고 쾌적한 착용감을 선사하는 베이직 티셔츠입니다. 넥라인에 이중 밴딩 처리를 하여 잦은 세탁에도 목 늘어남을 최소화했으며, 사계절 내내 필수 이너웨어 혹은 단독으로 활용할 수 있는 아이템입니다.',
  },
  {
    id: 6,
    name: '스마트 피트니스 스포츠 워치',
    brand: 'TECH',
    category: '가전',
    price: 159000,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
      'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=600&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02bbfb77ce?w=600&q=80',
    ],
    description:
      '운동 기록 추적, 심박수 모니터링, 수면 분석 등 피트니스 기능이 강화된 스마트 워치입니다. IP68 등급의 방수 방진을 지원하여 수영, 러닝 등 야외 활동에도 안전하게 사용 가능합니다. 한 번 충전으로 최대 7일간 사용 가능한 배터리 효율성을 자랑합니다.',
  },
  {
    id: 7,
    name: '빈티지 워싱 와이드 데님 팬츠',
    brand: 'STYLE',
    category: '의류',
    price: 59000,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
    ],
    description:
      '트렌디한 와이드 핏과 자연스러운 빈티지 워싱이 매력적인 데님 팬츠입니다. 무릎 늘어남을 방지하는 특수 데님 원단을 사용했으며, YKK 지퍼 디테일로 내구성을 높였습니다. 롱 기장으로 신발을 살짝 덮는 스타일리시한 연출이 가능합니다.',
  },
  {
    id: 8,
    name: '천연 유기농 아로마 디퓨저',
    brand: 'HOME',
    category: '리빙',
    price: 35000,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1608528577891-eb05fcd393ed?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608528577891-eb05fcd393ed?w=600&q=80',
      'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80',
    ],
    description:
      '인공 화합물이 첨가되지 않은 100% 천연 에센셜 오일로만 블렌딩된 프리미엄 유기농 디퓨저입니다. 공간에은은하고 고급스러운 향기를 가득 채워 피로 회복과 심신 안정에 도움을 줍니다. 알데하이드, 프탈레이트 무설폰으로 반려 동물이나 아기가 있는 집에서도 안전하게 사용할 수 있습니다.',
  },
]
