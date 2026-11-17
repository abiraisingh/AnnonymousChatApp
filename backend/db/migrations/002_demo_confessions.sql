INSERT INTO users (id, is_guest)
VALUES
  ('d0000000-0000-4000-8000-000000000001', true),
  ('d0000000-0000-4000-8000-000000000002', true),
  ('d0000000-0000-4000-8000-000000000003', true),
  ('d0000000-0000-4000-8000-000000000004', true),
  ('d0000000-0000-4000-8000-000000000005', true),
  ('d0000000-0000-4000-8000-000000000006', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO confessions (id, author_id, category, body, created_at)
VALUES
  (
    'd1000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000001',
    'Random',
    'I still take the long way home sometimes because it gives me a little more time to listen to my favorite songs.',
    now() - interval '15 minutes'
  ),
  (
    'd1000000-0000-4000-8000-000000000002',
    'd0000000-0000-4000-8000-000000000002',
    'Career',
    'I told everyone I had my next step figured out. Truth is, I am still exploring, and that feels a lot less scary than it used to.',
    now() - interval '30 minutes'
  ),
  (
    'd1000000-0000-4000-8000-000000000003',
    'd0000000-0000-4000-8000-000000000003',
    'Relationships',
    'I keep the first note my best friend ever left me tucked inside a book. It is ordinary paper, but it always makes me smile.',
    now() - interval '45 minutes'
  ),
  (
    'd1000000-0000-4000-8000-000000000004',
    'd0000000-0000-4000-8000-000000000004',
    'College',
    'I am learning that asking a question in class does not mean I am behind. Usually someone else was wondering the same thing.',
    now() - interval '1 hour'
  ),
  (
    'd1000000-0000-4000-8000-000000000005',
    'd0000000-0000-4000-8000-000000000005',
    'Family',
    'I used to think every family dinner had to be perfect. Now I am happy when we all stay at the table long enough to laugh.',
    now() - interval '90 minutes'
  ),
  (
    'd1000000-0000-4000-8000-000000000006',
    'd0000000-0000-4000-8000-000000000006',
    'Gaming',
    'Sometimes I replay a favorite game just to revisit the places that felt like home when I first found them.',
    now() - interval '2 hours'
  )
ON CONFLICT (id) DO NOTHING;
