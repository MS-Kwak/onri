import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <h1 className="text-lg font-bold text-foreground">온리 (Onri)</h1>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex-1 px-6 py-8 text-sm leading-relaxed text-foreground/80">
        {/* 서비스 소개 */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            온전한 나로 쉬어가는 곳
          </h2>
          <p className="mb-3">
            온리(Onri)는 결이 맞는 사람끼리 안전하게 연결되는 성소수자 친화
            매칭 서비스입니다.
          </p>
          <p className="mb-3">
            진정한 나를 숨기지 않아도 되는 공간, 온리에서 나와 결이 맞는
            사람을 만나보세요.
          </p>
          <ul className="mt-4 space-y-2 text-foreground/60">
            <li>• 안전한 커뮤니티 — 만 19세 이상 휴대폰 본인인증 필수</li>
            <li>• 아웃팅 방지 — 민감정보 철저한 보호</li>
            <li>• 시그널 매칭 — 서로 관심을 표현하면 대화 시작</li>
            <li>• 셀카 인증 — 프로필 신뢰도 강화</li>
          </ul>
        </section>

        {/* 서비스 이용 안내 */}
        <section className="mb-10">
          <h3 className="mb-3 text-base font-semibold text-foreground">
            서비스 이용 안내
          </h3>
          <ul className="space-y-2 text-foreground/60">
            <li>• 이용 대상: 만 19세 이상</li>
            <li>• 이용 방법: 회원가입 → 본인인증 → 프로필 설정 → 매칭</li>
            <li>• 기본 이용: 무료 (출석체크로 하트 획득)</li>
            <li>
              • 유료 서비스: 하트 충전 (시그널 전송 시 하트 사용)
            </li>
          </ul>
        </section>

        {/* 유료 서비스 안내 */}
        <section className="mb-10">
          <h3 className="mb-3 text-base font-semibold text-foreground">
            유료 서비스 (하트 충전)
          </h3>
          <div className="rounded-xl bg-surface p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-foreground/50">
                  <th className="pb-2">상품</th>
                  <th className="pb-2 text-right">가격</th>
                </tr>
              </thead>
              <tbody className="text-foreground/70">
                <tr className="border-b border-line/50">
                  <td className="py-2">하트 10개</td>
                  <td className="py-2 text-right">₩2,500</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-2">하트 30개</td>
                  <td className="py-2 text-right">₩6,900</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-2">하트 60개</td>
                  <td className="py-2 text-right">₩12,000</td>
                </tr>
                <tr>
                  <td className="py-2">하트 100개</td>
                  <td className="py-2 text-right">₩18,000</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-foreground/40">
              시그널 1회 전송 시 하트 3개가 소모됩니다.
            </p>
          </div>
        </section>

        {/* 사업자 정보 */}
        <section className="rounded-xl bg-surface p-5">
          <h3 className="mb-4 text-base font-semibold text-foreground">
            사업자 정보
          </h3>
          <dl className="space-y-2 text-xs text-foreground/50">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">상호</dt>
              <dd>엠에스케이(msk)</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">대표</dt>
              <dd>곽민서</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">사업자등록번호</dt>
              <dd>759-20-01657</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">업태 / 종목</dt>
              <dd>정보통신업 / 컴퓨터 프로그래밍 서비스업</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">이메일</dt>
              <dd>kkminseo@gmail.com</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">주소</dt>
              <dd>경기도 부천시 역곡로482번길 44, 402호(고강동)</dd>
            </div>
          </dl>
          <p className="mt-4 text-[10px] text-foreground/30">
            ※ 위 정보는 사업자등록증 기준이며, 변경 시 업데이트됩니다.
          </p>
        </section>

        {/* 링크 */}
        <nav className="mt-8 flex flex-col gap-2 text-xs">
          <a href="/terms" className="text-gold hover:underline">
            이용약관 →
          </a>
          <a href="/privacy" className="text-gold hover:underline">
            개인정보처리방침 →
          </a>
          <a href="/refund" className="text-gold hover:underline">
            환불 정책 →
          </a>
        </nav>
      </div>
    </div>
  );
}
