-- ============================================================
-- 안티그래비티 자사몰 Supabase DB 전체 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체 복사/붙여넣기 후 실행
-- ============================================================

-- ▶ 확장 기능 (uuid 생성)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  icon_name   text,
  parent_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text NOT NULL,
  description    text,
  price          integer NOT NULL,
  original_price integer,
  discount_rate  integer DEFAULT 0,
  category_id    uuid REFERENCES categories(id) ON DELETE SET NULL,
  images         text[] DEFAULT '{}',
  thumbnail_url  text,
  stock          integer DEFAULT 0,
  is_active      boolean DEFAULT true,
  is_featured    boolean DEFAULT false,
  is_new         boolean DEFAULT false,
  free_shipping  boolean DEFAULT false,
  rating_avg     numeric(3,2) DEFAULT 0,
  review_count   integer DEFAULT 0,
  sales_count    integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ============================================================
-- 3. PRODUCT_OPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_options (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_group text NOT NULL,  -- 예: 색상, 사이즈, 용량
  option_value text NOT NULL,
  extra_price  integer DEFAULT 0,
  stock        integer DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- 4. USERS (Supabase Auth 확장)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  phone      text,
  role       text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points     integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  phone      text NOT NULL,
  zipcode    text NOT NULL,
  address1   text NOT NULL,
  address2   text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid REFERENCES users(id) ON DELETE SET NULL,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','paid','preparing','shipping','delivered','cancelled')),
  total_price      integer NOT NULL,
  shipping_fee     integer DEFAULT 0,
  discount_amount  integer DEFAULT 0,
  shipping_name    text,
  shipping_phone   text,
  shipping_address text,
  payment_method   text,
  payment_key      text,
  paid_at          timestamptz,
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- 7. ORDER_ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     uuid REFERENCES products(id) ON DELETE SET NULL,
  option_id      uuid REFERENCES product_options(id) ON DELETE SET NULL,
  quantity       integer NOT NULL DEFAULT 1,
  price          integer NOT NULL,
  review_written boolean DEFAULT false
);

-- ============================================================
-- 8. CART (로그인 유저용 DB 저장)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_id  uuid REFERENCES product_options(id) ON DELETE SET NULL,
  quantity   integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id, option_id)
);

-- ============================================================
-- 9. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content       text NOT NULL,
  images        text[] DEFAULT '{}',
  helpful_count integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- 10. QNA
-- ============================================================
CREATE TABLE IF NOT EXISTS qna (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question    text NOT NULL,
  answer      text,
  is_answered boolean DEFAULT false,
  is_secret   boolean DEFAULT false,
  answered_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 11. WISHLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ============================================================
-- 12. BANNERS
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      text NOT NULL,
  image_url  text,
  link_url   text,
  position   text NOT NULL DEFAULT 'hero'
               CHECK (position IN ('hero', 'sub', 'event')),
  sort_order integer DEFAULT 0,
  is_active  boolean DEFAULT true,
  start_at   timestamptz,
  end_at     timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- FUNCTION: updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: 리뷰 작성 시 rating_avg, review_count 자동 업데이트
-- ============================================================
CREATE OR REPLACE FUNCTION sync_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET rating_avg   = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = NEW.product_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_sync_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sync_product_rating();

-- ============================================================
-- RLS 정책 활성화
-- ============================================================

-- products: 누구나 읽기 가능, 관리자만 수정
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_all" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_all"  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- categories: 모두 읽기
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

-- banners: 모두 읽기
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_select_all" ON banners FOR SELECT USING (true);

-- users: 본인만 읽기/수정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_self" ON users FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- addresses: 본인만 접근
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_self" ON addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- orders: 본인 주문만
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_self_select" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_self_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_self_update" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- order_items: order 통해 본인만
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_self" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- cart: 본인만
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_self" ON cart FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- reviews: 모두 읽기, 본인만 작성/수정
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_self_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_self_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- qna: 비밀글 아닌 것은 모두 읽기, 본인만 작성
ALTER TABLE qna ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qna_select_public"  ON qna FOR SELECT USING (is_secret = false OR auth.uid() = user_id);
CREATE POLICY "qna_self_insert"    ON qna FOR INSERT WITH CHECK (auth.uid() = user_id);

-- wishlists: 본인만
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlists_self" ON wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- product_options: 모두 읽기
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_options_select_all" ON product_options FOR SELECT USING (true);

-- ============================================================
-- 초기 더미 데이터 INSERT
-- ============================================================

-- 카테고리 9개
INSERT INTO categories (name, slug, icon_name, sort_order) VALUES
  ('전자기기',   'electronics',  'Smartphone',    1),
  ('패션/의류',  'fashion',       'Shirt',         2),
  ('생활/주방',  'living',        'Home',          3),
  ('건강/뷰티',  'beauty',        'Heart',         4),
  ('스포츠/레저','sports',        'Bike',          5),
  ('식품',       'food',          'Apple',         6),
  ('유아/완구',  'baby',          'Baby',          7),
  ('반려동물',   'pet',           'PawPrint',      8),
  ('기타',       'others',        'MoreHorizontal',9)
ON CONFLICT (slug) DO NOTHING;

-- 배너 3개
INSERT INTO banners (title, image_url, link_url, position, sort_order) VALUES
  ('오늘의 특가',      'https://via.placeholder.com/1200x400/E02020/FFFFFF?text=Sale', '/products', 'hero', 1),
  ('정품 인증 보장',   'https://via.placeholder.com/1200x400/1A4FC4/FFFFFF?text=Trust', '/products', 'hero', 2),
  ('무료배송 이벤트',  'https://via.placeholder.com/1200x400/F0F7FF/1A4FC4?text=Free+Shipping', '/products', 'hero', 3)
ON CONFLICT DO NOTHING;

-- 상품 20개 (카테고리별 2~3개)
DO $$
DECLARE
  cat_electronics uuid;
  cat_fashion     uuid;
  cat_living      uuid;
  cat_beauty      uuid;
  cat_sports      uuid;
  cat_food        uuid;
  cat_baby        uuid;
  cat_pet         uuid;
  cat_others      uuid;
BEGIN
  SELECT id INTO cat_electronics FROM categories WHERE slug='electronics';
  SELECT id INTO cat_fashion     FROM categories WHERE slug='fashion';
  SELECT id INTO cat_living      FROM categories WHERE slug='living';
  SELECT id INTO cat_beauty      FROM categories WHERE slug='beauty';
  SELECT id INTO cat_sports      FROM categories WHERE slug='sports';
  SELECT id INTO cat_food        FROM categories WHERE slug='food';
  SELECT id INTO cat_baby        FROM categories WHERE slug='baby';
  SELECT id INTO cat_pet         FROM categories WHERE slug='pet';
  SELECT id INTO cat_others      FROM categories WHERE slug='others';

  INSERT INTO products (name, description, price, original_price, discount_rate, category_id, stock, is_featured, is_new, free_shipping, rating_avg, review_count, sales_count, thumbnail_url) VALUES
  ('무선 블루투스 이어폰 AGX Pro','노이즈캔슬링 탑재, 최대 30시간 재생시간의 프리미엄 무선 이어폰',89000,59000,34,cat_electronics,150,true,false,true,4.7,342,1280,'https://via.placeholder.com/400x400/E0E0FF?text=이어폰'),
  ('스마트 보조배터리 20000mAh','PD45W 급속충전, 슬림 디자인 대용량 보조배터리',45000,31900,29,cat_electronics,200,false,true,false,4.5,215,890,'https://via.placeholder.com/400x400/E0FFE0?text=보조배터리'),
  ('초경량 게이밍 마우스 RAX-7','16000DPI 광학센서, RGB 라이팅, 80g 초경량',72000,54900,24,cat_electronics,80,true,false,true,4.8,557,2100,'https://via.placeholder.com/400x400/FFE0E0?text=마우스'),
  ('남성 린넨 반팔 셔츠','통기성 좋은 100% 린넨 소재, 슬림핏',35000,24900,29,cat_fashion,300,false,true,false,4.3,128,560,'https://via.placeholder.com/400x400?text=린넨셔츠'),
  ('여성 와이드 데님 팬츠','편안한 핏감의 스트레치 데님',58000,38900,34,cat_fashion,180,true,false,true,4.6,203,840,'https://via.placeholder.com/400x400?text=데님팬츠'),
  ('스테인리스 진공 텀블러 500ml','이중 진공 단열, 12시간 보온보냉',28000,17900,36,cat_living,400,true,false,false,4.9,891,3200,'https://via.placeholder.com/400x400?text=텀블러'),
  ('에어프라이어 5.5L 대용량','1700W 고출력, 스마트 터치패널',89000,67900,24,cat_living,60,false,true,true,4.7,432,720,'https://via.placeholder.com/400x400?text=에어프라이어'),
  ('비타민C 세럼 30ml','비타민C 20% 고함량, 미백 및 주름 개선',58000,41900,29,cat_beauty,250,false,true,false,4.6,316,980,'https://via.placeholder.com/400x400?text=세럼'),
  ('콜라겐 젤리 스틱 30포','저분자 콜라겐, 히알루론산 함유',32000,24900,22,cat_beauty,350,true,false,true,4.4,189,620,'https://via.placeholder.com/400x400?text=콜라겐젤리'),
  ('요가매트 TPE 6mm','친환경 TPE 소재, 미끄럼 방지',38000,28900,24,cat_sports,170,false,true,false,4.5,267,890,'https://via.placeholder.com/400x400?text=요가매트'),
  ('덤벨 세트 10kg','가정용 고무코팅 덤벨 2개 세트',55000,38900,29,cat_sports,90,false,false,true,4.3,143,430,'https://via.placeholder.com/400x400?text=덤벨'),
  ('제주 감귤 5kg (가정용)','당일 직송, 새벽 수확 당일 발송',32000,24900,23,cat_food,100,true,false,false,4.8,602,2400,'https://via.placeholder.com/400x400?text=감귤'),
  ('국내산 꿀 아카시아 500g','국내 양봉, 무첨가 순수 아카시아꿀',28000,23800,0,cat_food,80,false,true,true,4.7,284,560,'https://via.placeholder.com/400x400?text=꿀'),
  ('유아 블록 쌓기 120피스','BPA프리 인증, 안전한 유아 교육 완구',35000,25900,26,cat_baby,120,false,true,false,4.9,348,1100,'https://via.placeholder.com/400x400?text=블록'),
  ('아기 순면 속싸개 3매 세트','유기농 순면 100%, 새틴 마감',22000,15900,28,cat_baby,200,true,false,false,4.8,256,890,'https://via.placeholder.com/400x400?text=속싸개'),
  ('강아지 자동 급수기 2.5L','활성탄 필터, 저소음 모터',32000,23900,25,cat_pet,150,false,true,true,4.7,389,1300,'https://via.placeholder.com/400x400?text=급수기'),
  ('고양이 스크래처 하우스','단단한 골판지, 조립식',25000,18900,30,cat_pet,100,true,false,false,4.5,218,760,'https://via.placeholder.com/400x400?text=스크래처'),
  ('차량용 방향제 홀더','디퓨저 타입, 3가지 향 선택',15000,11100,26,cat_others,300,false,true,false,4.4,156,540,'https://via.placeholder.com/400x400?text=방향제'),
  ('접이식 캠핑 테이블 경량','알루미늄 합금, 1.2kg 초경량',48000,35900,27,cat_sports,70,false,false,true,4.6,198,430,'https://via.placeholder.com/400x400?text=캠핑테이블'),
  ('무선 충전 패드 15W','Qi 인증, iOS/Android 호환',22000,15900,28,cat_electronics,200,false,true,false,4.5,164,720,'https://via.placeholder.com/400x400?text=충전패드');
END $$;
