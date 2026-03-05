import AdminLayout from '@/components/admin/AdminLayout';

// /admin/* 경로의 공통 레이아웃
// 어드민 헤더(일반 쇼핑몰 헤더)를 숨기고 어드민 전용 레이아웃 사용
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
