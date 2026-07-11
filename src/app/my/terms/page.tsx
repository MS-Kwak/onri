'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

type Tab = 'terms' | 'privacy';

export default function TermsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('terms');

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center gap-2 px-5 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <FileText size={18} className="text-gold" />
          <h1 className="text-lg font-bold text-foreground">
            약관 및 정책
          </h1>
        </div>

        {/* 탭 */}
        <div className="px-5 pb-3">
          <div className="relative flex rounded-xl bg-surface-secondary p-1">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gold/15 shadow-sm transition-transform duration-300 ease-out"
              style={{
                transform:
                  activeTab === 'terms'
                    ? 'translateX(0)'
                    : 'translateX(calc(100% + 8px))',
              }}
            />
            <button
              onClick={() => setActiveTab('terms')}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'terms'
                  ? 'text-gold'
                  : 'text-foreground/35'
              }`}
            >
              <FileText size={14} />
              이용약관
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'text-gold'
                  : 'text-foreground/35'
              }`}
            >
              <Shield size={14} />
              개인정보처리방침
            </button>
          </div>
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex-1 px-5 pt-5 pb-10">
        {activeTab === 'terms' ? (
          <TermsContent />
        ) : (
          <PrivacyContent />
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-sm font-bold text-foreground first:mt-0">
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs leading-relaxed text-foreground/50">
      {children}
    </p>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative mb-1.5 pl-3 text-xs leading-relaxed text-foreground/50">
      <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-foreground/20" />
      {children}
    </li>
  );
}

function TermsContent() {
  return (
    <article>
      <p className="mb-4 text-[10px] text-foreground-soft">
        시행일: 2026년 7월 1일 | 최종 수정: 2026년 7월 1일
      </p>

      <SectionTitle>제1조 (목적)</SectionTitle>
      <Paragraph>
        이 약관은 온리(Onri, 이하 &quot;회사&quot;)가 제공하는 모바일
        및 웹 기반 소셜 매칭 서비스(이하 &quot;서비스&quot;)의 이용과
        관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을
        목적으로 합니다.
      </Paragraph>

      <SectionTitle>제2조 (정의)</SectionTitle>
      <Paragraph>
        ① &quot;서비스&quot;란 회사가 제공하는 퀴어 친화 소셜 매칭
        플랫폼으로, 이용자 간의 프로필 탐색, 시그널 전송, 채팅 등의
        기능을 포함합니다.
        <br />② &quot;이용자&quot;란 이 약관에 동의하고 서비스에
        가입한 만 19세 이상의 개인을 말합니다.
        <br />③ &quot;시그널&quot;이란 이용자가 다른 이용자에게 관심을
        표현하는 행위를 말합니다.
        <br />④ &quot;하트&quot;란 서비스 내에서 시그널 전송 등에
        사용되는 유료 및 무료 재화를 말합니다.
      </Paragraph>

      <SectionTitle>제3조 (약관의 효력 및 변경)</SectionTitle>
      <Paragraph>
        ① 이 약관은 서비스 내에 게시하거나 기타 방법으로 이용자에게
        공지함으로써 효력이 발생합니다.
        <br />② 회사는 관련 법령을 위배하지 않는 범위에서 약관을
        변경할 수 있으며, 변경 시 적용일 7일 전부터 서비스 내
        공지합니다. 다만, 이용자에게 불리한 변경의 경우 30일 전부터
        공지합니다.
      </Paragraph>

      <SectionTitle>제4조 (회원가입 및 이용자격)</SectionTitle>
      <Paragraph>
        ① 서비스 이용을 위해서는 본인인증을 완료해야 하며, 만 19세
        미만의 이용은 불가합니다.
        <br />② 회원가입 시 제공하는 정보는 정확해야 하며, 타인의
        정보를 도용하여 가입한 경우 서비스 이용이 제한될 수 있습니다.
        <br />③ 회사는 다음 각 호에 해당하는 경우 가입을 거절하거나
        이용을 제한할 수 있습니다:
      </Paragraph>
      <ul>
        <ListItem>타인의 개인정보를 도용한 경우</ListItem>
        <ListItem>만 19세 미만인 경우</ListItem>
        <ListItem>
          이전에 서비스 이용이 정지된 이력이 있는 경우
        </ListItem>
        <ListItem>기타 관련 법령에 위반되는 경우</ListItem>
      </ul>

      <SectionTitle>제5조 (서비스 내용)</SectionTitle>
      <Paragraph>
        ① 회사가 제공하는 서비스는 다음과 같습니다:
      </Paragraph>
      <ul>
        <ListItem>프로필 등록 및 탐색</ListItem>
        <ListItem>시그널(관심 표현) 전송 및 수신</ListItem>
        <ListItem>시그널 수락 시 1:1 채팅</ListItem>
        <ListItem>셀카 인증을 통한 프로필 신뢰도 향상</ListItem>
        <ListItem>출석체크 및 무료 하트 획득</ListItem>
      </ul>

      <SectionTitle>제6조 (하트 및 유료 서비스)</SectionTitle>
      <Paragraph>
        ① 하트는 시그널 전송 등 서비스 이용 시 소비되는 재화입니다.
        <br />② 하트는 유료 구매 또는 출석체크·이벤트 등 무료 획득이
        가능합니다.
        <br />③ 유료 구매한 하트의 환불은 미사용 하트에 한하여
        구매일로부터 7일 이내 요청 시 가능하며, 무료로 획득한 하트는
        환불 대상이 아닙니다.
        <br />④ 시그널 전송 시 하트 3개가 소비되며, 한번 소비된 하트는
        취소할 수 없습니다.
        <br />⑤ 서비스 탈퇴 시 미사용 하트는 소멸되며, 환불되지
        않습니다.
      </Paragraph>

      <SectionTitle>제7조 (이용자의 의무)</SectionTitle>
      <Paragraph>이용자는 다음 행위를 해서는 안 됩니다:</Paragraph>
      <ul>
        <ListItem>
          타인의 성정체성·성적 지향을 본인의 동의 없이 제3자에게
          공개하는 행위(아웃팅)
        </ListItem>
        <ListItem>
          혐오 표현, 차별적 발언, 욕설, 성희롱 등 타인의 인격권을
          침해하는 행위
        </ListItem>
        <ListItem>
          타인의 사진을 도용하거나 허위 프로필을 등록하는 행위
        </ListItem>
        <ListItem>영리 목적의 광고·홍보·스팸 행위</ListItem>
        <ListItem>
          서비스의 기술적 보안을 우회하거나 해킹을 시도하는 행위
        </ListItem>
        <ListItem>
          기타 관련 법령 또는 사회 통념에 반하는 행위
        </ListItem>
      </ul>

      <SectionTitle>제8조 (아웃팅 금지 및 안전 정책)</SectionTitle>
      <Paragraph>
        ① 회사는 이용자의 성정체성·성적 지향 정보를 최우선으로
        보호합니다.
        <br />② 서비스 내에서 취득한 타인의 정체성 정보를 서비스
        외부에 공유하거나 유포하는 행위(아웃팅)는 엄격히 금지되며,
        위반 시 즉시 영구 이용정지 조치됩니다.
        <br />③ 아웃팅으로 인한 피해 발생 시, 회사는 피해자 지원 및
        법적 조치 협조를 제공합니다.
        <br />④ 이용자는 프로필의 공개 범위를 직접 설정할 수 있으며,
        비공개로 설정된 정보는 타 이용자에게 노출되지 않습니다.
      </Paragraph>

      <SectionTitle>제9조 (서비스 이용 제한)</SectionTitle>
      <Paragraph>
        ① 회사는 다음의 경우 사전 통보 후 서비스 이용을 제한하거나
        정지할 수 있습니다:
      </Paragraph>
      <ul>
        <ListItem>제7조의 의무를 위반한 경우</ListItem>
        <ListItem>
          다른 이용자로부터 신고가 접수되어 확인된 경우
        </ListItem>
        <ListItem>
          셀카 인증 시 타인의 사진을 사용한 것이 확인된 경우
        </ListItem>
      </ul>
      <Paragraph>
        ② 아웃팅 행위의 경우, 사전 통보 없이 즉시 영구 정지될 수
        있습니다.
      </Paragraph>

      <SectionTitle>제10조 (회원 탈퇴)</SectionTitle>
      <Paragraph>
        ① 이용자는 언제든 서비스 내에서 회원 탈퇴를 요청할 수
        있습니다.
        <br />② 탈퇴 시 이용자의 프로필, 채팅 내역, 시그널 기록 등
        모든 데이터는 즉시 삭제되며, 이는 복구할 수 없습니다.
        <br />③ 미사용 하트는 탈퇴 시 소멸되며 환불되지 않습니다.
      </Paragraph>

      <SectionTitle>제11조 (면책)</SectionTitle>
      <Paragraph>
        ① 회사는 이용자 간의 만남·교류로 발생하는 분쟁에 대해 책임지지
        않습니다.
        <br />② 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등
        불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.
        <br />③ 이용자 본인의 귀책사유로 발생한 손해에 대해 회사는
        책임지지 않습니다.
      </Paragraph>

      <SectionTitle>제12조 (분쟁 해결)</SectionTitle>
      <Paragraph>
        ① 서비스 이용과 관련된 분쟁은 대한민국 법령을 적용합니다.
        <br />② 회사와 이용자 간 발생한 분쟁의 관할 법원은
        민사소송법에 따릅니다.
      </Paragraph>

      <div className="mt-8 rounded-xl bg-surface-secondary px-4 py-3">
        <p className="text-[10px] text-foreground-dim">
          본 약관에 대한 문의는 고객센터를 통해 접수해주세요.
          <br />
          시행일: 2026년 7월 1일
        </p>
      </div>
    </article>
  );
}

function PrivacyContent() {
  return (
    <article>
      <p className="mb-4 text-[10px] text-foreground-soft">
        시행일: 2026년 7월 1일 | 최종 수정: 2026년 7월 1일
      </p>

      <Paragraph>
        온리(Onri, 이하 &quot;회사&quot;)는 이용자의 개인정보를
        중요시하며, 개인정보보호법 등 관련 법령을 준수합니다. 본
        방침을 통해 이용자의 개인정보가 어떻게
        수집·이용·보관·파기되는지 안내합니다.
      </Paragraph>

      <SectionTitle>제1조 (수집하는 개인정보)</SectionTitle>
      <Paragraph>① 필수 수집 항목:</Paragraph>
      <ul>
        <ListItem>
          본인인증 정보: 이름, 생년월일, 성별, 휴대전화 번호
        </ListItem>
        <ListItem>
          계정 정보: 소셜 로그인 식별자(카카오/네이버/애플), 이메일
        </ListItem>
        <ListItem>프로필 정보: 닉네임, 지역, 관계 목적</ListItem>
      </ul>
      <Paragraph>② 선택 수집 항목:</Paragraph>
      <ul>
        <ListItem>
          프로필 사진, 자기소개, 관심사, 활동 시간, 키, 몸무게
        </ListItem>
        <ListItem>
          셀카 인증 사진 (인증 검토 완료 후 즉시 삭제)
        </ListItem>
      </ul>
      <Paragraph>③ 민감정보 (별도 동의):</Paragraph>
      <ul>
        <ListItem>성정체성·성적 지향 정보</ListItem>
      </ul>
      <Paragraph>④ 자동 수집 항목:</Paragraph>
      <ul>
        <ListItem>
          기기 정보(OS, 버전, 기기 식별자), 접속 로그, 서비스 이용
          기록
        </ListItem>
      </ul>

      <SectionTitle>제2조 (민감정보 처리)</SectionTitle>
      <Paragraph>
        ① 성정체성·성적 지향은 개인정보보호법 제23조에 해당하는
        민감정보로서, 회원가입 시 별도의 명시적 동의를 받아
        수집합니다.
        <br />② 민감정보는 매칭 서비스 제공 목적으로만 사용되며,
        암호화하여 저장합니다.
        <br />③ 이용자의 민감정보는 어떠한 경우에도 제3자에게 제공되지
        않으며, 법원의 영장 없이는 수사기관에도 제공하지 않습니다.
        <br />④ 이용자는 언제든 민감정보 수집 동의를 철회할 수 있으며,
        철회 시 서비스 이용이 제한될 수 있습니다.
      </Paragraph>

      <SectionTitle>제3조 (개인정보의 이용 목적)</SectionTitle>
      <ul>
        <ListItem>회원 식별 및 본인 인증</ListItem>
        <ListItem>
          매칭 서비스 제공 (프로필 탐색, 시그널, 채팅)
        </ListItem>
        <ListItem>셀카 인증을 통한 프로필 진위 확인</ListItem>
        <ListItem>부정 이용 방지 및 서비스 안전 관리</ListItem>
        <ListItem>고객 문의 응대 및 분쟁 해결</ListItem>
        <ListItem>
          서비스 개선을 위한 통계 분석 (비식별 처리)
        </ListItem>
      </ul>

      <SectionTitle>제4조 (개인정보 보유 및 파기)</SectionTitle>
      <Paragraph>
        ① 회원 탈퇴 시 모든 개인정보는 즉시 파기합니다. 단, 관련
        법령에 따라 보존이 필요한 정보는 해당 기간 동안 안전하게 보관
        후 파기합니다:
      </Paragraph>
      <ul>
        <ListItem>계약·청약철회 기록: 5년 (전자상거래법)</ListItem>
        <ListItem>
          대금 결제·재화 공급 기록: 5년 (전자상거래법)
        </ListItem>
        <ListItem>
          소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)
        </ListItem>
        <ListItem>접속 로그: 3개월 (통신비밀보호법)</ListItem>
      </ul>
      <Paragraph>
        ② 셀카 인증 사진은 관리자 검토 완료 즉시 삭제하며, 최대 72시간
        이내에 파기합니다.
        <br />③ 장기간(1년) 미이용 시 휴면 계정으로 전환하고, 별도
        저장·관리합니다.
      </Paragraph>

      <SectionTitle>제5조 (개인정보의 제3자 제공)</SectionTitle>
      <Paragraph>
        ① 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지
        않습니다.
        <br />② 다만, 다음의 경우 예외로 합니다:
      </Paragraph>
      <ul>
        <ListItem>이용자가 사전 동의한 경우</ListItem>
        <ListItem>
          법원의 영장 등 적법한 절차에 따른 수사기관 요청
        </ListItem>
      </ul>
      <Paragraph>
        ③ 특히 성정체성·성적 지향 등 민감정보는 수사기관 요청 시에도
        법원의 영장이 없는 한 제공하지 않습니다.
      </Paragraph>

      <SectionTitle>제6조 (개인정보의 안전성 확보 조치)</SectionTitle>
      <ul>
        <ListItem>
          민감정보(성정체성 등)의 AES-256 암호화 저장
        </ListItem>
        <ListItem>개인정보 전송 시 TLS 1.3 암호화</ListItem>
        <ListItem>관리자 접근 권한 최소화 및 접근 기록 관리</ListItem>
        <ListItem>정기적 보안 점검 및 취약점 진단</ListItem>
        <ListItem>
          Row Level Security(RLS)를 통한 데이터 격리
        </ListItem>
      </ul>

      <SectionTitle>제7조 (이용자의 권리)</SectionTitle>
      <Paragraph>
        이용자는 언제든 다음의 권리를 행사할 수 있습니다:
      </Paragraph>
      <ul>
        <ListItem>개인정보 열람 요청</ListItem>
        <ListItem>개인정보 수정·삭제 요청</ListItem>
        <ListItem>개인정보 처리 정지 요청</ListItem>
        <ListItem>민감정보 수집 동의 철회</ListItem>
        <ListItem>회원 탈퇴를 통한 전체 데이터 삭제</ListItem>
      </ul>
      <Paragraph>
        위 요청은 서비스 내 설정 또는 고객센터를 통해 처리할 수
        있으며, 요청 접수 후 10일 이내에 처리합니다.
      </Paragraph>

      <SectionTitle>
        제8조 (아웃팅 방지를 위한 기술적 조치)
      </SectionTitle>
      <Paragraph>
        ① 성정체성 정보는 DB 내에서 암호화 저장되며, 복호화 키는
        별도로 관리합니다.
        <br />② 스크린 캡처 방지 기능을 제공합니다(모바일 앱).
        <br />③ 이용자의 프로필은 서비스 외부 검색엔진에 노출되지
        않습니다.
        <br />④ 비공개로 설정된 항목은 매칭 알고리즘에만 활용되고, 타
        이용자에게는 표시되지 않습니다.
      </Paragraph>

      <SectionTitle>제9조 (개인정보 보호책임자)</SectionTitle>
      <Paragraph>
        개인정보 보호책임자: [이름]
        <br />
        연락처: [이메일]
        <br />
        소속: 온리 운영팀
      </Paragraph>
      <Paragraph>
        개인정보 침해 관련 상담은 아래 기관에 문의할 수 있습니다:
      </Paragraph>
      <ul>
        <ListItem>
          개인정보침해 신고센터 (privacy.kisa.or.kr / 118)
        </ListItem>
        <ListItem>
          개인정보 분쟁조정위원회 (kopico.go.kr / 1833-6972)
        </ListItem>
        <ListItem>대검찰청 사이버수사과 (spo.go.kr / 1301)</ListItem>
        <ListItem>
          경찰청 사이버안전국 (ecrm.police.go.kr / 182)
        </ListItem>
      </ul>

      <div className="mt-8 rounded-xl bg-surface-secondary px-4 py-3">
        <p className="text-[10px] text-foreground-dim">
          본 방침에 대한 문의는 고객센터를 통해 접수해주세요.
          <br />
          시행일: 2026년 7월 1일
        </p>
      </div>
    </article>
  );
}
