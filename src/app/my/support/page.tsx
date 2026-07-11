'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  Mail,
  MessageCircleMore,
  Heart,
  UserX,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const FAQ_ITEMS = [
  {
    icon: <Heart size={15} className="text-gold" />,
    q: '시그널은 어떻게 보내나요?',
    a: '홈에서 마음에 드는 프로필을 누르면 상세 페이지가 열려요. 하단의 "시그널 보내기" 버튼을 누르면 하트 3개를 사용해서 시그널을 보낼 수 있어요.',
  },
  {
    icon: <CreditCard size={15} className="text-gold" />,
    q: '하트는 어떻게 충전하나요?',
    a: '마이페이지 > 보유 하트 영역의 "충전하기" 버튼을 누르면 충전 페이지로 이동해요. 10개부터 120개까지 다양한 패키지를 선택할 수 있어요.',
  },
  {
    icon: <ShieldCheck size={15} className="text-gold" />,
    q: '셀카 인증은 왜 필요한가요?',
    a: '셀카 인증은 프로필 사진과 실제 본인이 같은 사람인지 확인하는 절차예요. 인증 완료 시 프로필에 "셀카 인증" 뱃지가 표시되어 다른 유저에게 신뢰를 줄 수 있어요.',
  },
  {
    icon: <UserX size={15} className="text-gold" />,
    q: '상대를 차단하면 어떻게 되나요?',
    a: '차단한 유저는 내 프로필을 볼 수 없고, 시그널도 보낼 수 없어요. 차단 목록에서 언제든 해제할 수 있어요.',
  },
  {
    icon: <AlertTriangle size={15} className="text-gold" />,
    q: '부적절한 유저를 신고하고 싶어요',
    a: '해당 유저의 프로필 상세 페이지에서 우측 상단 더보기(⋮) 버튼을 누르면 "신고하기" 옵션이 있어요. 신고 사유를 선택하면 운영팀에서 검토 후 조치해요.',
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [inquiryText, setInquiryText] = useState('');

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmitInquiry = () => {
    if (!inquiryText.trim()) return;
    toast.success('문의가 접수되었어요. 빠르게 답변드릴게요!');
    setInquiryText('');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-navy">
      <header className="sticky top-0 z-40 bg-navy">
        <div className="flex items-center gap-2 px-5 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <ArrowLeft size={20} />
          </button>
          <HelpCircle size={18} className="text-gold" />
          <h1 className="text-lg font-bold text-cream">고객센터</h1>
        </div>
        <div className="h-px bg-navy-light" />
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 pt-5 pb-10">
        {/* FAQ */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-cream">
            자주 묻는 질문
          </h2>
          <div className="flex flex-col gap-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-cream/3"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-cream/5"
                >
                  {item.icon}
                  <span className="flex-1 text-sm font-medium text-cream/80">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-cream/25 transition-transform duration-200 ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="border-t border-cream/5 px-4 py-3">
                    <p className="text-xs leading-relaxed text-cream/50">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 1:1 문의 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-cream">
            <MessageCircleMore size={14} className="text-gold/60" />
            1:1 문의하기
          </h2>
          <div className="rounded-2xl bg-cream/3 p-4">
            <textarea
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="궁금한 점이나 불편한 사항을 알려주세요"
              className="w-full resize-none rounded-xl border border-navy-light bg-navy-light px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-soft/50 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-cream/20">
                {inquiryText.length}/500
              </p>
              <button
                onClick={handleSubmitInquiry}
                disabled={!inquiryText.trim()}
                className="flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-gold/90 active:scale-95 disabled:bg-cream/5 disabled:text-cream/20"
              >
                <Mail size={13} />
                보내기
              </button>
            </div>
          </div>
        </section>

        {/* 운영 시간 안내 */}
        <section className="rounded-2xl bg-cream/3 px-4 py-3.5">
          <p className="text-xs font-medium text-cream/50">
            운영 시간 안내
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-cream/30">
            평일 10:00 ~ 18:00 (주말·공휴일 휴무)
            <br />
            문의 접수 후 24시간 이내 답변드려요
          </p>
        </section>
      </div>
    </div>
  );
}
