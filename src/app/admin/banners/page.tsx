'use client';

import { useState, useRef } from 'react';
import { Plus, X, Upload, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';

const POSITIONS = ['히어로', '서브', '이벤트'];

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  position: string;
  startDate: string;
  endDate: string;
  order: number;
  isActive: boolean;
}

const DUMMY_BANNERS: Banner[] = [
  { id: '1', title: '오늘의 특가 배너', imageUrl: '', link: '/products?sort=discount', position: '히어로', startDate: '2025-01-01', endDate: '2025-01-31', order: 1, isActive: true },
  { id: '2', title: '신뢰할 수 있는 쇼핑 배너', imageUrl: '', link: '/products', position: '히어로', startDate: '2025-01-01', endDate: '2025-01-31', order: 2, isActive: true },
  { id: '3', title: '무료배송 이벤트 배너', imageUrl: '', link: '/products?freeShipping=true', position: '히어로', startDate: '2025-01-01', endDate: '2025-03-31', order: 3, isActive: true },
  { id: '4', title: '서브 프로모션 1', imageUrl: '', link: '/products?category=전자기기', position: '서브', startDate: '2025-01-01', endDate: '2025-02-28', order: 1, isActive: true },
  { id: '5', title: '겨울 이벤트 배너', imageUrl: '', link: '/event/winter', position: '이벤트', startDate: '2024-12-01', endDate: '2025-02-28', order: 1, isActive: false },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState(DUMMY_BANNERS);
  const [posFilter, setPosFilter] = useState('전체');
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Omit<Banner, 'id'>>({
    title: '', imageUrl: '', link: '', position: '히어로',
    startDate: '', endDate: '', order: 1, isActive: true,
  });

  const toggleActive = (id: string) => {
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const handleDelete = (id: string) => {
    if (!confirm('배너를 삭제하시겠습니까?')) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const openEdit = (b: Banner) => {
    setEditBanner(b);
    setForm({ title: b.title, imageUrl: b.imageUrl, link: b.link, position: b.position, startDate: b.startDate, endDate: b.endDate, order: b.order, isActive: b.isActive });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title) { alert('배너 제목을 입력하세요.'); return; }
    if (editBanner) {
      setBanners((prev) => prev.map((b) => b.id === editBanner.id ? { ...b, ...form } : b));
    } else {
      setBanners((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    }
    setShowForm(false);
    setEditBanner(null);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const filtered = banners.filter((b) => posFilter === '전체' || b.position === posFilter);

  return (
    <div className="max-w-5xl space-y-4">

      {/* 도구바 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {['전체', ...POSITIONS].map((p) => (
            <button key={p} onClick={() => setPosFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${posFilter === p ? 'bg-primary text-white' : 'text-[#666] hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditBanner(null); setForm({ title: '', imageUrl: '', link: '', position: '히어로', startDate: '', endDate: '', order: 1, isActive: true }); setShowForm(true); }}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />배너 추가
        </button>
      </div>

      {/* 배너 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['', '미리보기', '배너명', '위치', '링크', '노출 기간', '순서', '활성', '관리'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#666] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-4 py-3 text-[#ccc]"><GripVertical className="w-4 h-4" /></td>
                  <td className="px-4 py-3">
                    <div className="w-16 h-10 bg-gradient-to-br from-primary/20 to-blue-300/30 rounded-lg flex items-center justify-center text-lg">
                      🖼
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#111]">{b.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded-full">{b.position}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#999] max-w-[120px] truncate">{b.link}</td>
                  <td className="px-4 py-3 text-xs text-[#666] whitespace-nowrap">
                    {b.startDate} ~ {b.endDate}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-[#555]">{b.order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(b.id)}>
                      {b.isActive
                        ? <ToggleRight className="w-8 h-8 text-primary" />
                        : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(b)} className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-lg transition-colors">수정</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-red-500 hover:text-white rounded-lg transition-colors">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 배너 수정/추가 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-[#111]">{editBanner ? '배너 수정' : '배너 추가'}</h3>
              <button onClick={() => setShowForm(false)} className="text-[#bbb] hover:text-[#333]"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1 block">배너 제목 *</label>
                <input value={form.title} onChange={set('title')} placeholder="배너 제목"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1 block">배너 이미지</label>
                <button onClick={() => fileRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[#bbb] hover:border-primary hover:text-primary transition-colors">
                  <Upload className="w-5 h-5" /><span className="text-sm">이미지 업로드</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#555] mb-1 block">위치</label>
                  <select value={form.position} onChange={set('position')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary bg-white">
                    {POSITIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#555] mb-1 block">순서</label>
                  <input type="number" value={form.order} onChange={set('order')} min={1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#555] mb-1 block">링크 URL</label>
                <input value={form.link} onChange={set('link')} placeholder="/products"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#555] mb-1 block">시작일</label>
                  <input type="date" value={form.startDate} onChange={set('startDate')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#555] mb-1 block">종료일</label>
                  <input type="date" value={form.endDate} onChange={set('endDate')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-[#666]">취소</button>
              <button onClick={handleSave}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
