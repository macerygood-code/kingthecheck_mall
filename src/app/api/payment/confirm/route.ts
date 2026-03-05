import { NextResponse } from 'next/server';

// ══════════════════════════════════════════════════════════════
// 토스페이먼츠 결제 승인 API 라우트
// ══════════════════════════════════════════════════════════════
//
// 📌 테스트 방법:
//   - 테스트 카드 번호: 4242-4242-4242-4242 (Visa)
//                       5422-5422-5422-5422 (Mastercard)
//   - 만료일: 미래 날짜 아무거나 (예: 12/26)
//   - CVC: 아무 3자리 (예: 123)
//   - 비밀번호 앞 2자리: 아무 2자리 (예: 00)
//
// 📌 테스트 > 실제 운영 전환 체크리스트:
//   1. 환경변수를 test_sk_... → 실제 sk_... 로 교체
//   2. NEXT_PUBLIC_TOSS_CLIENT_KEY도 test_ck_ → ck_ 로 교체
//   3. 토스페이먼츠 대시보드에서 도메인 등록
//   4. 결제 성공/실패 URL을 실제 도메인으로 변경
//   5. Webhook 설정 (이중 결제 방지)
// ══════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount, cartItems, userId } = await request.json();

    // 1️⃣ 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    // 2️⃣ 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: '결제 서버 설정이 올바르지 않습니다.' }, { status: 500 });
    }

    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('[TossPayments] 결제 승인 실패:', tossData);
      return NextResponse.json(
        { error: tossData.message ?? '결제 승인에 실패했습니다.', code: tossData.code },
        { status: tossResponse.status }
      );
    }

    // 3️⃣ Supabase DB 저장 (Supabase 설정된 경우에만)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey &&
        supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        const { createServerClient } = await import('@supabase/ssr');
        const supabase = createServerClient(supabaseUrl!, supabaseServiceKey!, {
          cookies: { getAll: () => [], setAll: () => {} },
        });

        // 주문 저장
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: orderId,
            user_id: userId ?? null,
            status: 'paid',
            total_price: amount,
            shipping_fee: amount >= 30000 ? 0 : 3000,
            pg_order_id: paymentKey,
            payment_method: tossData.method ?? '카드',
          })
          .select()
          .single();

        if (orderError) {
          console.error('[Supabase] 주문 저장 오류:', orderError);
        }

        // order_items 저장
        if (order && cartItems?.length > 0) {
          const items = cartItems.map((item: {
            product: { id: string; name: string; price: number; discountedPrice?: number; imageUrl: string };
            quantity: number;
          }) => ({
            order_id: orderId,
            product_id: item.product.id,
            product_name: item.product.name,
            price: item.product.discountedPrice ?? item.product.price,
            quantity: item.quantity,
            image_url: item.product.imageUrl,
          }));

          await supabase.from('order_items').insert(items);

          // 재고 차감
          for (const item of cartItems) {
            await supabase.rpc('decrement_stock', {
              product_id: item.product.id,
              amount: item.quantity,
            });
          }
        }

        // 포인트 적립 (결제금액의 1%)
        if (userId) {
          const pointsToAdd = Math.floor(amount * 0.01);
          await supabase.rpc('add_points', {
            user_id: userId,
            points: pointsToAdd,
          });
        }
      } catch (dbError) {
        // DB 저장 실패해도 결제 승인은 완료이므로 경고만 로깅
        console.error('[Supabase] DB 저장 오류 (결제는 정상):', dbError);
      }
    }

    // 4️⃣ 성공 응답
    return NextResponse.json({
      success: true,
      orderId: tossData.orderId,
      paymentKey: tossData.paymentKey,
      amount: tossData.totalAmount,
      orderName: tossData.orderName,
      method: tossData.method,
      approvedAt: tossData.approvedAt,
    });

  } catch (error) {
    console.error('[결제 확인] 예외 발생:', error);
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
