import type { Product } from './types';

// picsum.photos를 이용한 임시 이미지 URL (나중에 실제 상품 이미지로 교체)
const img = (id: number) => `https://picsum.photos/seed/${id}/400/400`;

export const dummyProducts: Product[] = [
  // ──────────────────────────────
  // 전자기기
  // ──────────────────────────────
  {
    id: 'elec-001',
    name: '무선 블루투스 이어폰 AGX Pro',
    description: '노이즈캔슬링 기능과 최대 30시간 재생 가능한 고음질 무선 이어폰.',
    price: 89000,
    discountedPrice: 59000,
    imageUrl: img(10),
    category: '전자기기',
    stock: 150,
    rating: 4.7,
    reviewCount: 342,
    tags: ['베스트', '특가'],
    isBest: true,
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'elec-002',
    name: '스마트 보조배터리 20000mAh',
    description: 'PD 65W 고속충전 지원, 3포트 동시 충전 가능한 대용량 배터리.',
    price: 45000,
    discountedPrice: 32000,
    imageUrl: img(20),
    category: '전자기기',
    stock: 200,
    rating: 4.5,
    reviewCount: 215,
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'elec-003',
    name: '초경량 게이밍 마우스 RAX-7',
    description: '58g 초경량 설계, 16000DPI 광학 센서 탑재한 프로 게이밍 마우스.',
    price: 72000,
    discountedPrice: 55000,
    imageUrl: img(30),
    category: '전자기기',
    stock: 88,
    rating: 4.8,
    reviewCount: 557,
    tags: ['인기'],
    isBest: true,
    createdAt: '2025-01-20T09:00:00Z',
  },

  // ──────────────────────────────
  // 패션/의류
  // ──────────────────────────────
  {
    id: 'fashion-001',
    name: '남성 린넨 반팔 셔츠',
    description: '시원하고 통기성 좋은 린넨 소재의 캐주얼 반팔 셔츠. 색상 5종.',
    price: 35000,
    discountedPrice: 24900,
    imageUrl: img(40),
    category: '패션/의류',
    stock: 320,
    rating: 4.3,
    reviewCount: 128,
    createdAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'fashion-002',
    name: '여성 와이드 데님 팬츠',
    description: '편안한 핏의 와이드 데님 팬츠. 스트레치 소재로 활동성 UP.',
    price: 59000,
    discountedPrice: 39000,
    imageUrl: img(50),
    category: '패션/의류',
    stock: 180,
    rating: 4.6,
    reviewCount: 203,
    tags: ['신상'],
    createdAt: '2025-04-01T09:00:00Z',
  },

  // ──────────────────────────────
  // 생활/주방
  // ──────────────────────────────
  {
    id: 'living-001',
    name: '스테인리스 진공 텀블러 500ml',
    description: '24시간 보온/보냉 유지, 세척기 안전 사용 가능한 더블월 텀블러.',
    price: 28000,
    discountedPrice: 18000,
    imageUrl: img(60),
    category: '생활/주방',
    stock: 400,
    rating: 4.9,
    reviewCount: 891,
    tags: ['베스트'],
    isBest: true,
    createdAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'living-002',
    name: '에어프라이어 5.5L 대용량',
    description: '가족이 함께 쓰는 5.5L 대용량. 360도 열순환으로 고르게 조리.',
    price: 89000,
    discountedPrice: 68000,
    imageUrl: img(70),
    category: '생활/주방',
    stock: 55,
    rating: 4.7,
    reviewCount: 432,
    createdAt: '2025-01-05T09:00:00Z',
  },

  // ──────────────────────────────
  // 건강/뷰티
  // ──────────────────────────────
  {
    id: 'beauty-001',
    name: '비타민C 세럼 30ml',
    description: '고농축 비타민C 20% 함유. 미백·주름 개선, 피부 탄력에 도움.',
    price: 42000,
    discountedPrice: 29900,
    imageUrl: img(80),
    category: '건강/뷰티',
    stock: 230,
    rating: 4.6,
    reviewCount: 315,
    tags: ['인기'],
    createdAt: '2025-02-15T09:00:00Z',
  },
  {
    id: 'beauty-002',
    name: '프로바이오틱스 유산균 60캡슐',
    description: '100억 마리 생균 보장, 장 건강 + 면역력 강화에 도움을 주는 유산균.',
    price: 32000,
    discountedPrice: 22000,
    imageUrl: img(90),
    category: '건강/뷰티',
    stock: 500,
    rating: 4.4,
    reviewCount: 178,
    createdAt: '2025-03-10T09:00:00Z',
  },

  // ──────────────────────────────
  // 스포츠/레저
  // ──────────────────────────────
  {
    id: 'sports-001',
    name: '요가 매트 6mm 논슬립',
    description: '천연 고무 소재의 논슬립 요가 매트. 가방 포함, 두께 6mm.',
    price: 39000,
    discountedPrice: 27000,
    imageUrl: img(100),
    category: '스포츠/레저',
    stock: 120,
    rating: 4.5,
    reviewCount: 265,
    createdAt: '2025-01-25T09:00:00Z',
  },
  {
    id: 'sports-002',
    name: '스마트 줄넘기 디지털 카운터',
    description: '자동 카운팅, 칼로리 계산 기능 탑재. 블루투스 앱 연동.',
    price: 19800,
    discountedPrice: 13500,
    imageUrl: img(110),
    category: '스포츠/레저',
    stock: 300,
    rating: 4.2,
    reviewCount: 93,
    tags: ['신상'],
    createdAt: '2025-04-05T09:00:00Z',
  },

  // ──────────────────────────────
  // 식품
  // ──────────────────────────────
  {
    id: 'food-001',
    name: '제주 감귤 5kg (가정용)',
    description: '당도 12브릭스 이상의 달콤한 제주 노지 감귤. 소포장 개별 세척.',
    price: 22000,
    discountedPrice: 16900,
    imageUrl: img(120),
    category: '식품',
    stock: 70,
    rating: 4.8,
    reviewCount: 602,
    tags: ['베스트'],
    isBest: true,
    createdAt: '2024-11-20T09:00:00Z',
  },
  {
    id: 'food-002',
    name: '국내산 꿀 아카시아 500g',
    description: '인공 감미료 없이 순수 국내산 아카시아 꿀만을 담은 제품.',
    price: 24000,
    imageUrl: img(130),
    category: '식품',
    stock: 150,
    rating: 4.7,
    reviewCount: 284,
    createdAt: '2025-02-20T09:00:00Z',
  },
  {
    id: 'food-003',
    name: '혼합 견과류 데일리 30봉',
    description: '아몬드, 호두, 캐슈넛 등 7가지 견과를 한 봉에! 무설탕·무염.',
    price: 28000,
    discountedPrice: 22000,
    imageUrl: img(140),
    category: '식품',
    stock: 250,
    rating: 4.6,
    reviewCount: 477,
    tags: ['인기'],
    createdAt: '2025-01-15T09:00:00Z',
  },

  // ──────────────────────────────
  // 유아/완구
  // ──────────────────────────────
  {
    id: 'kids-001',
    name: '유아 블록 쌓기 120피스',
    description: '친환경 인증 소재, 소근육 발달에 좋은 컬러풀 블록 세트.',
    price: 35000,
    discountedPrice: 26000,
    imageUrl: img(150),
    category: '유아/완구',
    stock: 90,
    rating: 4.9,
    reviewCount: 348,
    tags: ['베스트'],
    createdAt: '2025-01-08T09:00:00Z',
  },
  {
    id: 'kids-002',
    name: '유아 안전 계단 의자',
    description: '화장실·세면대 발판 겸 의자. 미끄럼 방지 고무 패드 부착.',
    price: 29000,
    discountedPrice: 19900,
    imageUrl: img(160),
    category: '유아/완구',
    stock: 100,
    rating: 4.5,
    reviewCount: 156,
    createdAt: '2025-03-20T09:00:00Z',
  },

  // ──────────────────────────────
  // 반려동물
  // ──────────────────────────────
  {
    id: 'pet-001',
    name: '강아지 자동 급수기 2.5L',
    description: '활성탄 필터로 깨끗한 물 공급. 저소음 모터, 청소하기 쉬운 디자인.',
    price: 32000,
    discountedPrice: 24000,
    imageUrl: img(170),
    category: '반려동물',
    stock: 200,
    rating: 4.7,
    reviewCount: 389,
    tags: ['인기'],
    createdAt: '2025-01-30T09:00:00Z',
  },
  {
    id: 'pet-002',
    name: '고양이 스크래처 하우스',
    description: '골판지 스크래처 + 수면 공간 일체형. 조립 쉽고 내구성 강해.',
    price: 25000,
    discountedPrice: 17500,
    imageUrl: img(180),
    category: '반려동물',
    stock: 80,
    rating: 4.4,
    reviewCount: 211,
    createdAt: '2025-02-10T09:00:00Z',
  },

  // ──────────────────────────────
  // 기타
  // ──────────────────────────────
  {
    id: 'etc-001',
    name: '접이식 캠핑 테이블 경량',
    description: '알루미늄 소재, 무게 1.2kg. 4인용 캠핑·피크닉 테이블.',
    price: 48000,
    discountedPrice: 35000,
    imageUrl: img(190),
    category: '기타',
    stock: 60,
    rating: 4.6,
    reviewCount: 127,
    tags: ['신상'],
    createdAt: '2025-04-10T09:00:00Z',
  },
  {
    id: 'etc-002',
    name: '다기능 차량용 방향제 홀더',
    description: '환풍구 고정형, 자연향 리필형. 3가지 향 선택 가능. 인테리어 감성.',
    price: 12000,
    discountedPrice: 8900,
    imageUrl: img(200),
    category: '기타',
    stock: 400,
    rating: 4.3,
    reviewCount: 88,
    createdAt: '2025-03-25T09:00:00Z',
  },
];

/** 카테고리별 상품 필터링 헬퍼 함수 */
export const getProductsByCategory = (category: string) =>
  dummyProducts.filter((p) => p.category === category);

/** 베스트 상품만 */
export const getBestProducts = () =>
  dummyProducts.filter((p) => p.isBest);
