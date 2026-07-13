-- ============================================================
-- 001_initial_schema.sql 롤백 (역순 삭제)
-- 잘못된 프로젝트에 적용했을 때 이 파일을 실행하세요
-- ============================================================

-- Realtime 해제
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.signals;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Storage 정책 삭제
DROP POLICY IF EXISTS "셀카인증 관리자 읽기" ON storage.objects;
DROP POLICY IF EXISTS "셀카인증 본인 업로드" ON storage.objects;
DROP POLICY IF EXISTS "프로필사진 본인 삭제" ON storage.objects;
DROP POLICY IF EXISTS "프로필사진 본인 업로드" ON storage.objects;
DROP POLICY IF EXISTS "프로필사진 공개 읽기" ON storage.objects;

-- Storage 버킷은 SQL로 직접 삭제 불가 → Dashboard > Storage에서 수동 삭제
-- 또는 Supabase CLI: supabase storage rm profile-photos / selfie-verifications

-- RLS 정책 삭제 (테이블별)
DROP POLICY IF EXISTS "알림설정 본인 수정" ON public.notification_settings;
DROP POLICY IF EXISTS "알림설정 본인 생성" ON public.notification_settings;
DROP POLICY IF EXISTS "알림설정 본인 조회" ON public.notification_settings;
DROP POLICY IF EXISTS "출석 본인 조회" ON public.attendances;
DROP POLICY IF EXISTS "신고 관리자 처리" ON public.reports;
DROP POLICY IF EXISTS "신고 본인 제출" ON public.reports;
DROP POLICY IF EXISTS "신고 본인+관리자 조회" ON public.reports;
DROP POLICY IF EXISTS "차단 본인 해제" ON public.blocks;
DROP POLICY IF EXISTS "차단 본인 추가" ON public.blocks;
DROP POLICY IF EXISTS "차단 본인 조회" ON public.blocks;
DROP POLICY IF EXISTS "메시지 읽음 처리" ON public.messages;
DROP POLICY IF EXISTS "메시지 참여자 전송" ON public.messages;
DROP POLICY IF EXISTS "메시지 참여 채팅방 조회" ON public.messages;
DROP POLICY IF EXISTS "채팅방 참여자 조회" ON public.chat_rooms;
DROP POLICY IF EXISTS "시그널 수신자 응답" ON public.signals;
DROP POLICY IF EXISTS "시그널 본인 전송" ON public.signals;
DROP POLICY IF EXISTS "시그널 본인 관련 조회" ON public.signals;
DROP POLICY IF EXISTS "거래내역 본인 조회" ON public.heart_transactions;
DROP POLICY IF EXISTS "하트 본인 조회" ON public.hearts;
DROP POLICY IF EXISTS "셀카인증 본인 요청" ON public.selfie_verifications;
DROP POLICY IF EXISTS "셀카인증 본인+관리자 조회" ON public.selfie_verifications;
DROP POLICY IF EXISTS "본인 사진 삭제" ON public.profile_photos;
DROP POLICY IF EXISTS "본인 사진 수정" ON public.profile_photos;
DROP POLICY IF EXISTS "본인 사진 업로드" ON public.profile_photos;
DROP POLICY IF EXISTS "사진 공개 조회" ON public.profile_photos;
DROP POLICY IF EXISTS "본인 프로필 수정" ON public.profiles;
DROP POLICY IF EXISTS "타인 프로필 공개 조회" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필 전체 조회" ON public.profiles;

-- Auth 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 테이블 트리거 삭제
DROP TRIGGER IF EXISTS trg_notification_settings_updated_at ON public.notification_settings;
DROP TRIGGER IF EXISTS trg_hearts_updated_at ON public.hearts;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;

-- Function 삭제
DROP FUNCTION IF EXISTS public.withdraw_user(text, text);
DROP FUNCTION IF EXISTS public.reject_verification(uuid, text);
DROP FUNCTION IF EXISTS public.approve_verification(uuid);
DROP FUNCTION IF EXISTS public.purchase_hearts(int, text);
DROP FUNCTION IF EXISTS public.check_attendance();
DROP FUNCTION IF EXISTS public.respond_signal(uuid, text);
DROP FUNCTION IF EXISTS public.send_signal(uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.set_updated_at();

-- RLS 정책 삭제 (withdrawals)
DROP POLICY IF EXISTS "탈퇴기록 관리자 조회" ON public.withdrawals;

-- 테이블 삭제 (FK 의존성 역순)
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.notification_settings CASCADE;
DROP TABLE IF EXISTS public.attendances CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.blocks CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.signals CASCADE;
DROP TABLE IF EXISTS public.heart_transactions CASCADE;
DROP TABLE IF EXISTS public.hearts CASCADE;
DROP TABLE IF EXISTS public.selfie_verifications CASCADE;
DROP TABLE IF EXISTS public.profile_photos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
