'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { ShoppingCart, Trash2, Ticket, ChevronRight } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('ko-KR');
const FREE_SHIPPING_MIN = 30000;
const SHIPPING_FEE = 3000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  // 체크 상태 (상품 ID → boolean)
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => Object.fromEntries(items.map((i) => [i.product.id, true]))
  );
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const allIds = items.map((i) => i.product.id);
  const allChecked = allIds.every((id) => checked[id]);
  const someChecked = allIds.some((id) => checked[id]);

  const toggleAll = () => {
    const next = !allChecked;
    setChecked(Object.fromEntries(allIds.map((id) => [id, next])));
  };

  const toggleOne = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const deleteSelected = () => {
    allIds.filter((id) => checked[id]).forEach((id) => removeItem(id));
    setChecked((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([id]) => !checked[id]))
    );
  };

  // 선택된 상품의 합산
  const selectedItems = items.filter((i) => checked[i.product.id]);
  const selectedPrice = selectedItems.reduce(
    (acc, { product, quantity }) =>
      acc + (product.discountedPrice ?? product.price) * quantity,
    0
  );
  const shipping = selectedPrice >= FREE_SHIPPING_MIN || selectedPrice === 0 ? 0 : SHIPPING_FEE;
  const discount = couponApplied ? 3000 : 0;
  const totalPrice = selectedPrice + shipping - discount;

  // 빈 장바구니
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-[#111] mb-2">장바구니가 비어있어요</h1>
        <p className="text-sm text-[#999] mb-8">마음에 드는 상품을 담아보세요!</p>
        <Link
          href="/products"
          className="inline-block bg-primary text-white font-bold px-10 py-3.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <h1 className="text-xl font-extrabold text-[#111] mb-5">
        장바구니 <span className="text-base font-normal text-[#999]">({items.length})</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* ════ 좌측: 상품 목록 ════ */}
        <div className="flex-1 min-w-0">

          {/* 전체선택 + 선택삭제 */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm font-medium text-[#333]">
                전체선택 ({selectedItems.length}/{items.length})
              </span>
            </label>
            {someChecked && (
              <button
                onClick={deleteSelected}
                className="text-xs text-[#999] hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                선택 삭제
              </button>
            )}
          </div>

          {/* 상품 카드 목록 */}
          <div className="space-y-3">
            {items.map(({ product, quantity }) => {
              const isOutOfStock = product.stock === 0;
              const price = product.discountedPrice ?? product.price;
              const discountRate = product.discountedPrice
                ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl p-4 flex items-start gap-3 ${isOutOfStock ? 'opacity-60' : ''}`}
                >
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={!!checked[product.id]}
                    onChange={() => toggleOne(product.id)}
                    disabled={isOutOfStock}
                    className="w-4 h-4 accent-primary mt-1 flex-shrink-0"
                  />

                  {/* 이미지 */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://via.placeholder.com/160x160?text=${encodeURIComponent(product.name.slice(0, 4))}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">품절</span>
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.id}`}>
                      <p className="text-sm font-medium text-[#111] line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </p>
                    </Link>
                    <p className="text-xs text-[#999] mt-0.5">{product.category}</p>

                    {/* 가격 */}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {discountRate > 0 && (
                        <span className="text-[#E02020] text-xs font-bold">{discountRate}%</span>
                      )}
                      <span className="text-sm font-extrabold text-[#111]">{fmt(price)}원</span>
                      {product.discountedPrice && (
                        <span className="text-xs text-[#bbb] line-through">{fmt(product.price)}원</span>
                      )}
                    </div>

                    {/* 수량 조절 */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`flex items-center border border-gray-200 rounded-lg overflow-hidden ${isOutOfStock ? 'pointer-events-none' : ''}`}>
                        <button
                          onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center text-[#666] hover:bg-gray-50 text-base"
                        >−</button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, Math.min(product.stock || 99, quantity + 1))}
                          className="w-7 h-7 flex items-center justify-center text-[#666] hover:bg-gray-50 text-base"
                        >+</button>
                      </div>
                      <span className="text-sm font-bold text-primary">{fmt(price * quantity)}원</span>
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-[#ccc] hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════ 우측: 주문 요약 (sticky) ════ */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 md:sticky md:top-[130px]">
            <h2 className="font-bold text-[#111] mb-4">주문 요약</h2>

            {/* 선택 상품 수 + 금액 */}
            <div className="space-y-2 text-sm text-[#666] mb-4">
              <div className="flex justify-between">
                <span>선택 상품 ({selectedItems.length}개)</span>
                <span>{fmt(selectedPrice)}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                {shipping === 0
                  ? <span className="text-green-600 font-semibold">무료</span>
                  : <span>{fmt(shipping)}원</span>
                }
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-[#999]">
                  {fmt(FREE_SHIPPING_MIN - selectedPrice)}원 더 담으면 무료배송
                </p>
              )}
              {couponApplied && (
                <div className="flex justify-between text-[#E02020]">
                  <span>쿠폰 할인</span>
                  <span>-{fmt(discount)}원</span>
                </div>
              )}
            </div>

            {/* 쿠폰 입력 */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 gap-2">
                <Ticket className="w-4 h-4 text-[#bbb]" />
                <input
                  type="text"
                  placeholder="쿠폰코드 입력"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="text-sm py-2.5 outline-none w-full placeholder:text-[#ccc]"
                />
              </div>
              <button
                onClick={() => {
                  if (couponCode.trim()) setCouponApplied(true);
                }}
                className="px-3 py-2.5 bg-gray-100 text-sm font-semibold text-[#555] rounded-lg hover:bg-gray-200 transition-colors"
              >
                적용
              </button>
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* 총 결제 금액 */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-[#111]">총 결제 금액</span>
              <span className="text-xl font-extrabold text-primary">{fmt(totalPrice)}원</span>
            </div>

            {/* 주문하기 버튼 */}
            {selectedItems.length > 0 ? (
              <Link
                href="/checkout"
                className="block text-center bg-[#FF4500] text-white font-extrabold py-3.5 rounded-xl hover:bg-orange-600 transition-colors text-base"
              >
                주문하기 ({selectedItems.length}개)
                <ChevronRight className="inline w-4 h-4 ml-1" />
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-gray-200 text-[#999] font-semibold cursor-not-allowed"
              >
                상품을 선택해주세요
              </button>
            )}

            <button
              onClick={clearCart}
              className="mt-2 w-full py-2 text-xs text-[#999] hover:text-red-400 transition-colors"
            >
              장바구니 비우기
            </button>
          </div>
        </div>
      </div>

      {/* 모바일: 하단 고정 주문 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden z-40 px-4 pb-3">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#666]">총 결제 금액</span>
            <span className="font-extrabold text-primary text-lg">{fmt(totalPrice)}원</span>
          </div>
          {selectedItems.length > 0 ? (
            <Link
              href="/checkout"
              className="block text-center bg-[#FF4500] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors"
            >
              주문하기 ({selectedItems.length}개)
            </Link>
          ) : (
            <button disabled className="w-full py-3.5 rounded-xl bg-gray-200 text-[#999] font-semibold">
              상품을 선택해주세요
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
