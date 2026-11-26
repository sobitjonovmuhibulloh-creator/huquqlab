-- import_tests(): test muallifini ham qabul qiladi (p_tests[].author).
-- Muallif ko'rsatilmasa — avvalgidek «HuquqLab tahririyati».
-- Funksiya imzosi o'zgarmagan, shuning uchun huquqlar (faqat service_role) saqlanib qoladi.

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
                       price, is_premium, difficulty, author, status, import_batch_id)
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
      coalesce(nullif(btrim(v_test->>'author'), ''), 'HuquqLab tahririyati'),
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
