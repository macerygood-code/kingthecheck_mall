'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, ChevronDown, Check } from 'lucide-react';

const CATEGORIES = ['전자기기', '패션/의류', '생활/주방', '건강/뷰티', '스포츠/레저', '식품', '유아/완구', '반려동물', '기타'];

interface Option { group: string; value: string; extraPrice: number; stock: number; }

export default function NewProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', category: '', price: '', discountedPrice: '',
    description: '', stock: '', isActive: true,
    isBest: false, isNew: false, freeShipping: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const discountRate = form.price && form.discountedPrice
    ? Math.round((1 - Number(form.discountedPrice) / Number(form.price)) * 100)
    : 0;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setBool = (k: string) => () => setForm((f) => ({ ...f, [k]: !f[k as keyof typeof f] }));

  // 이미지 업로드 (최대 5장)
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 5) { alert('이미지는 최대 5장까지 등록 가능합니다.'); return; }
    const readers = files.map((f) => new Promise<string>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.readAsDataURL(f);
    }));
    Promise.all(readers).then((urls) => setImages((prev) => [...prev, ...urls]));
    // TODO: Supabase Storage 업로드
    // const { data } = await supabase.storage.from('product-images').upload(path, file);
  };

  // 옵션 행 추가
  const addOption = () => setOptions((prev) => [...prev, { group: '', value: '', extraPrice: 0, stock: 0 }]);
  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, idx) => idx !== i));
  const setOption = (i: number, field: keyof Option, val: string | number) =>
    setOptions((prev) => prev.map((o, idx) => idx === i ? { ...o, [field]: val } : o));

  // 저장
  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) { alert('상품명, 카테고리, 정가는 필수입니다.'); return; }
    setSaving(true);
    // TODO: Supabase 저장
    // const { data } = await supabase.from('products').insert({ ... });
    await new Promise((r) => setTimeout(r, 800)); // 저장 시뮬레이션
    setSaving(false);
    alert('상품이 등록되었습니다.');
    router.push('/admin/products');
  };

  return (
    <div className="max-w-3xl space-y-5">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[#111]">상품 등록</h2>
        <div className="flex gap-2">
          <button onClick={() => router.back()}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-[#666] hover:border-gray-300 transition-colors">
            취소
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* ─── 기본 정보 ─── */}
      <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#111] border-b border-gray-100 pb-3">기본 정보</h3>

        <div>
          <label className="text-xs font-semibold text-[#555] mb-1.5 block">상품명 *</label>
          <input value={form.name} onChange={set('name')} placeholder="상품명을 입력하세요"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#555] mb-1.5 block">카테고리 *</label>
          <div className="relative">
            <select value={form.category} onChange={set('category')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary appearance-none bg-white">
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb] pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#555] mb-1.5 block">정가 *</label>
            <input type="number" value={form.price} onChange={set('price')} placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#555] mb-1.5 block">할인가</label>
            <input type="number" value={form.discountedPrice} onChange={set('discountedPrice')} placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex items-end pb-2.5">
            {discountRate > 0 && (
              <span className="text-2xl font-extrabold text-red-500">{discountRate}%<span className="text-sm text-[#999] ml-1 font-normal">할인</span></span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#555] mb-1.5 block">재고 수량</label>
          <input type="number" value={form.stock} onChange={set('stock')} placeholder="0"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
        </div>
      </div>

      {/* ─── 이미지 업로드 ─── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#111] border-b border-gray-100 pb-3 mb-4">상품 이미지 (최대 5장)</h3>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button onClick={() => fileRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-primary hover:text-primary transition-colors text-[#bbb]">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-xs">추가</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
      </div>

      {/* ─── 상세 설명 ─── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#111] border-b border-gray-100 pb-3 mb-4">상세 설명</h3>
        <textarea value={form.description} onChange={set('description')}
          placeholder="상품 설명을 입력하세요..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none" />
      </div>

      {/* ─── 옵션 ─── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-sm font-extrabold text-[#111]">옵션</h3>
          <button onClick={addOption}
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            <Plus className="w-3.5 h-3.5" />옵션 추가
          </button>
        </div>
        {options.length === 0 && (
          <p className="text-sm text-[#bbb] text-center py-4">옵션이 없습니다. 추가 버튼을 눌러주세요.</p>
        )}
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={opt.group} onChange={(e) => setOption(i, 'group', e.target.value)}
                placeholder="옵션명 (예: 색상)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary" />
              <input value={opt.value} onChange={(e) => setOption(i, 'value', e.target.value)}
                placeholder="값 (예: 빨강)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary" />
              <input type="number" value={opt.extraPrice} onChange={(e) => setOption(i, 'extraPrice', Number(e.target.value))}
                placeholder="추가금액"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary" />
              <input type="number" value={opt.stock} onChange={(e) => setOption(i, 'stock', Number(e.target.value))}
                placeholder="재고"
                className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary" />
              <button onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 태그 & 설정 ─── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#111] border-b border-gray-100 pb-3 mb-4">태그 및 설정</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { key: 'isBest', label: '베스트' },
            { key: 'isNew', label: '신상품' },
            { key: 'freeShipping', label: '무료배송' },
            { key: 'isActive', label: '활성화' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <div onClick={setBool(key)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  form[key as keyof typeof form] ? 'bg-primary border-primary' : 'border-gray-300'
                }`}
              >
                {form[key as keyof typeof form] && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-[#555]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-[#666] hover:border-gray-300">
          취소
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
