// ==============================
// 상품(Product) 관련 타입
// ==============================

/** 상품 카테고리 목록 (나중에 DB로 옮겨도 이 타입은 유지) */
export type Category =
  | '전자기기'
  | '패션/의류'
  | '생활/주방'
  | '건강/뷰티'
  | '스포츠/레저'
  | '식품'
  | '유아/완구'
  | '반려동물'
  | '기타';

/** 상품 하나의 전체 정보 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;           // 정가 (원)
  discountedPrice?: number; // 할인가 (없으면 정가가 실제 판매가)
  imageUrl: string;
  category: Category;
  stock: number;           // 재고 수량
  rating: number;          // 0~5 평점
  reviewCount: number;
  tags?: string[];         // 예: ['신상', '베스트']
  isBest?: boolean;
  isNew?: boolean;
  createdAt: string;       // ISO 8601 형식
}

// ==============================
// 장바구니(CartItem) 관련 타입
// ==============================

/** 장바구니에 담긴 상품 1개 */
export interface CartItem {
  productId: string;
  product: Product;        // 상품 상세 정보 (Zustand 스토어에서 참조)
  quantity: number;
}

// ==============================
// 유저(User) 관련 타입
// ==============================

/** 사용자 정보 (Supabase auth.user + 추가 프로필) */
export interface User {
  id: string;              // Supabase UUID
  email: string;
  name: string;
  phone?: string;
  address?: {
    zipCode: string;
    address1: string;
    address2: string;
  };
  role: 'customer' | 'admin';
  createdAt: string;
}

// ==============================
// 주문(Order) 관련 타입
// ==============================

/** 주문 1건의 배송 상태 */
export type OrderStatus =
  | '결제대기'
  | '결제완료'
  | '배송준비'
  | '배송중'
  | '배송완료'
  | '취소'
  | '반품';

/** 주문 1건의 아이템 (스냅샷) */
export interface OrderItem {
  productId: string;
  productName: string;    // 주문 시점의 이름 (나중에 상품명이 바뀌어도 기록 보존)
  price: number;          // 주문 시점의 단가
  quantity: number;
  imageUrl: string;
}

/** 주문 1건 전체 */
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;    // 총 결제 금액
  status: OrderStatus;
  shippingAddress: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2: string;
  };
  paymentMethod: string;  // 예: '토스페이먼츠', '카카오페이'
  pgOrderId?: string;     // PG사에서 발급한 주문 ID (결제 검증용)
  createdAt: string;
  updatedAt: string;
}
