import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TermsPublicPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <Link href="/about" className="text-lg font-bold text-foreground">
            이용약관
          </Link>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <article className="flex-1 px-6 py-6">
        <p className="mb-4 text-[10px] text-foreground/40">
          시행일: 2026년 7월 1일 | 최종 수정: 2026년 7월 1일
        </p>

        <S>제1조 (목적)</S>
        <P>
          이 약관은 온리(Onri, 이하 &quot;회사&quot;)가 제공하는 모바일 및 웹
          기반 소셜 매칭 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여
          회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </P>

        <S>제2조 (정의)</S>
        <P>
          ① &quot;서비스&quot;란 회사가 제공하는 퀴어 친화 소셜 매칭
          플랫폼으로, 이용자 간의 프로필 탐색, 시그널 전송, 채팅 등의 기능을
          포함합니다.
          <br />② &quot;이용자&quot;란 이 약관에 동의하고 서비스에 가입한 만
          19세 이상의 개인을 말합니다.
          <br />③ &quot;시그널&quot;이란 이용자가 다른 이용자에게 관심을
          표현하는 행위를 말합니다.
          <br />④ &quot;하트&quot;란 서비스 내에서 시그널 전송 등에 사용되는
          유료 및 무료 재화를 말합니다.
        </P>

        <S>제3조 (약관의 효력 및 변경)</S>
        <P>
          ① 이 약관은 서비스 내에 게시하거나 기타 방법으로 이용자에게
          공지함으로써 효력이 발생합니다.
          <br />② 회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수
          있으며, 변경 시 적용일 7일 전부터 서비스 내 공지합니다.
        </P>

        <S>제4조 (회원가입 및 이용자격)</S>
        <P>
          ① 서비스 이용을 위해서는 본인인증을 완료해야 하며, 만 19세 미만의
          이용은 불가합니다.
          <br />② 회원가입 시 제공하는 정보는 정확해야 하며, 타인의 정보를
          도용하여 가입한 경우 서비스 이용이 제한될 수 있습니다.
        </P>

        <S>제5조 (서비스 내용)</S>
        <P>회사가 제공하는 서비스는 다음과 같습니다:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 프로필 등록 및 탐색</li>
          <li>• 시그널(관심 표현) 전송 및 수신</li>
          <li>• 시그널 수락 시 1:1 채팅</li>
          <li>• 셀카 인증을 통한 프로필 신뢰도 향상</li>
          <li>• 출석체크 및 무료 하트 획득</li>
        </ul>

        <S>제6조 (하트 및 유료 서비스)</S>
        <P>
          ① 하트는 시그널 전송 등 서비스 이용 시 소비되는 재화입니다.
          <br />② 하트는 유료 구매 또는 출석체크·이벤트 등 무료 획득이
          가능합니다.
          <br />③ 유료 구매한 하트의 환불은 미사용 하트에 한하여 구매일로부터
          7일 이내 요청 시 가능하며, 무료로 획득한 하트는 환불 대상이
          아닙니다.
          <br />④ 시그널 전송 시 하트 3개가 소비되며, 한번 소비된 하트는
          취소할 수 없습니다.
          <br />⑤ 서비스 탈퇴 시 미사용 하트는 소멸되며, 환불되지 않습니다.
        </P>

        <S>제7조 (이용자의 의무)</S>
        <P>이용자는 다음 행위를 해서는 안 됩니다:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 타인의 성정체성·성적 지향을 본인의 동의 없이 제3자에게 공개하는 행위(아웃팅)</li>
          <li>• 혐오 표현, 차별적 발언, 욕설, 성희롱 등 타인의 인격권을 침해하는 행위</li>
          <li>• 타인의 사진을 도용하거나 허위 프로필을 등록하는 행위</li>
          <li>• 영리 목적의 광고·홍보·스팸 행위</li>
        </ul>

        <S>제8조 (아웃팅 금지 및 안전 정책)</S>
        <P>
          ① 회사는 이용자의 성정체성·성적 지향 정보를 최우선으로 보호합니다.
          <br />② 서비스 내에서 취득한 타인의 정체성 정보를 서비스 외부에
          공유하거나 유포하는 행위(아웃팅)는 엄격히 금지되며, 위반 시 즉시
          영구 이용정지 조치됩니다.
        </P>

        <S>제9조 (서비스 이용 제한)</S>
        <P>
          회사는 이용자의 의무를 위반하거나, 다른 이용자로부터 신고가 접수되어
          확인된 경우, 사전 통보 후 서비스 이용을 제한하거나 정지할 수
          있습니다.
        </P>

        <S>제10조 (회원 탈퇴)</S>
        <P>
          ① 이용자는 언제든 서비스 내에서 탈퇴를 요청할 수 있습니다.
          <br />② 탈퇴 시 이용자의 모든 데이터는 즉시 삭제되며, 복구할 수
          없습니다.
          <br />③ 미사용 하트는 탈퇴 시 소멸되며 환불되지 않습니다.
        </P>

        <S>제11조 (면책)</S>
        <P>
          ① 회사는 이용자 간의 만남·교류로 발생하는 분쟁에 대해 책임지지
          않습니다.
          <br />② 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등
          불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.
        </P>

        <S>제12조 (분쟁 해결)</S>
        <P>
          서비스 이용과 관련된 분쟁은 대한민국 법령을 적용하며, 관할 법원은
          민사소송법에 따릅니다.
        </P>

        <div className="mt-8 rounded-xl bg-surface p-4 text-[10px] text-foreground/30">
          본 약관에 대한 문의는 앱 내 고객센터를 통해 접수해주세요.
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
