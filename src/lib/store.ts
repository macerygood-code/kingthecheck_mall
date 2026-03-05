import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from './types';

// ==============================
// 장바구니 스토어
// ==============================

interface CartStore {
  items: CartItem[];
  // 장바구니에 상품 추가 (이미 있으면 수량 증가)
  addItem: (product: Product) => void;
  // 수량 변경
  updateQuantity: (productId: string, quantity: number) => void;
  // 장바구니에서 제거
  removeItem: (productId: string) => void;
  // 전체 비우기
  clearCart: () => void;
  // 총 금액 계산 (할인가 우선)
  getTotalPrice: () => number;
  // 총 상품 수량
  getTotalCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.id
          );
          if (existing) {
            // 이미 있는 상품이면 수량만 +1
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          // 새 상품 추가
          return {
            items: [
              ...state.items,
              { productId: product.id, product, quantity: 1 },
            ],
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountedPrice ?? item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'kingthecheck-cart', // localStorage에 저장되는 키 이름
    }
  )
);

// ==============================
// 찜목록(위시리스트) 스토어
// ==============================

interface WishlistStore {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (product) => {
        set((state) => ({
          wishlist: state.wishlist.some((p) => p.id === product.id)
            ? state.wishlist // 이미 있으면 그대로
            : [...state.wishlist, product],
        }));
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((p) => p.id !== productId),
        }));
      },

      isWishlisted: (productId) => {
        return get().wishlist.some((p) => p.id === productId);
      },
    }),
    {
      name: 'kingthecheck-wishlist',
    }
  )
);
