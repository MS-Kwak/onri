import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function RefundPublicPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <Link href="/about" className="text-lg font-bold text-foreground">
            환불 정책
          </Link>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <article className="flex-1 px-6 py-6">
        <p className="mb-4 text-[10px] text-foreground/40">
          시행일: 2026년 7월 1일 | 최종 수정: 2026년 7월 1일
        </p>

        <P>
          온리(Onri, 이하 &quot;서비스&quot;)에서 제공하는 유료 서비스에 대한
          환불 정책을 안내드립니다.
        </P>

        <S>1. 유료 서비스 안내</S>
        <P>
          서비스에서 제공하는 유료 상품은 &quot;하트&quot; 충전이며, 하트는
          시그널(관심 표현) 전송 시 소비되는 재화입니다.
        </P>
        <div className="mb-4 rounded-xl bg-surface p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-left text-foreground/50">
                <th className="pb-2">상품</th>
                <th className="pb-2 text-center">용량</th>
                <th className="pb-2 text-right">가격</th>
              </tr>
            </thead>
            <tbody className="text-foreground/70">
              <tr className="border-b border-line/50">
                <td className="py-2">하트 10개</td>
                <td className="py-2 text-center">10개</td>
                <td className="py-2 text-right">₩2,500</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="py-2">하트 30개</td>
                <td className="py-2 text-center">30개</td>
                <td className="py-2 text-right">₩6,900</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="py-2">하트 60개</td>
                <td className="py-2 text-center">60개</td>
                <td className="py-2 text-right">₩12,000</td>
              </tr>
              <tr>
                <td className="py-2">하트 100개</td>
                <td className="py-2 text-center">100개</td>
                <td className="py-2 text-right">₩18,000</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-foreground/30">
            시그널 1회 전송 시 하트 3개가 소모됩니다.
          </p>
        </div>

        <S>2. 환불 가능 조건</S>
        <P>유료 구매한 하트의 환불은 다음 조건을 모두 충족해야 합니다:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 구매일로부터 7일 이내 환불 요청</li>
          <li>• 구매한 하트를 전혀 사용하지 않은 경우 (미사용분에 한함)</li>
        </ul>

        <S>3. 환불 불가 사항</S>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 이미 사용(소비)한 하트</li>
          <li>• 출석체크, 이벤트 등으로 무료 획득한 하트</li>
          <li>• 구매일로부터 7일이 경과한 경우</li>
          <li>• 회원 탈퇴 시 잔여 하트 (탈퇴 시 전액 소멸)</li>
          <li>• 서비스 이용 제한(정지) 조치를 받은 경우</li>
        </ul>

        <S>4. 부분 환불</S>
        <P>
          구매한 하트 중 일부를 사용한 경우, 미사용 하트에 대해서만 부분
          환불이 가능합니다.
        </P>
        <div className="mb-4 rounded-xl bg-surface p-4 text-xs text-foreground/60">
          <p className="font-medium text-foreground/70">부분 환불 예시</p>
          <p className="mt-2">
            하트 30개 구매(₩6,900) → 시그널 2회 사용(하트 6개 소비)
            <br />→ 미사용 24개에 대해 부분 환불: ₩6,900 × (24/30) = ₩5,520
          </p>
        </div>

        <S>5. 환불 요청 방법</S>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 앱 내 마이페이지 → 고객센터 → 1:1 문의</li>
          <li>• 이메일: kkminseo@gmail.com</li>
        </ul>
        <P>
          환불 요청 시 가입 이메일, 구매 일시, 환불 사유를 함께 기재해
          주세요. 환불 요청은 접수일로부터 영업일 기준 3~5일 이내에
          처리됩니다.
        </P>

        <S>6. 환불 수단</S>
        <P>
          환불은 원칙적으로 결제 시 사용한 수단으로 진행됩니다. 결제 수단에
          따라 환불 처리 기간이 다를 수 있습니다.
        </P>

        <S>7. 청약철회(구매 취소)</S>
        <P>
          전자상거래법 제17조에 따라, 구매일로부터 7일 이내에 청약을 철회할
          수 있습니다. 다만, 이미 사용한 디지털 콘텐츠(하트)에 대해서는
          청약철회가 제한됩니다.
        </P>

        <S>8. 관련 법령</S>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 전자상거래 등에서의 소비자보호에 관한 법률</li>
          <li>• 콘텐츠산업 진흥법</li>
          <li>• 약관의 규제에 관한 법률</li>
        </ul>

        <div className="mt-8 rounded-xl bg-surface p-4 text-[10px] text-foreground/30">
          환불 관련 문의: kkminseo@gmail.com
          <br />
          시행일: 2026년 7월 1일
        </div>
      </article>
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-6 text-sm font-bold text-foreground first:mt-0">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs leading-relaxed text-foreground/50">{children}</p>;
}
