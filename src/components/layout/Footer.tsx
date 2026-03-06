import Link from 'next/link';
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-[#555] text-xs pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* 상단: 주요 링크 */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 pb-8 border-b border-gray-100 mb-8 font-medium">
          <Link href="/about" className="hover:underline">회사소개</Link>
          <Link href="/ir" className="hover:underline">Investor Relations</Link>
          <Link href="/careers" className="hover:underline">인재채용</Link>
          <Link href="/partnership" className="hover:underline">입점/제휴문의</Link>
          <Link href="/notice" className="hover:underline">공지사항</Link>
          <Link href="/cs" className="hover:underline">고객의 소리</Link>
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <Link href="/privacy" className="text-black font-bold hover:underline">개인정보 처리방침</Link>
          <Link href="/security" className="hover:underline">정보보호/개인정보보호 인증</Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* 왼쪽: 회사 상세 정보 */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-black text-gray-400 italic">COUPANG</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 text-[11px] text-[#666] leading-relaxed">
              <p>상호명 및 호스팅 서비스 제공 : 쿠팡(주)</p>
              <p>대표이사 : 강한승, 박대준</p>
              <p>서울시 송파구 송파대로 570</p>
              <p>사업자 등록번호 : 120-88-00767</p>
              <p>통신판매업신고 : 2017-서울송파-0680</p>
              <Link href="/biz-info" className="text-blue-500 hover:underline">사업자정보 확인 &gt;</Link>
            </div>
          </div>

          {/* 중앙: 고객센터 */}
          <div className="w-full md:w-64 space-y-2">
            <h4 className="font-bold text-[#333]">365 고객센터 | 전자금융거래분쟁처리담당</h4>
            <p className="text-2xl font-bold text-[#333] mb-1">1577-7011 (유료)</p>
            <p className="text-[11px] text-[#666]">서울시 송파구 송파대로 570</p>
            <p className="text-[11px] text-[#666]">email : help@coupang.com</p>
          </div>

          {/* 오른쪽: 우리카드/소셜 */}
          <div className="w-full md:w-64 space-y-6">
            <div className="space-y-2">
              <h4 className="font-bold text-[#333]">채무지급보증 안내</h4>
              <p className="text-[10px] text-[#888] leading-tight">
                당사는 고객님이 현금 결제한 금액에 대해 우리은행과 채무지급보증 계약을 체결하여 안전거래를 보장하고 있습니다.
              </p>
              <Link href="/escrow" className="text-[10px] text-blue-500 hover:underline">서비스 가입사실 확인 &gt;</Link>
            </div>
            {/* 소셜 아이콘 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <Twitter className="w-4 h-4 opacity-0 absolute" />
                <span className="font-bold text-xs">𝕏</span>
              </div>
            </div>
          </div>
        </div>

        {/* 최하단: 저작권 */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-[10px] text-[#999] leading-relaxed">
          <p>사이버몰 내 판매되는 상품 중에는 쿠팡에 등록한 개별 판매자가 판매하는 마켓플레이스(오픈마켓) 상품이 포함되어 있습니다.</p>
          <p>마켓플레이스(오픈마켓) 상품의 경우 쿠팡은 통신판매중개자이며 통신판매의 당사자가 아닙니다.</p>
          <p>쿠팡은 마켓플레이스(오픈마켓) 상품, 거래정보 및 거래에 대하여 책임을 지지 않습니다.</p>
          <p className="mt-4 font-medium uppercase">Copyright © Coupang Corp. 2010-2025 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
  );
}
