-- ============================================================
-- Onri 초기 스키마 마이그레이션
-- Supabase SQL Editor에서 한번에 실행
-- ============================================================

-- 확장 모듈
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE public.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname            text        NOT NULL UNIQUE CHECK (char_length(nickname) BETWEEN 2 AND 10),
  birth_prefix        text        NOT NULL,
  birth_gender_digit  smallint    NOT NULL CHECK (birth_gender_digit BETWEEN 1 AND 4),
  age                 smallint    NOT NULL CHECK (age >= 0),
  region              text        NOT NULL,
  identity            text        NOT NULL CHECK (identity IN ('FTM','MTF','NONBINARY','TRANS','CIS','OTHER')),
  identity_other      text,
  looking_for         text[]      NOT NULL DEFAULT '{}',
  bio                 text        CHECK (char_length(bio) <= 100),
  height              smallint    CHECK (height IS NULL OR (height BETWEEN 100 AND 250)),
  weight              smallint    CHECK (weight IS NULL OR (weight BETWEEN 30 AND 200)),
  interests           text[]      DEFAULT '{}',
  active_time         text[]      DEFAULT '{}',
  visibility_region   text        NOT NULL DEFAULT 'public' CHECK (visibility_region IN ('public','private')),
  visibility_age      text        NOT NULL DEFAULT 'public' CHECK (visibility_age IN ('public','private')),
  verification_status text        NOT NULL DEFAULT 'none'   CHECK (verification_status IN ('none','pending','approved','rejected')),
  sensitive_agreed    boolean     NOT NULL DEFAULT false,
  role                text        NOT NULL DEFAULT 'user'   CHECK (role IN ('user','admin')),
  is_active           boolean     NOT NULL DEFAULT true,
  last_seen_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_identity   ON public.profiles (identity);
CREATE INDEX idx_profiles_region     ON public.profiles (region);
CREATE INDEX idx_profiles_created_at ON public.profiles (created_at DESC);

-- ============================================================
-- 2. profile_photos
-- ============================================================
CREATE TABLE public.profile_photos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path  text        NOT NULL,
  display_order smallint    NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, display_order)
);

CREATE INDEX idx_profile_photos_user ON public.profile_photos (user_id);

-- ============================================================
-- 3. selfie_verifications
-- ============================================================
CREATE TABLE public.selfie_verifications (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_path    text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by   uuid        REFERENCES public.profiles(id),
  reviewed_at   timestamptz,
  reject_reason text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_selfie_user   ON public.selfie_verifications (user_id);
CREATE INDEX idx_selfie_status ON public.selfie_verifications (status);

-- ============================================================
-- 4. hearts
-- ============================================================
CREATE TABLE public.hearts (
  user_id    uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance    integer     NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. heart_transactions
-- ============================================================
CREATE TABLE public.heart_transactions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount       integer     NOT NULL,
  type         text        NOT NULL CHECK (type IN ('signup_bonus','attendance','signal_send','purchase','streak_bonus')),
  reference_id uuid,
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_heart_tx_user ON public.heart_transactions (user_id, created_at DESC);

-- ============================================================
-- 6. signals
-- ============================================================
CREATE TABLE public.signals (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (from_user_id, to_user_id),
  CHECK  (from_user_id <> to_user_id)
);

CREATE INDEX idx_signals_from   ON public.signals (from_user_id);
CREATE INDEX idx_signals_to     ON public.signals (to_user_id);
CREATE INDEX idx_signals_status ON public.signals (status);

-- ============================================================
-- 7. chat_rooms
-- ============================================================
CREATE TABLE public.chat_rooms (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_id  uuid        REFERENCES public.signals(id),
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK  (user1_id < user2_id)
);

CREATE INDEX idx_chatrooms_u1 ON public.chat_rooms (user1_id);
CREATE INDEX idx_chatrooms_u2 ON public.chat_rooms (user2_id);

-- ============================================================
-- 8. messages
-- ============================================================
CREATE TABLE public.messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    uuid        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text       text        NOT NULL,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_room ON public.messages (room_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages (sender_id);

-- ============================================================
-- 9. blocks
-- ============================================================
CREATE TABLE public.blocks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK  (blocker_id <> blocked_id)
);

-- ============================================================
-- 10. reports
-- ============================================================
CREATE TABLE public.reports (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id            uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason               text        NOT NULL CHECK (reason IN ('FAKE_PROFILE','HARASSMENT','SPAM','SEXUAL','THREAT','OUTING','OTHER')),
  detail               text,
  context              text        CHECK (context IS NULL OR context IN ('profile','chat')),
  attached_message_ids uuid[],
  status               text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  reviewed_by          uuid        REFERENCES public.profiles(id),
  reviewed_at          timestamptz,
  action_taken         text        CHECK (action_taken IS NULL OR action_taken IN ('warn','suspend','ban','none')),
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status  ON public.reports (status);
CREATE INDEX idx_reports_target  ON public.reports (target_id);
CREATE INDEX idx_reports_created ON public.reports (created_at DESC);

-- ============================================================
-- 11. attendances
-- ============================================================
CREATE TABLE public.attendances (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date            date        NOT NULL,
  streak          integer     NOT NULL DEFAULT 1,
  rewarded_hearts integer     NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ============================================================
-- 12. notification_settings
-- ============================================================
CREATE TABLE public.notification_settings (
  user_id             uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_received     boolean     NOT NULL DEFAULT true,
  signal_accepted     boolean     NOT NULL DEFAULT true,
  chat_message        boolean     NOT NULL DEFAULT true,
  attendance_reminder boolean     NOT NULL DEFAULT true,
  marketing           boolean     NOT NULL DEFAULT false,
  updated_at          timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- TRIGGERS: updated_at 자동 갱신
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_hearts_updated_at
  BEFORE UPDATE ON public.hearts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- FUNCTION: 회원가입 처리 (Auth trigger)
-- profiles + hearts(10) + notification_settings 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _signup_bonus CONSTANT int := 10;
  _nickname text;
BEGIN
  _nickname := COALESCE(
    NEW.raw_user_meta_data->>'nickname',
    '사용자_' || substr(NEW.id::text, 1, 6)
  );

  INSERT INTO public.profiles (id, nickname, birth_prefix, birth_gender_digit, age, region, identity, looking_for, sensitive_agreed)
  VALUES (
    NEW.id,
    _nickname,
    COALESCE(NEW.raw_user_meta_data->>'birth_prefix', '000000'),
    COALESCE((NEW.raw_user_meta_data->>'birth_gender_digit')::smallint, 1),
    COALESCE((NEW.raw_user_meta_data->>'age')::smallint, 0),
    COALESCE(NEW.raw_user_meta_data->>'region', ''),
    COALESCE(NEW.raw_user_meta_data->>'identity', 'OTHER'),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'looking_for')),
      '{}'
    ),
    COALESCE((NEW.raw_user_meta_data->>'sensitive_agreed')::boolean, false)
  );

  INSERT INTO public.hearts (user_id, balance)
  VALUES (NEW.id, _signup_bonus);

  INSERT INTO public.heart_transactions (user_id, amount, type, description)
  VALUES (NEW.id, _signup_bonus, 'signup_bonus', '가입 축하 보너스');

  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- FUNCTION: 시그널 보내기 (RPC)
-- 하트 3개 차감 → signal INSERT → transaction 기록
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_signal(p_to_user_id uuid)
RETURNS uuid AS $$
DECLARE
  _cost    CONSTANT int := 3;
  _balance int;
  _signal_id uuid;
BEGIN
  SELECT balance INTO _balance
  FROM public.hearts
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF _balance IS NULL OR _balance < _cost THEN
    RAISE EXCEPTION 'insufficient_hearts' USING HINT = '하트가 부족합니다';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = p_to_user_id AND blocked_id = auth.uid())
       OR (blocker_id = auth.uid() AND blocked_id = p_to_user_id)
  ) THEN
    RAISE EXCEPTION 'blocked_user' USING HINT = '차단된 사용자입니다';
  END IF;

  INSERT INTO public.signals (from_user_id, to_user_id)
  VALUES (auth.uid(), p_to_user_id)
  RETURNING id INTO _signal_id;

  UPDATE public.hearts
  SET balance = balance - _cost
  WHERE user_id = auth.uid();

  INSERT INTO public.heart_transactions (user_id, amount, type, reference_id, description)
  VALUES (auth.uid(), -_cost, 'signal_send', _signal_id, '시그널 전송');

  RETURN _signal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: 시그널 응답 (수락/거절) (RPC)
-- 수락 시 chat_rooms 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.respond_signal(p_signal_id uuid, p_action text)
RETURNS void AS $$
DECLARE
  _signal   record;
  _u1       uuid;
  _u2       uuid;
BEGIN
  IF p_action NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'invalid_action' USING HINT = 'accepted 또는 declined만 가능합니다';
  END IF;

  SELECT * INTO _signal
  FROM public.signals
  WHERE id = p_signal_id AND to_user_id = auth.uid() AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'signal_not_found' USING HINT = '유효한 시그널을 찾을 수 없습니다';
  END IF;

  UPDATE public.signals
  SET status = p_action, responded_at = now()
  WHERE id = p_signal_id;

  IF p_action = 'accepted' THEN
    _u1 := LEAST(_signal.from_user_id, auth.uid());
    _u2 := GREATEST(_signal.from_user_id, auth.uid());

    INSERT INTO public.chat_rooms (user1_id, user2_id, signal_id)
    VALUES (_u1, _u2, p_signal_id)
    ON CONFLICT (user1_id, user2_id) DO UPDATE
    SET is_active = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: 출석 체크 (RPC)
-- 연속 출석 계산 + 하트 보상 (7일 연속 보너스 3하트)
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_attendance()
RETURNS jsonb AS $$
DECLARE
  _today       date := CURRENT_DATE;
  _yesterday   date := CURRENT_DATE - 1;
  _prev_streak int;
  _new_streak  int;
  _reward      int;
  _bonus       int := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.attendances
    WHERE user_id = auth.uid() AND date = _today
  ) THEN
    RAISE EXCEPTION 'already_checked' USING HINT = '오늘 이미 출석했습니다';
  END IF;

  SELECT streak INTO _prev_streak
  FROM public.attendances
  WHERE user_id = auth.uid() AND date = _yesterday;

  _new_streak := COALESCE(_prev_streak, 0) + 1;
  _reward := 1;

  IF _new_streak % 7 = 0 THEN
    _bonus := 3;
  ELSIF _new_streak % 3 = 0 THEN
    _bonus := 1;
  END IF;

  INSERT INTO public.attendances (user_id, date, streak, rewarded_hearts)
  VALUES (auth.uid(), _today, _new_streak, _reward + _bonus);

  UPDATE public.hearts
  SET balance = balance + _reward
  WHERE user_id = auth.uid();

  INSERT INTO public.heart_transactions (user_id, amount, type, description)
  VALUES (auth.uid(), _reward, 'attendance', '출석 보상');

  IF _bonus > 0 THEN
    UPDATE public.hearts
    SET balance = balance + _bonus
    WHERE user_id = auth.uid();

    INSERT INTO public.heart_transactions (user_id, amount, type, description)
    VALUES (auth.uid(), _bonus, 'streak_bonus', _new_streak || '일 연속 출석 보너스');
  END IF;

  RETURN jsonb_build_object(
    'streak', _new_streak,
    'reward', _reward,
    'bonus', _bonus,
    'total', _reward + _bonus
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: 하트 충전 (RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.purchase_hearts(p_amount int, p_payment_ref text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  UPDATE public.hearts
  SET balance = balance + p_amount
  WHERE user_id = auth.uid();

  INSERT INTO public.heart_transactions (user_id, amount, type, description)
  VALUES (auth.uid(), p_amount, 'purchase', '하트 충전 (' || p_amount || '개)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: 셀카 인증 승인 (관리자 RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_verification(p_user_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'unauthorized' USING HINT = '관리자만 가능합니다';
  END IF;

  UPDATE public.selfie_verifications
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE user_id = p_user_id AND status = 'pending';

  UPDATE public.profiles
  SET verification_status = 'approved'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: 셀카 인증 거절 (관리자 RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.reject_verification(p_user_id uuid, p_reason text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'unauthorized' USING HINT = '관리자만 가능합니다';
  END IF;

  UPDATE public.selfie_verifications
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), reject_reason = p_reason
  WHERE user_id = p_user_id AND status = 'pending';

  UPDATE public.profiles
  SET verification_status = 'rejected'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selfie_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "본인 프로필 전체 조회" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "타인 프로필 공개 조회" ON public.profiles
  FOR SELECT USING (
    is_active = true
    AND id NOT IN (SELECT blocked_id FROM public.blocks WHERE blocker_id = auth.uid())
    AND id NOT IN (SELECT blocker_id FROM public.blocks WHERE blocked_id = auth.uid())
  );
CREATE POLICY "본인 프로필 수정" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- profile_photos
CREATE POLICY "사진 공개 조회" ON public.profile_photos
  FOR SELECT USING (true);
CREATE POLICY "본인 사진 업로드" ON public.profile_photos
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "본인 사진 수정" ON public.profile_photos
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "본인 사진 삭제" ON public.profile_photos
  FOR DELETE USING (user_id = auth.uid());

-- selfie_verifications
CREATE POLICY "셀카인증 본인+관리자 조회" ON public.selfie_verifications
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "셀카인증 본인 요청" ON public.selfie_verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- hearts
CREATE POLICY "하트 본인 조회" ON public.hearts
  FOR SELECT USING (user_id = auth.uid());

-- heart_transactions
CREATE POLICY "거래내역 본인 조회" ON public.heart_transactions
  FOR SELECT USING (user_id = auth.uid());

-- signals
CREATE POLICY "시그널 본인 관련 조회" ON public.signals
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "시그널 본인 전송" ON public.signals
  FOR INSERT WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "시그널 수신자 응답" ON public.signals
  FOR UPDATE USING (to_user_id = auth.uid() AND status = 'pending');

-- chat_rooms
CREATE POLICY "채팅방 참여자 조회" ON public.chat_rooms
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- messages
CREATE POLICY "메시지 참여 채팅방 조회" ON public.messages
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );
CREATE POLICY "메시지 참여자 전송" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid()) AND is_active = true
    )
  );
CREATE POLICY "메시지 읽음 처리" ON public.messages
  FOR UPDATE USING (
    sender_id <> auth.uid()
    AND room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  )
  WITH CHECK (read_at IS NOT NULL);

-- blocks
CREATE POLICY "차단 본인 조회" ON public.blocks
  FOR SELECT USING (blocker_id = auth.uid());
CREATE POLICY "차단 본인 추가" ON public.blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());
CREATE POLICY "차단 본인 해제" ON public.blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- reports
CREATE POLICY "신고 본인+관리자 조회" ON public.reports
  FOR SELECT USING (
    reporter_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "신고 본인 제출" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "신고 관리자 처리" ON public.reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- attendances
CREATE POLICY "출석 본인 조회" ON public.attendances
  FOR SELECT USING (user_id = auth.uid());

-- notification_settings
CREATE POLICY "알림설정 본인 조회" ON public.notification_settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "알림설정 본인 생성" ON public.notification_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "알림설정 본인 수정" ON public.notification_settings
  FOR UPDATE USING (user_id = auth.uid());


-- ============================================================
-- 13. withdrawals (회원탈퇴 기록)
-- ============================================================
CREATE TABLE public.withdrawals (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL,
  reason      text        NOT NULL CHECK (reason IN (
    'NO_MATCH','FOUND_PARTNER','RARELY_USE',
    'UNCOMFORTABLE','OTHER_APP','OTHER'
  )),
  detail      text,
  hearts_lost int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawals_created ON public.withdrawals(created_at DESC);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "탈퇴기록 관리자 조회" ON public.withdrawals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- withdraw_user: 탈퇴 이유 저장 → 관련 데이터 삭제 → auth.users 삭제
CREATE OR REPLACE FUNCTION public.withdraw_user(p_reason text, p_detail text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_hearts int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 잔여 하트 조회
  SELECT balance INTO v_hearts FROM public.hearts WHERE user_id = v_uid;

  -- 탈퇴 기록 저장 (user_id는 FK 없이 저장 — 유저 삭제 후에도 보존)
  INSERT INTO public.withdrawals (user_id, reason, detail, hearts_lost)
  VALUES (v_uid, p_reason, p_detail, COALESCE(v_hearts, 0));

  -- 관련 데이터 삭제 (CASCADE로 처리되지 않는 테이블)
  DELETE FROM public.messages WHERE sender_id = v_uid;
  DELETE FROM public.chat_rooms WHERE user1_id = v_uid OR user2_id = v_uid;
  DELETE FROM public.signals WHERE from_user_id = v_uid OR to_user_id = v_uid;
  DELETE FROM public.blocks WHERE blocker_id = v_uid OR blocked_id = v_uid;
  DELETE FROM public.reports WHERE reporter_id = v_uid;

  -- profiles ON DELETE CASCADE로 연결된 테이블은 자동 삭제:
  -- profile_photos, selfie_verifications, hearts, heart_transactions,
  -- attendances, notification_settings

  -- auth.users 삭제 → profiles CASCADE 삭제
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;


-- ============================================================
-- Supabase Storage 버킷
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-photos', 'profile-photos', true),
  ('selfie-verifications', 'selfie-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: profile-photos
CREATE POLICY "프로필사진 공개 읽기" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "프로필사진 본인 업로드" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "프로필사진 본인 삭제" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: selfie-verifications
CREATE POLICY "셀카인증 본인 업로드" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'selfie-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "셀카인증 관리자 읽기" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'selfie-verifications'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ============================================================
-- Realtime 활성화
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
