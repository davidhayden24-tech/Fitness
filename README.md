# AdaptFit

A no-equipment, home-workout app for beginners. The wedge against incumbents
like "Home Workout - No Equipment": the plan actually adapts to the user -
flag an injury or give a thumbs-down and the app permanently reroutes around
it, in every future session, using a deterministic rules engine (not an LLM
guessing a new workout).

> "The home workout app that actually listens when something hurts."

## Monorepo layout

```
apps/
  backend/   Node + Express + Prisma (Postgres) + Claude API coach
  mobile/    Expo (React Native) app
packages/
  shared/    Types, enums, and Zod schemas shared by both apps
```

## Why this build order

Per the project spec, the deterministic substitution engine was built and
fully unit-tested (`apps/backend/tests/`) *before* any LLM code was written.
The conversational coach only calls into that tested engine via tool-calling
- it never invents a substitution itself. See `apps/backend/src/engine/` for
the rules engine and `apps/backend/src/coach/` for the LLM layer.

## Backend setup

```bash
cd apps/backend
cp .env.example .env   # fill in DATABASE_URL, ANTHROPIC_API_KEY, and both CLERK_* keys
npm install             # (or run `npm install` from the repo root)
npx prisma migrate dev  # creates the schema
npm run seed             # seeds ~90 tagged bodyweight exercises
npm run dev               # starts the API on :4000
npm test                    # runs the substitution-engine + plan-generator unit tests
```

`ANTHROPIC_API_KEY` is only needed for `/api/coach/checkin` (the paid
conversational layer) - onboarding, plan generation, and adaptation all work
without it. `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are **not**
optional, though - `clerkMiddleware()` is mounted globally and throws on
every request, including public ones, if either is missing or malformed.
Get both from a free [Clerk](https://clerk.com) project's dashboard.

## Mobile setup

```bash
cd apps/mobile
cp .env.example .env   # EXPO_PUBLIC_API_URL and EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
npm install
npm run web    # or `npm start` for the Expo Go / simulator flow
```

`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is the *same* publishable key as the
backend's `CLERK_PUBLISHABLE_KEY` (it's meant to be public - that's what
"publishable" means; only `CLERK_SECRET_KEY` must stay server-side). Both
must point at the same Clerk project or tokens issued to the app won't
verify against the backend.

### Auth flow

Real auth is wired up with [Clerk](https://clerk.com) (email + password):
`apps/mobile/src/screens/AuthScreen.tsx` handles sign-up (with email
verification) and sign-in, `apps/backend/src/auth/requireUserId.ts` verifies
the session token on every protected route via `@clerk/express`, and the
backend derives the user from that verified token - **never** from a
client-supplied id. Every route that used to accept a `userId` in the body
or URL (feedback, logs, coach, progress, plans) now infers it from the
`Authorization: Bearer <token>` header instead, closing what would otherwise
be a "pass anyone's id and act as them" hole. `/api/coach/checkin` also
double-checks `subscriptionStatus === "active"` server-side - the mobile
paywall screen is just UX, not the actual enforcement.

This was built and typechecked against Clerk's real SDK types, and the
unauthenticated-request rejection (401) and public-route pass-through were
verified against a running server. The interactive sign-up/sign-in flow
itself needs a real Clerk project's publishable key to test end-to-end -
it wasn't available in the sandbox this was built in.

## Deploying the backend

`apps/backend/Dockerfile` builds a production image from the monorepo root
(it needs `packages/shared` alongside `apps/backend` to resolve the npm
workspace, so the build context is the repo root, not `apps/backend/`):

```bash
docker build -f apps/backend/Dockerfile -t adaptfit-backend .
```

On container start it runs `prisma migrate deploy` (applies migrations, does
*not* touch data) and then starts the server. Seeding is deliberately not
part of the boot path - run it once after your first deploy:

```bash
DATABASE_URL="<your production connection string>" npm run seed --workspace=@adaptfit/backend
```

`render.yaml` at the repo root is a ready-to-use [Render](https://render.com)
Blueprint that provisions a managed Postgres instance and a web service from
that Dockerfile in one step:

1. Push this repo to GitHub.
2. In the Render dashboard: **New +** -> **Blueprint** -> point it at the repo.
3. Render will ask you to set `ANTHROPIC_API_KEY` (marked `sync: false` in the
   blueprint so it's never committed) - paste it in there.
4. After the first successful deploy, run the seed command above against the
   `DATABASE_URL` Render shows you on the `adaptfit-db` database's page.

Render was picked over Railway/Fly.io only because one `render.yaml` declares
the DB and the web service together - `apps/backend/Dockerfile` is plain
Docker, so it runs unmodified on any of those instead if you'd rather use
one of them.

Once deployed, take the backend's public URL (e.g.
`https://adaptfit-backend.onrender.com`) and use it for
`EXPO_PUBLIC_API_URL` in `apps/mobile/.env` and in
`apps/mobile/eas.json` -> `build.base.env.EXPO_PUBLIC_API_URL`.

## Building for the App Store / Play Store (EAS)

`apps/mobile/eas.json` defines three build profiles - `development` (dev-client
build for local native debugging), `preview` (internal `.apk`/ad-hoc build for
handing to testers without going through a store), and `production` (what you
submit to the stores, with EAS auto-incrementing the build number remotely).

Before your first build:

1. `npm install -g eas-cli` (or use `npx eas-cli`), then `eas login`.
2. **Replace the placeholders** - these were left as placeholders on purpose,
   not real values:
   - `apps/mobile/app.json` -> `ios.bundleIdentifier` and `android.package`
     are set to `com.adaptfit.app`. Change these to an identifier you
     actually own; both platforms treat this as a permanent, globally-unique
     ID you cannot change after your first submission.
   - `apps/mobile/app.json` -> `extra.eas.projectId` is a placeholder. Run
     `eas init` from `apps/mobile` to create the real EAS project and have it
     filled in automatically.
   - `apps/mobile/eas.json` -> `build.base.env.EXPO_PUBLIC_API_URL` points at
     `https://api.adaptfit.example.com`, a placeholder domain. Point it at
     your real deployed backend before building `preview`/`production`.
3. `npx expo install expo-dev-client` is already a dependency; run
   `npm run build:dev` once to get a native dev-client build for your device/simulator.
4. `npm run build:preview` produces an installable build for testers (no
   store account needed to distribute this one).
5. `npm run build:prod` produces the store-ready build; `npm run submit:ios`
   / `npm run submit:android` upload it. Submit needs your Apple/Google
   credentials - `eas submit` will prompt for them interactively the first
   time (Apple ID + app-specific password or API key; a Google Play service
   account JSON), and EAS stores them for reuse after that.

You'll still need an Apple Developer Program membership ($99/yr) and a
Google Play Console account ($25 one-time) before step 5 will succeed.

## What's stubbed / needs your input

- **Exercise content**: the seed library (`apps/backend/src/data/exercises.ts`)
  uses original, generic descriptions of standard bodyweight movements - no
  copyrighted third-party content. `videoAssetRef` is `null` for every
  exercise; you'll need to supply real video/animation assets and a CDN/asset
  pipeline before this ships. In the meantime, the session player shows a
  generated placeholder: `apps/mobile/src/animations/` has a small 2D
  stick-figure rig (`pose.ts`) and ~20 hand-checked movement-pattern
  animations (`patterns.ts`) - squat, pushup, plank, jumping jack, etc. -
  mapped onto all 89 exercises via their `substituteGroupId`
  (`exercisePatternMap.ts`), rendered with `react-native-svg` +
  `Animated` in `ExerciseAnimation.tsx`. This is a real generated placeholder,
  not a stand-in for actual video: I can't (and, for a fitness app, shouldn't)
  synthesize photorealistic video of correct exercise form - bad AI-generated
  form demonstration would undercut the app's actual safety pitch. Real
  video/licensed footage or a professionally shot library is still a
  to-do before launch.
- **Muscle-group / contraindication tags**: a reasonable first pass for MVP
  purposes. Have someone with exercise-science/PT background review them
  before this substitutes for real injury-safe programming.
- **Pricing**: no real payment integration. The mobile Coach screen gates on
  `user.subscriptionStatus === "active"` and shows a placeholder upsell -
  actual prices and a payment provider (RevenueCat, Stripe, etc.) are still
  open decisions.
- **Privacy policy**: a draft is at `docs/privacy-policy.md`, matched to what
  the app actually collects today. It has bracketed placeholders (company
  name, support email, retention window) and needs a lawyer's review before
  you link to it from the App Store, Play Store, or the app itself - both
  stores require a live privacy policy URL to accept a submission.
- **Camera-based form feedback**: explicitly deferred to Phase 2 per the spec;
  no pose-estimation architecture has been stubbed yet.
- **Brand/visual design**: functional dark theme in `apps/mobile/src/theme.ts`,
  not a designed brand identity.

## Proof the adaptation actually works

`apps/backend/tests/planGenerator.test.ts` has an end-to-end test that:
generates a week's plan, flags a knee injury, and asserts that *every*
subsequent week's plan is free of knee-contraindicated exercises - proving
the reroute is permanent, not a one-day skip. Run `npm test` in
`apps/backend` to see all 18 passing tests.
