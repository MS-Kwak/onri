# Onri 데이터베이스 스키마 설계

> Supabase (PostgreSQL) 기반 · 민감정보 암호화 · RLS 적용

## 테이블 구조

### 1. `profiles` — 사용자 프로필

| 컬럼                  | 타입          | 제약조건                 | 설명                                   |
| --------------------- | ------------- | ------------------------ | -------------------------------------- |
| `id`                  | `uuid`        | PK, FK → auth.users.id   | Supabase Auth 연동                     |
| `nickname`            | `text`        | NOT NULL, UNIQUE, 2~10자 | 닉네임                                 |
| `birth_prefix`        | `text`        | NOT NULL                 | 주민번호 앞 6자리 (암호화)             |
| `birth_gender_digit`  | `smallint`    | NOT NULL                 | 주민번호 뒷자리 첫 숫자                |
| `age`                 | `smallint`    | NOT NULL                 | 만 나이 (birth_prefix로 계산)          |
| `region`              | `text`        | NOT NULL                 | 활동 지역                              |
| `identity`            | `text`        | NOT NULL                 | FTM, MTF, NONBINARY, TRANS, CIS, OTHER |
| `identity_other`      | `text`        |                          | identity='OTHER'일 때 직접 입력 값     |
| `looking_for`         | `text[]`      | NOT NULL                 | 관계 목적 배열 [DATING, FRIEND, INFO]  |
| `bio`                 | `text`        | 100자 제한               | 자기소개                               |
| `height`              | `smallint`    |                          | 키 (cm, 선택)                          |
| `weight`              | `smallint`    |                          | 몸무게 (kg, 선택)                      |
| `interests`           | `text[]`      | 최대 10개                | 관심사 배열                            |
| `active_time`         | `text[]`      |                          | 활동 시간 배열                         |
| `visibility_region`   | `text`        | DEFAULT 'public'         | 지역 공개/비공개                       |
| `visibility_age`      | `text`        | DEFAULT 'public'         | 나이 공개/비공개                       |
| `verification_status` | `text`        | DEFAULT 'none'           | none, pending, approved, rejected      |
| `sensitive_agreed`    | `boolean`     | DEFAULT false            | 민감정보 수집 동의 여부                |
| `role`                | `text`        | DEFAULT 'user'           | user, admin                            |
| `is_active`           | `boolean`     | DEFAULT true             | 계정 활성 상태 (탈퇴/정지)             |
| `last_seen_at`        | `timestamptz` |                          | 마지막 접속 시간                       |
| `created_at`          | `timestamptz` | DEFAULT now()            | 가입일                                 |
| `updated_at`          | `timestamptz` | DEFAULT now()            | 수정일                                 |

**인덱스**: `nickname` (UNIQUE), `identity`, `region`, `created_at`

---

### 2. `profile_photos` — 프로필 사진

| 컬럼            | 타입          | 제약조건                      | 설명                  |
| --------------- | ------------- | ----------------------------- | --------------------- |
| `id`            | `uuid`        | PK, DEFAULT gen_random_uuid() |                       |
| `user_id`       | `uuid`        | FK → profiles.id, NOT NULL    |                       |
| `storage_path`  | `text`        | NOT NULL                      | Supabase Storage 경로 |
| `display_order` | `smallint`    | NOT NULL                      | 표시 순서 (0부터)     |
| `created_at`    | `timestamptz` | DEFAULT now()                 |                       |

**인덱스**: `user_id, display_order` (UNIQUE)

---

### 3. `selfie_verifications` — 셀카 인증 요청

| 컬럼            | 타입          | 제약조건                      | 설명                        |
| --------------- | ------------- | ----------------------------- | --------------------------- |
| `id`            | `uuid`        | PK, DEFAULT gen_random_uuid() |                             |
| `user_id`       | `uuid`        | FK → profiles.id, NOT NULL    |                             |
| `photo_path`    | `text`        | NOT NULL                      | 인증 사진 Storage 경로      |
| `status`        | `text`        | DEFAULT 'pending'             | pending, approved, rejected |
| `reviewed_by`   | `uuid`        | FK → profiles.id              | 검토한 관리자               |
| `reviewed_at`   | `timestamptz` |                               | 검토 시간                   |
| `reject_reason` | `text`        |                               | 거절 사유                   |
| `created_at`    | `timestamptz` | DEFAULT now()                 |                             |

**인덱스**: `user_id`, `status`

---

### 4. `hearts` — 하트 잔액

| 컬럼         | 타입          | 제약조건              | 설명      |
| ------------ | ------------- | --------------------- | --------- |
| `user_id`    | `uuid`        | PK, FK → profiles.id  |           |
| `balance`    | `integer`     | DEFAULT 0, CHECK >= 0 | 현재 잔액 |
| `updated_at` | `timestamptz` | DEFAULT now()         |           |

---

### 5. `heart_transactions` — 하트 거래 내역

| 컬럼           | 타입          | 제약조건                      | 설명                                                          |
| -------------- | ------------- | ----------------------------- | ------------------------------------------------------------- |
| `id`           | `uuid`        | PK, DEFAULT gen_random_uuid() |                                                               |
| `user_id`      | `uuid`        | FK → profiles.id, NOT NULL    |                                                               |
| `amount`       | `integer`     | NOT NULL                      | 양수=획득, 음수=소비                                          |
| `type`         | `text`        | NOT NULL                      | signup_bonus, attendance, signal_send, purchase, streak_bonus |
| `reference_id` | `uuid`        |                               | 관련 시그널/결제 ID                                           |
| `description`  | `text`        |                               | 설명                                                          |
| `created_at`   | `timestamptz` | DEFAULT now()                 |                                                               |

**인덱스**: `user_id, created_at DESC`

---

### 6. `signals` — 시그널 (관심 표현)

| 컬럼           | 타입          | 제약조건                      | 설명                                 |
| -------------- | ------------- | ----------------------------- | ------------------------------------ |
| `id`           | `uuid`        | PK, DEFAULT gen_random_uuid() |                                      |
| `from_user_id` | `uuid`        | FK → profiles.id, NOT NULL    | 보낸 사람                            |
| `to_user_id`   | `uuid`        | FK → profiles.id, NOT NULL    | 받은 사람                            |
| `status`       | `text`        | DEFAULT 'pending'             | pending, accepted, declined, expired |
| `created_at`   | `timestamptz` | DEFAULT now()                 |                                      |
| `responded_at` | `timestamptz` |                               | 응답 시간                            |

**인덱스**: `from_user_id`, `to_user_id`, `status`
**UNIQUE**: `(from_user_id, to_user_id)` — 중복 시그널 방지

---

### 7. `chat_rooms` — 채팅방

| 컬럼         | 타입          | 제약조건                      | 설명             |
| ------------ | ------------- | ----------------------------- | ---------------- |
| `id`         | `uuid`        | PK, DEFAULT gen_random_uuid() |                  |
| `user1_id`   | `uuid`        | FK → profiles.id, NOT NULL    |                  |
| `user2_id`   | `uuid`        | FK → profiles.id, NOT NULL    |                  |
| `signal_id`  | `uuid`        | FK → signals.id               | 연결된 시그널    |
| `is_active`  | `boolean`     | DEFAULT true                  | 채팅방 활성 상태 |
| `created_at` | `timestamptz` | DEFAULT now()                 |                  |

**인덱스**: `user1_id`, `user2_id`
**UNIQUE**: `(user1_id, user2_id)` — 같은 쌍의 중복 방지 (user1_id < user2_id로 정렬)

---

### 8. `messages` — 메시지

| 컬럼         | 타입          | 제약조건                      | 설명        |
| ------------ | ------------- | ----------------------------- | ----------- |
| `id`         | `uuid`        | PK, DEFAULT gen_random_uuid() |             |
| `room_id`    | `uuid`        | FK → chat_rooms.id, NOT NULL  |             |
| `sender_id`  | `uuid`        | FK → profiles.id, NOT NULL    |             |
| `text`       | `text`        | NOT NULL                      | 메시지 내용 |
| `read_at`    | `timestamptz` |                               | 읽은 시간   |
| `created_at` | `timestamptz` | DEFAULT now()                 |             |

**인덱스**: `room_id, created_at` (복합), `sender_id`

> Supabase Realtime 구독 대상 테이블

---

### 9. `blocks` — 차단

| 컬럼         | 타입          | 제약조건                      | 설명          |
| ------------ | ------------- | ----------------------------- | ------------- |
| `id`         | `uuid`        | PK, DEFAULT gen_random_uuid() |               |
| `blocker_id` | `uuid`        | FK → profiles.id, NOT NULL    | 차단한 사람   |
| `blocked_id` | `uuid`        | FK → profiles.id, NOT NULL    | 차단당한 사람 |
| `created_at` | `timestamptz` | DEFAULT now()                 |               |

**UNIQUE**: `(blocker_id, blocked_id)`

---

### 10. `reports` — 신고

| 컬럼                   | 타입          | 제약조건                      | 설명                                                          |
| ---------------------- | ------------- | ----------------------------- | ------------------------------------------------------------- |
| `id`                   | `uuid`        | PK, DEFAULT gen_random_uuid() |                                                               |
| `reporter_id`          | `uuid`        | FK → profiles.id, NOT NULL    | 신고자                                                        |
| `target_id`            | `uuid`        | FK → profiles.id, NOT NULL    | 신고 대상                                                     |
| `reason`               | `text`        | NOT NULL                      | FAKE_PROFILE, HARASSMENT, SPAM, SEXUAL, THREAT, OUTING, OTHER |
| `detail`               | `text`        |                               | 기타 사유 직접 입력                                           |
| `context`              | `text`        |                               | 신고 발생 맥락 (profile, chat)                                |
| `attached_message_ids` | `uuid[]`      |                               | 첨부된 메시지 ID들                                            |
| `status`               | `text`        | DEFAULT 'pending'             | pending, reviewed, resolved, dismissed                        |
| `reviewed_by`          | `uuid`        | FK → profiles.id              | 검토 관리자                                                   |
| `reviewed_at`          | `timestamptz` |                               | 검토 시간                                                     |
| `action_taken`         | `text`        |                               | 조치 내용 (warn, suspend, ban, none)                          |
| `created_at`           | `timestamptz` | DEFAULT now()                 |                                                               |

**인덱스**: `status`, `target_id`, `created_at DESC`

---

### 11. `attendances` — 출석 체크

| 컬럼              | 타입          | 제약조건                      | 설명           |
| ----------------- | ------------- | ----------------------------- | -------------- |
| `id`              | `uuid`        | PK, DEFAULT gen_random_uuid() |                |
| `user_id`         | `uuid`        | FK → profiles.id, NOT NULL    |                |
| `date`            | `date`        | NOT NULL                      | 출석 날짜      |
| `streak`          | `integer`     | DEFAULT 1                     | 연속 출석 일수 |
| `rewarded_hearts` | `integer`     | DEFAULT 1                     | 보상 하트 수   |
| `created_at`      | `timestamptz` | DEFAULT now()                 |                |

**UNIQUE**: `(user_id, date)` — 하루 1회 제한

---

### 12. `notification_settings` — 알림 설정

| 컬럼                  | 타입          | 제약조건             | 설명             |
| --------------------- | ------------- | -------------------- | ---------------- |
| `user_id`             | `uuid`        | PK, FK → profiles.id |                  |
| `signal_received`     | `boolean`     | DEFAULT true         | 시그널 수신 알림 |
| `signal_accepted`     | `boolean`     | DEFAULT true         | 시그널 수락 알림 |
| `chat_message`        | `boolean`     | DEFAULT true         | 채팅 메시지 알림 |
| `attendance_reminder` | `boolean`     | DEFAULT true         | 출석 리마인더    |
| `marketing`           | `boolean`     | DEFAULT false        | 마케팅 알림      |
| `updated_at`          | `timestamptz` | DEFAULT now()        |                  |

---

## RLS (Row Level Security) 정책 요약

| 테이블                | SELECT                         | INSERT        | UPDATE      | DELETE               |
| --------------------- | ------------------------------ | ------------- | ----------- | -------------------- |
| profiles              | 본인 전체 / 타인은 공개 필드만 | Auth 트리거   | 본인만      | 본인만 (soft delete) |
| profile_photos        | 모두                           | 본인만        | 본인만      | 본인만               |
| selfie_verifications  | 본인 + 관리자                  | 본인만        | 관리자만    | -                    |
| hearts                | 본인만                         | 시스템만      | 시스템만    | -                    |
| heart_transactions    | 본인만                         | 시스템만      | -           | -                    |
| signals               | 본인 관련만                    | 본인만 (from) | 본인만 (to) | -                    |
| chat_rooms            | 참여자만                       | 시스템만      | -           | -                    |
| messages              | 참여 채팅방만                  | 참여자만      | 읽음 처리만 | -                    |
| blocks                | 본인 것만                      | 본인만        | -           | 본인만               |
| reports               | 본인 + 관리자                  | 본인만        | 관리자만    | -                    |
| attendances           | 본인만                         | 시스템만      | -           | -                    |
| notification_settings | 본인만                         | 본인만        | 본인만      | -                    |

## 민감정보 보호

- `birth_prefix`: pgcrypto로 암호화 저장 (`pgp_sym_encrypt`)
- `identity`, `identity_other`: 암호화 저장 고려 (검색 필요 시 해시 인덱스)
- 프로필 조회 시 `visibility_*` 값에 따라 필드 필터링
- 셀카 인증 사진: 검토 완료 후 Storage에서 즉시 삭제
- 차단한 사용자의 프로필은 조회 결과에서 제외

## Supabase Storage 버킷

| 버킷                   | 용도           | 접근                       |
| ---------------------- | -------------- | -------------------------- |
| `profile-photos`       | 프로필 사진    | 본인 업로드, 공개 읽기     |
| `selfie-verifications` | 셀카 인증 사진 | 본인 업로드, 관리자만 읽기 |

## Supabase Realtime

- `messages` 테이블 구독 → 실시간 채팅
- `signals` 테이블 구독 → 시그널 수신 알림
