# Anonymous Confession App — MVP Plan

A premium dark, glassmorphism social app where every user is "User#1234". Built on Lovable Cloud (Postgres + auth + realtime). Java/Spring is replaced by Lovable Cloud, which gives us the same Postgres + auth + realtime without separate hosting.

## Scope of this pass

Shipping a working end-to-end MVP. Future-feature list (stories, polls, voice, leaderboards, PWA, etc.) is deferred.

**In:**
- Dark glassmorphism design system
- Email/password auth + Guest mode (anonymous Supabase session)
- Anonymous identity (`User{N}` assigned by signup order, unique)
- Bottom tab nav: Home / Groups / Chats / Profile
- Global feed: list, post with category + mood emoji, like, bookmark, report, share
- Private replies: "Reply privately" opens a 1:1 anonymous chat thread
- Groups: create (public/private + invite code), join, leave, group feed with public anonymous comments
- Chats: 1:1 + group chat list, real-time messages, unread badges, timestamps
- Profile: anonymous username, guest/registered badge, counts, settings (logout, delete account, notification toggle)
- Search: confessions, groups, categories, anonymous user IDs
- Trending tab (rank by likes + recency)
- Reactions (❤️ 😂 😢 😮 👏) on confessions
- Reporting with reason; admin moderation table (no admin UI yet)
- Basic AI pre-post moderation via Lovable AI (block hate/PII/threats with friendly warning)

**Out (future iterations):**
- Phone OTP, social login, push notifications (browser only in-app), stories, polls, voice, badges, leaderboards, i18n, mobile apps, advanced admin dashboard

## UX & Design

- **Theme:** deep near-black background (`oklch(0.14 0.02 270)`), elevated glass surfaces with `backdrop-blur-xl`, subtle white/10 borders, soft violet→cyan gradient accent for primary CTAs and active states.
- **Typography:** Space Grotesk display / Inter body via `@fontsource`.
- **Motion:** Framer Motion for card enter, tab switch, modal scale-in; tasteful, not noisy.
- **Components:** rounded-2xl glass cards, frosted bottom nav, gradient pill buttons, emoji reaction bar.
- All colors as semantic tokens in `src/styles.css` (oklch). No hardcoded colors in components.

## Routes (TanStack Start)

Public:
- `/auth` — email sign in/up + "Continue as guest"

Protected (`_authenticated/`):
- `/` — Home feed (tabs: Latest / Trending / Bookmarks)
- `/post` — Create confession (modal-style)
- `/groups` — Browse + create
- `/groups/$groupId` — Group feed + members + group chat tab
- `/chats` — Conversation list
- `/chats/$threadId` — 1:1 or group chat
- `/profile` — Stats + settings
- `/search` — Search confessions, groups, users

## Data model (Postgres / RLS on every table)

- `profiles` (id=auth.users.id, anon_number int unique, is_guest bool, created_at)
  - Trigger on `auth.users` insert assigns `anon_number = nextval('anon_number_seq')`, displayed as `User{n}`.
- `user_roles` (user_id, role enum admin|moderator|user) + `has_role()` security-definer (per platform rules).
- `confessions` (id, author_id, category, mood, body, created_at, group_id nullable)
- `reactions` (confession_id, user_id, kind) unique(confession_id,user_id,kind)
- `bookmarks` (user_id, confession_id)
- `reports` (id, target_type, target_id, reporter_id, reason, created_at, status)
- `groups` (id, name, slug, description, category, is_private, invite_code, icon_url, creator_id)
- `group_members` (group_id, user_id, role admin|member, joined_at)
- `group_comments` (id, confession_id, author_id, body, parent_id nullable, created_at) — public within group
- `chat_threads` (id, kind enum direct|group, group_id nullable, confession_id nullable, created_at)
- `chat_participants` (thread_id, user_id, last_read_at)
- `messages` (id, thread_id, sender_id, body, created_at)
- `notifications` (id, user_id, kind, payload jsonb, read_at, created_at)

RLS highlights:
- Profile public columns (`anon_number`, `is_guest`) readable to authenticated; private columns not exposed.
- Confessions: SELECT authenticated when `group_id IS NULL` OR caller is member; INSERT by author = `auth.uid()`.
- Messages: SELECT/INSERT only if `auth.uid()` is in `chat_participants`.
- Reports/notifications: owner-only.
- Grants added per platform rule (authenticated + service_role).

## Realtime

Supabase Realtime channels for `messages`, `confessions`, `reactions`, `group_comments`.

## Server logic (TanStack `createServerFn`)

- `moderateConfession({body})` — calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with structured-output classifier returning `{allowed, reasons[]}`. Server-side only; `LOVABLE_API_KEY` stays on server.
- `openPrivateReplyThread({confessionId})` — creates/returns a `direct` thread between caller and confession author atomically; both stay anonymous.
- `joinGroupByCode({code})`, `createGroup(...)`, `leaveGroup(...)`.
- `submitReport(...)`.

Public auth gate: integration-managed `_authenticated/route.tsx` already handles it.

## Guest auth

Use `supabase.auth.signInAnonymously()`. Guest gets a real `auth.users` row, an anon profile, full feature access except recovery (no email/password attached). Profile flagged `is_guest=true`; profile page shows a "Save your account" CTA that links the anonymous user to an email/password.

## Build order

1. Enable Lovable Cloud + provision `LOVABLE_API_KEY`.
2. Design system: tokens, fonts, Tailwind utilities, glass card primitive, bottom nav shell.
3. Auth page + guest flow + `_authenticated` shell.
4. Migrations: profiles + anon sequence trigger, user_roles, has_role.
5. Confessions table + RLS + Home feed + Post composer + reactions + bookmarks.
6. Reporting + AI moderation server fn wired into composer.
7. Groups (table, create/join, group feed, comments).
8. Chats (threads, participants, messages, realtime, private-reply server fn).
9. Profile page + settings (logout, delete account, notifications toggle stored on profile).
10. Search + Trending.
11. Polish pass: animations, empty states, skeletons, error/not-found boundaries, SEO meta on `/auth` and root.

## Risks / notes

- Real-time push notifications require a service worker + VAPID; out of scope. In-app notifications table only.
- Phone OTP needs a paid SMS provider — not in this MVP.
- Admin moderation UI is deferred; reports are stored and readable by `admin` role via `has_role`.
- This is a multi-iteration build. I'll start with steps 1–4 in the first turn after approval, then continue.

Approve to start, or tell me what to adjust.