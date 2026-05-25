-- 022_study_plans_admin.sql
-- Adds published flag, missing indexes, explicit admin DELETE policies,
-- and adjusts study_plans read policy to respect draft/published state.

-- ============================================================
-- 1. published column on study_plans
-- ============================================================
alter table public.study_plans
  add column if not exists published boolean not null default false;

-- ============================================================
-- 2. Missing indexes
-- ============================================================
create index if not exists idx_units_plan_id           on public.units(plan_id);
create index if not exists idx_topics_unit_id          on public.topics(unit_id);
create index if not exists idx_topic_questions_topic_id on public.topic_questions(topic_id);

-- ============================================================
-- 3. Admin DELETE policies for units / topics / topic_questions
-- ============================================================
create policy "units: admin delete"
  on public.units for delete
  using (is_admin());

create policy "topics: admin delete"
  on public.topics for delete
  using (is_admin());

create policy "topic_questions: admin delete"
  on public.topic_questions for delete
  using (is_admin());

-- ============================================================
-- 4. Restrict study_plans read to published=true for non-admins
-- ============================================================
drop policy if exists "study_plans: authenticated read" on public.study_plans;

-- Admin sees all plans (drafts + published); everyone else sees only published.
create policy "study_plans: authenticated read"
  on public.study_plans for select
  using (
    auth.role() = 'authenticated'
    and (get_my_role() = 'admin' or published = true)
  );
