import Link from 'next/link';
import { CreditCard, Smartphone, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#AAAAAA] text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* ─── 링크 섹션 ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-[#333]">
          {/* 고객센터 */}
          <div>
            <h4 className="text-white font-semibold mb-3">고객센터</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/help/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
              <li><Link href="/help/contact" className="hover:text-white transition-colors">1:1 문의</Link></li>
              <li className="text-white font-bold text-base mt-2">080-000-0000</li>
              <li className="text-xs">평일 09:00 ~ 18:00 (점심 12~13시)</li>
            </ul>
          </div>

          {/* 쇼핑 가이드 */}
          <div>
            <h4 className="text-white font-semibold mb-3">쇼핑 가이드</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/help/shipping" className="hover:text-white transition-colors">배송 안내</Link></li>
              <li><Link href="/help/return" className="hover:text-white transition-colors">반품 / 교환 안내</Link></li>
              <li><Link href="/help/refund" className="hover:text-white transition-colors">환불 안내</Link></li>
            </ul>
          </div>

          {/* 회원 서비스 */}
          <div>
            <h4 className="text-white font-semibold mb-3">회원 서비스</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/signup" className="hover:text-white transition-colors">회원가입</Link></li>
              <li><Link href="/mypage" className="hover:text-white transition-colors">마이페이지</Link></li>
              <li><Link href="/mypage?tab=orders" className="hover:text-white transition-colors">주문 조회</Link></li>
            </ul>
          </div>

          {/* 이용약관 */}
          <div>
            <h4 className="text-white font-semibold mb-3">이용 안내</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              <li>
                <Link href="/privacy" className="text-[#CCC] font-semibold hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 결제 수단 ─── */}
        <div className="flex items-center gap-4 py-6 border-b border-[#333]">
          <div className="flex items-center gap-1.5 text-xs">
            <CreditCard className="w-4 h-4" />
            <span>신용카드</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Smartphone className="w-4 h-4" />
            <span>카카오페이</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-4 h-4" />
            <span>토스페이먼츠</span>
          </div>
        </div>

        {/* ─── 회사 정보 ─── */}
        <div className="pt-6 text-xs text-[#666] leading-relaxed">
          <p className="text-[#AAA] font-semibold text-sm mb-2">KingTheCheck Inc.</p>
          <p>대표자: 홍길동 &nbsp;|&nbsp; 사업자등록번호: 000-00-00000</p>
          <p>통신판매업 신고번호: 제2025-서울강남-0000호</p>
          <p>주소: 서울특별시 강남구 테헤란로 00길 00</p>
          <p>이메일: help@kingthecheck.co.kr</p>
          <p className="mt-3">© 2025 KingTheCheck Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
