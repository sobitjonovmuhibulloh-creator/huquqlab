-- HuquqLab: testlar bazasi, savollar banki, urinishlar va import tarixi.
--
-- Xavfsizlik modeli:
--   * Brauzer bazaga hech qachon to'g'ridan-to'g'ri ulanmaydi. Barcha o'qish/yozish
--     Next.js server route'lari orqali service_role kaliti bilan bajariladi.
--   * RLS: anon/authenticated rollar faqat e'lon qilingan (published) testlar
--     meta-ma'lumotini o'qiy oladi. Savollar, javob variantlari (is_correct!) va
--     import tarixi ular uchun butunlay yopiq — anon kalit sizib chiqsa ham
--     javob kaliti ochilmaydi.
--   * Yozish faqat service_role orqali (RLS'ni chetlab o'tadi). Import —
--     import_tests() funksiyasi orqali bitta tranzaksiyada: xato bo'lsa hech narsa yozilmaydi.

-- gen_random_uuid() PostgreSQL 13+ yadrosida mavjud (pgcrypto shart emas)

-- ---------------------------------------------------------------- import tarixi
create table public.import_batches (
  id                 uuid primary key default gen_random_uuid(),
  file_name          text not null,
  file_format        text not null check (file_format in ('xlsx', 'csv')),
  imported_by        text not null default 'admin',
  tests_created      int  not null default 0,
  questions_imported int  not null default 0,
  warnings           jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------- testlar
create table public.tests (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(btrim(title)) between 3 and 200),
  description       text not null default '',
  category          text not null check (category in (
                      'milliy-sertifikat', 'attestatsiya', 'mavzulashtirilgan', 'konstitutsiya',
                      'kodekslar', 'otm', 'oqituvchilar', 'talabalar')),
  exam_type         text not null default 'practice' check (exam_type in ('mock', 'topic', 'practice', 'attestation')),
  grade_or_audience text[] not null default '{}',
  question_count    int  not null default 0 check (question_count >= 0),
  duration_minutes  int  not null check (duration_minutes between 1 and 300),
  -- NULL = standart narx (admin «Narxlar» bo'limidagi «1 ta premium test»)
  price             int  check (price is null or price between 0 and 10000000),
  is_premium        boolean not null default true,
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  difficulty        text not null default 'o''rta' check (difficulty in ('oson', 'o''rta', 'murakkab')),
  author            text not null default 'HuquqLab tahririyati',
  import_batch_id   uuid references public.import_batches (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint tests_free_has_no_price check (is_premium or coalesce(price, 0) = 0)
);
create unique index tests_title_unique on public.tests (lower(btrim(title)));
create index tests_status_idx on public.tests (status);

-- ---------------------------------------------------------------- savollar
create table public.questions (
  id                 uuid primary key default gen_random_uuid(),
  test_id            uuid not null references public.tests (id) on delete cascade,
  question_text      text not null check (char_length(btrim(question_text)) > 0),
  -- Y-1: bitta to'g'ri javobli yopiq; Y-2: vaziyatli yopiq; O: qisqa javobli ochiq
  question_type      text not null default 'Y-1' check (question_type in ('Y-1', 'Y-2', 'O')),
  -- Rasmiy spetsifikatsiya kodi (masalan 2.4) yoki erkin mavzu nomi
  topic              text,
  difficulty         text not null default 'o''rta' check (difficulty in ('oson', 'o''rta', 'murakkab')),
  explanation        text not null default '',
  source_title       text,
  source_url         text check (source_url is null or source_url ~* '^https?://'),
  legal_article      text,
  legal_version_date date,
  sort_order         int  not null default 0,
  -- Takroriy savollarni aniqlash uchun (ilova normalizeAnswer() bilan hisoblaydi)
  normalized_text    text not null,
  created_at         timestamptz not null default now()
);
create unique index questions_test_text_unique on public.questions (test_id, normalized_text);
create index questions_normalized_idx on public.questions (normalized_text);
create index questions_test_order_idx on public.questions (test_id, sort_order);

-- Yopiq savollar: A–D variantlari, bittasi is_correct.
-- Ochiq (O) savollar: qabul qilinadigan javoblar O1, O2… yorliqlari bilan, barchasi is_correct.
create table public.question_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions (id) on delete cascade,
  option_label text not null check (option_label ~ '^([A-D]|O[0-9]+)$'),
  option_text  text not null check (char_length(btrim(option_text)) > 0),
  is_correct   boolean not null default false,
  unique (question_id, option_label)
);

-- ---------------------------------------------------------------- urinishlar
create table public.test_attempts (
  id          uuid primary key default gen_random_uuid(),
  -- Hozircha HuquqLab access cookie'dagi anonim uid; akkauntlar qo'shilganda auth.users(id)
  user_id     uuid not null,
  test_id     uuid not null references public.tests (id) on delete cascade,
  started_at  timestamptz not null,
  finished_at timestamptz,
  score       int check (score >= 0),
  total       int check (total >= 0),
  status      text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'auto_submitted')),
  created_at  timestamptz not null default now()
);
create index test_attempts_user_idx on public.test_attempts (user_id, created_at desc);

create table public.attempt_answers (
  id                 uuid primary key default gen_random_uuid(),
  attempt_id         uuid not null references public.test_attempts (id) on delete cascade,
  question_id        uuid not null references public.questions (id) on delete cascade,
  selected_option_id uuid references public.question_options (id) on delete set null,
  answer_text        text,
  is_correct         boolean not null,
  unique (attempt_id, question_id)
);

-- ---------------------------------------------------------------- triggerlar
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger tests_touch before update on public.tests
  for each row execute function public.touch_updated_at();

-- question_count doim haqiqiy savollar soniga teng bo'lsin
create or replace function public.sync_question_count() returns trigger
language plpgsql as $$
begin
  update public.tests t
     set question_count = (select count(*) from public.questions q where q.test_id = t.id)
   where t.id in (coalesce(new.test_id, old.test_id), coalesce(old.test_id, new.test_id));
  return null;
end $$;

create trigger questions_count after insert or delete or update of test_id on public.questions
  for each row execute function public.sync_question_count();

-- Bo'sh testni e'lon qilib bo'lmaydi
create or replace function public.guard_publish() returns trigger
language plpgsql as $$
begin
  if new.status = 'published' and new.question_count = 0 then
    raise exception 'Savollarsiz testni e''lon qilib bo''lmaydi' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger tests_guard_publish before insert or update of status, question_count on public.tests
  for each row execute function public.guard_publish();

-- ---------------------------------------------------------------- import (atomar)
-- p_tests: [{ title, description, category, exam_type, grade_or_audience[], duration_minutes,
--             price|null, is_premium, difficulty, questions: [{ question_text, question_type, topic,
--             difficulty, explanation, source_title, source_url, legal_article, normalized_text,
--             options: [{ label, text, is_correct }] }] }]
-- Har qanday xato (nomi band test, takroriy savol, CHECK buzilishi) butun importni bekor qiladi.
create or replace function public.import_tests(
  p_tests jsonb,
  p_file_name text,
  p_file_format text,
  p_imported_by text,
  p_warnings jsonb default '[]'::jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_batch uuid;
  v_test jsonb;
  v_question jsonb;
  v_option jsonb;
  v_test_id uuid;
  v_question_id uuid;
  v_order int;
  v_tests int := 0;
  v_questions int := 0;
  v_ids uuid[] := '{}';
begin
  if jsonb_typeof(p_tests) <> 'array' or jsonb_array_length(p_tests) = 0 then
    raise exception 'Import bo''sh' using errcode = 'invalid_parameter_value';
  end if;

  insert into import_batches (file_name, file_format, imported_by, warnings)
  values (p_file_name, p_file_format, coalesce(nullif(p_imported_by, ''), 'admin'), coalesce(p_warnings, '[]'::jsonb))
  returning id into v_batch;

  for v_test in select * from jsonb_array_elements(p_tests) loop
    if exists (select 1 from tests where lower(btrim(title)) = lower(btrim(v_test->>'title'))) then
      raise exception 'Bunday nomli test bazada mavjud: %', v_test->>'title' using errcode = 'unique_violation';
    end if;

    insert into tests (title, description, category, exam_type, grade_or_audience, duration_minutes,
                       price, is_premium, difficulty, status, import_batch_id)
    values (
      btrim(v_test->>'title'),
      coalesce(v_test->>'description', ''),
      v_test->>'category',
      coalesce(v_test->>'exam_type', 'practice'),
      coalesce(array(select jsonb_array_elements_text(v_test->'grade_or_audience')), '{}'),
      (v_test->>'duration_minutes')::int,
      nullif(v_test->>'price', '')::int,
      coalesce((v_test->>'is_premium')::boolean, true),
      coalesce(v_test->>'difficulty', 'o''rta'),
      'draft',
      v_batch
    )
    returning id into v_test_id;
    v_tests := v_tests + 1;
    v_ids := v_ids || v_test_id;
    v_order := 0;

    for v_question in select * from jsonb_array_elements(v_test->'questions') loop
      v_order := v_order + 1;
      insert into questions (test_id, question_text, question_type, topic, difficulty, explanation,
                             source_title, source_url, legal_article, sort_order, normalized_text)
      values (
        v_test_id,
        v_question->>'question_text',
        coalesce(v_question->>'question_type', 'Y-1'),
        nullif(v_question->>'topic', ''),
        coalesce(v_question->>'difficulty', 'o''rta'),
        coalesce(v_question->>'explanation', ''),
        nullif(v_question->>'source_title', ''),
        nullif(v_question->>'source_url', ''),
        nullif(v_question->>'legal_article', ''),
        v_order,
        v_question->>'normalized_text'
      )
      returning id into v_question_id;
      v_questions := v_questions + 1;

      for v_option in select * from jsonb_array_elements(v_question->'options') loop
        insert into question_options (question_id, option_label, option_text, is_correct)
        values (v_question_id, v_option->>'label', v_option->>'text', coalesce((v_option->>'is_correct')::boolean, false));
      end loop;

      -- Yopiq savolda aynan bitta to'g'ri javob bo'lishi shart
      if (v_question->>'question_type') in ('Y-1', 'Y-2')
         and (select count(*) from question_options where question_id = v_question_id and is_correct) <> 1 then
        raise exception 'Yopiq savolda bitta to''g''ri javob bo''lishi kerak: %', left(v_question->>'question_text', 80)
          using errcode = 'check_violation';
      end if;
    end loop;
  end loop;

  update import_batches set tests_created = v_tests, questions_imported = v_questions where id = v_batch;

  return jsonb_build_object('batch_id', v_batch, 'tests_created', v_tests, 'questions_imported', v_questions, 'test_ids', to_jsonb(v_ids));
end $$;

-- Bazadagi takroriy savollarni topish (preview bosqichida)
create or replace function public.find_duplicate_questions(p_texts text[])
returns table (normalized_text text, test_title text)
language sql stable security invoker set search_path = public
as $$
  select q.normalized_text, t.title
    from questions q join tests t on t.id = q.test_id
   where q.normalized_text = any (p_texts);
$$;

-- ---------------------------------------------------------------- RLS
alter table public.tests            enable row level security;
alter table public.questions        enable row level security;
alter table public.question_options enable row level security;
alter table public.test_attempts    enable row level security;
alter table public.attempt_answers  enable row level security;
alter table public.import_batches   enable row level security;

-- Ochiq katalog: faqat e'lon qilingan testlar meta-ma'lumoti (savollarsiz)
create policy tests_public_read on public.tests
  for select to anon, authenticated
  using (status = 'published');

-- Foydalanuvchi faqat o'z urinishlarini ko'radi (akkauntlar ulanganda)
create policy attempts_own_read on public.test_attempts
  for select to authenticated
  using (user_id = auth.uid());

create policy attempt_answers_own_read on public.attempt_answers
  for select to authenticated
  using (exists (select 1 from public.test_attempts a where a.id = attempt_id and a.user_id = auth.uid()));

-- questions, question_options, import_batches: anon/authenticated uchun siyosat YO'Q → hammasi taqiqlangan.
-- Qo'shimcha himoya qatlami sifatida jadval huquqlarini ham olib qo'yamiz.
revoke all on public.questions, public.question_options, public.import_batches from anon, authenticated;
revoke insert, update, delete, truncate on public.tests, public.test_attempts, public.attempt_answers from anon, authenticated;

revoke execute on function public.import_tests(jsonb, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.find_duplicate_questions(text[]) from public, anon, authenticated;
grant execute on function public.import_tests(jsonb, text, text, text, jsonb) to service_role;
grant execute on function public.find_duplicate_questions(text[]) to service_role;
