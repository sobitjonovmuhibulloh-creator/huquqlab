-- Admin panel uchun atomar funksiyalar (faqat service_role).

-- Savolni variantlari bilan birga tahrirlash. Yopiq savolda aynan bitta to'g'ri javob
-- bo'lishi tranzaksiya oxirida tekshiriladi — buzilsa hech narsa o'zgarmaydi.
-- p_patch: { question_text?, explanation?, topic?, difficulty?, source_title?, source_url?,
--            legal_article?, options?: [{ label, text, is_correct }] }
create or replace function public.update_question(p_id uuid, p_patch jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_type text;
  v_option jsonb;
begin
  select question_type into v_type from questions where id = p_id for update;
  if not found then
    raise exception 'Savol topilmadi' using errcode = 'no_data_found';
  end if;

  update questions set
    question_text   = coalesce(p_patch->>'question_text', question_text),
    normalized_text = coalesce(p_patch->>'normalized_text', normalized_text),
    explanation     = coalesce(p_patch->>'explanation', explanation),
    topic           = case when p_patch ? 'topic' then nullif(p_patch->>'topic', '') else topic end,
    difficulty      = coalesce(p_patch->>'difficulty', difficulty),
    source_title    = case when p_patch ? 'source_title' then nullif(p_patch->>'source_title', '') else source_title end,
    source_url      = case when p_patch ? 'source_url' then nullif(p_patch->>'source_url', '') else source_url end,
    legal_article   = case when p_patch ? 'legal_article' then nullif(p_patch->>'legal_article', '') else legal_article end
  where id = p_id;

  if p_patch ? 'options' then
    delete from question_options where question_id = p_id;
    for v_option in select * from jsonb_array_elements(p_patch->'options') loop
      insert into question_options (question_id, option_label, option_text, is_correct)
      values (p_id, v_option->>'label', v_option->>'text', coalesce((v_option->>'is_correct')::boolean, false));
    end loop;
  end if;

  if v_type in ('Y-1', 'Y-2') then
    if (select count(*) from question_options where question_id = p_id) <> 4
       or (select count(*) from question_options where question_id = p_id and is_correct) <> 1 then
      raise exception 'Yopiq savolda 4 ta variant va bitta to''g''ri javob bo''lishi kerak' using errcode = 'check_violation';
    end if;
  elsif not exists (select 1 from question_options where question_id = p_id and is_correct) then
    raise exception 'Ochiq savolda kamida bitta qabul qilinadigan javob bo''lishi kerak' using errcode = 'check_violation';
  end if;
end $$;

revoke execute on function public.update_question(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.update_question(uuid, jsonb) to service_role;
