'use client';

import { useState } from 'react';
import { Plus, X, MessageSquare, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

type NoticeType = '공지사항' | 'FAQ';

interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

const DUMMY_NOTICES: Notice[] = [
  { id: '1', type: '공지사항', title: '킹더체크몰 서비스 오픈 안내', content: '안녕하세요, 킹더체크몰 고객센터입니다. 2025년 1월부터 킹더체크몰 자사몰을 정식 오픈하게 되었습니다.', isPinned: true, createdAt: '2025-01-01' },
  { id: '2', type: 'FAQ', title: '배송 기간이 얼마나 걸리나요?', content: '일반적으로 결제 완료 후 2-3 영업일 이내 배송됩니다. 제주도 및 도서산간 지역은 2-3일 추가될 수 있습니다.', isPinned: false, createdAt: '2025-01-02' },
  { id: '3', type: 'FAQ', title: '교환/환불은 어떻게 하나요?', content: '상품 수령 후 7일 이내 교환/환불 신청 가능합니다. 고객센터(1588-0000)로 연락 주시거나 마이페이지에서 신청해주세요.', isPinned: false, createdAt: '2025-01-02' },
];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState(DUMMY_NOTICES);
  const [typeFilter, setTypeFilter] = useState<'전체' | NoticeType>('전체');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: '공지사항' as NoticeType, title: '', content: '', isPinned: false });

  const filtered = notices.filter((n) => typeFilter === '전체' || n.type === typeFilter);

  const handleSave = () => {
    if (!form.title || !form.content) { alert('제목과 내용을 입력하세요.'); return; }
    setNotices((prev) => [...prev, { ...form, id: String(Date.now()), createdAt: new Date().toISOString().slice(0, 10) }]);
    setShowForm(false);
    setForm({ type: '공지사항', title: '', content: '', isPinned: false });
  };

  const handleDelete = (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-4xl space-y-4">
      {/* 도구바 */}
      <div className="flex gap-3 items-center">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['전체', '공지사항', 'FAQ'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${typeFilter === t ? 'bg-primary text-white' : 'text-[#666] hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />글쓰기
        </button>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        {filtered.map((n) => (
          <div key={n.id}>
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#F8FAFF] transition-colors"
              onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
            >
              {n.type === '공지사항'
                ? <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                : <HelpCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.type === '공지사항' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{n.type}</span>
                  {n.isPinned && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">⭐ 고정</span>}
                  <span className="text-sm font-semibold text-[#111] truncate">{n.title}</span>
                </div>
                <p className="text-[11px] text-[#bbb] mt-0.5">{n.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                  className="text-[10px] px-2 py-1 text-[#999] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">삭제</button>
                {expandedId === n.id ? <ChevronUp className="w-4 h-4 text-[#bbb]" /> : <ChevronDown className="w-4 h-4 text-[#bbb]" />}
              </div>
            </div>
            {expandedId === n.id && (
              <div className="px-5 pb-4 bg-[#F8FAFF] text-sm text-[#555] leading-relaxed border-t border-gray-100 py-4">
                {n.content}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#bbb] text-sm">등록된 글이 없습니다</div>
        )}
      </div>

      {/* 글쓰기 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-[#111]">글쓰기</h3>
              <button onClick={() => setShowForm(false)} className="text-[#bbb] hover:text-[#333]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1 block">유형</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NoticeType }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary bg-white">
                  <option>공지사항</option>
                  <option>FAQ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1 block">제목</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1 block">내용</label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="내용을 입력하세요" rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-[#555]">상단 고정</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-[#666]">취소</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
