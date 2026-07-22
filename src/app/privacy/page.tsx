import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function PrivacyPublicPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <Link
            href="/about"
            className="text-lg font-bold text-foreground"
          >
            개인정보처리방침
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
          온리(Onri, 이하 &quot;회사&quot;)는 이용자의 개인정보를
          중요시하며, 개인정보보호법 등 관련 법령을 준수합니다. 본
          방침을 통해 이용자의 개인정보가 어떻게
          수집·이용·보관·파기되는지 안내합니다.
        </P>

        <S>제1조 (수집하는 개인정보)</S>
        <P>① 필수 수집 항목:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>
            • 본인인증 정보: 이름, 생년월일, 성별, 휴대전화 번호,
            암호화된 이용자 확인값(CI)
          </li>
          <li>
            • 계정 정보: 소셜 로그인 식별자(카카오/애플), 이메일
          </li>
          <li>• 프로필 정보: 닉네임, 지역, 관계 목적</li>
        </ul>
        <P>② 선택 수집 항목:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>
            • 프로필 사진, 자기소개, 관심사, 활동 시간, 키, 몸무게
          </li>
          <li>• 셀카 인증 사진 (인증 검토 완료 후 즉시 삭제)</li>
        </ul>
        <P>③ 민감정보 (별도 동의):</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 성정체성·성적 지향 정보</li>
        </ul>
        <P>④ 자동 수집 항목:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>
            • 기기 정보(OS, 버전, 기기 식별자), 접속 로그, 서비스 이용
            기록
          </li>
        </ul>

        <S>제2조 (민감정보 처리)</S>
        <P>
          ① 성정체성·성적 지향은 개인정보보호법 제23조에 해당하는
          민감정보로서, 회원가입 시 별도의 명시적 동의를 받아
          수집합니다.
          <br />② 민감정보는 매칭 서비스 제공 목적으로만 사용되며,
          암호화하여 저장합니다.
          <br />③ 이용자의 민감정보는 어떠한 경우에도 제3자에게
          제공되지 않으며, 법원의 영장 없이는 수사기관에도 제공하지
          않습니다.
          <br />④ 이용자는 언제든 민감정보 수집 동의를 철회할 수
          있으며, 철회 시 서비스 이용이 제한될 수 있습니다.
        </P>

        <S>제3조 (개인정보의 이용 목적)</S>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 회원 식별 및 본인 인증</li>
          <li>• 매칭 서비스 제공 (프로필 탐색, 시그널, 채팅)</li>
          <li>• 셀카 인증을 통한 프로필 진위 확인</li>
          <li>• 부정 이용 방지 및 서비스 안전 관리</li>
          <li>• 고객 문의 응대 및 분쟁 해결</li>
          <li>• 서비스 개선을 위한 통계 분석 (비식별 처리)</li>
        </ul>

        <S>제4조 (개인정보 보유 및 파기)</S>
        <P>
          ① 회원 탈퇴 시 모든 개인정보는 즉시 파기합니다. 단, 관련
          법령에 따라 보존이 필요한 정보는 해당 기간 동안 안전하게
          보관 후 파기합니다:
        </P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 계약·청약철회 기록: 5년 (전자상거래법)</li>
          <li>• 대금 결제·재화 공급 기록: 5년 (전자상거래법)</li>
          <li>• 소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</li>
          <li>• 접속 로그: 3개월 (통신비밀보호법)</li>
        </ul>
        <P>
          ② 셀카 인증 사진은 관리자 검토 완료 즉시 삭제하며, 최대
          72시간 이내에 파기합니다.
        </P>

        <S>제5조 (개인정보의 제3자 제공)</S>
        <P>
          ① 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지
          않습니다.
          <br />② 다만, 이용자가 사전 동의한 경우와 법원의 영장 등
          적법한 절차에 따른 수사기관 요청의 경우는 예외로 합니다.
          <br />③ 특히 성정체성·성적 지향 등 민감정보는 수사기관 요청
          시에도 법원의 영장이 없는 한 제공하지 않습니다.
        </P>

        <S>제6조 (개인정보의 안전성 확보 조치)</S>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 민감정보(성정체성 등)의 AES-256 암호화 저장</li>
          <li>• 개인정보 전송 시 TLS 1.3 암호화</li>
          <li>• 관리자 접근 권한 최소화 및 접근 기록 관리</li>
          <li>• 정기적 보안 점검 및 취약점 진단</li>
          <li>• Row Level Security(RLS)를 통한 데이터 격리</li>
        </ul>

        <S>제7조 (이용자의 권리)</S>
        <P>이용자는 언제든 다음의 권리를 행사할 수 있습니다:</P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 개인정보 열람 요청</li>
          <li>• 개인정보 수정·삭제 요청</li>
          <li>• 개인정보 처리 정지 요청</li>
          <li>• 민감정보 수집 동의 철회</li>
          <li>• 회원 탈퇴를 통한 전체 데이터 삭제</li>
        </ul>
        <P>
          위 요청은 서비스 내 설정 또는 고객센터를 통해 처리할 수
          있으며, 요청 접수 후 10일 이내에 처리합니다.
        </P>

        <S>제8조 (아웃팅 방지를 위한 기술적 조치)</S>
        <P>
          ① 성정체성 정보는 DB 내에서 암호화 저장되며, 복호화 키는
          별도로 관리합니다.
          <br />② 스크린 캡처 방지 기능을 제공합니다(모바일 앱).
          <br />③ 이용자의 프로필은 서비스 외부 검색엔진에 노출되지
          않습니다.
          <br />④ 비공개로 설정된 항목은 매칭 알고리즘에만 활용되고,
          타 이용자에게는 표시되지 않습니다.
        </P>

        <S>제9조 (개인정보 보호책임자)</S>
        <P>
          개인정보 보호책임자: 곽민서
          <br />
          연락처: kkminseo@gmail.com
          <br />
          소속: 온리 운영팀
        </P>
        <P>
          개인정보 침해 관련 상담은 아래 기관에 문의할 수 있습니다:
        </P>
        <ul className="mb-3 space-y-1 pl-4 text-xs text-foreground/50">
          <li>• 개인정보침해 신고센터 (privacy.kisa.or.kr / 118)</li>
          <li>
            • 개인정보 분쟁조정위원회 (kopico.go.kr / 1833-6972)
          </li>
          <li>• 대검찰청 사이버수사과 (spo.go.kr / 1301)</li>
          <li>• 경찰청 사이버안전국 (ecrm.police.go.kr / 182)</li>
        </ul>

        <div className="mt-8 rounded-xl bg-surface p-4 text-[10px] text-foreground/30">
          본 방침에 대한 문의는 앱 내 고객센터를 통해 접수해주세요.
          <br />
          시행일: 2026년 7월 1일
        </div>
      </article>
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-sm font-bold text-foreground first:mt-0">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs leading-relaxed text-foreground/50">
      {children}
    </p>
  );
}
