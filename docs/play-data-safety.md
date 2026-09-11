> **DRAFT - fill out the real form yourself, using this as a reference.**
> This maps what AdaptFit's code actually collects to Google Play Console's
> Data Safety category names as of when this was written. Play's form
> wording changes over time and getting this wrong (or leaving out a
> category) is a policy violation that can get an app rejected or removed -
> don't paste this in blind. Cross-check every row against the live form
> before submitting, and get a second read from whoever owns Play Console
> compliance if this is going out to real users.
>
> This also only covers what the *app's own backend* does. `docs/privacy-policy.md`
> has the full picture including third-party processors (Anthropic, your
> hosting provider, Clerk).

## Data types AdaptFit collects

| Play category | What we actually collect | Collected? | Shared with 3rd party? | Purpose | Optional? |
|---|---|---|---|---|---|
| **Personal info > Email address** | Account email (via Clerk) | Yes | Yes - Clerk (auth provider), see note below | Account management, App functionality | Required (can't use the app without an account) |
| **Health and fitness > Health info** | Flagged injuries/pain areas (`knee`, `lower_back`, `shoulder`, etc.), exercise-level pain/too-hard feedback | Yes | Yes - Anthropic, only when the user uses the check-in coach (see note) | App functionality (this is the core adaptation feature) | Optional - a user can complete onboarding with zero flagged injuries, and never use the coach |
| **App activity > App interactions** | Session logs: completed/skipped exercises, sets/reps/duration, per-session feedback (`good`/`too_easy`/`too_hard`) | Yes | No | App functionality (progress tracking, plan adaptation) | Required for the core feature to work, but no individual log entry is required |
| **App activity > Other user-generated content** | Free-text messages typed to the check-in coach | Yes | Yes - Anthropic (processes the message to generate a response) | App functionality | Optional - the coach is an opt-in paid feature |
| **App info and performance > Crash logs / Diagnostics** | None currently - no analytics/crash-reporting SDK is wired in yet | No (today) | No | - | - |

## Notes for filling out the real form

- **"Shared with third party" for email (Clerk) and coach messages (Anthropic)**: Play's definition of "sharing" specifically covers transferring data to a party outside your app for *that party's own purposes* - processing done strictly *on your behalf* under a data processing agreement is usually declared differently (sometimes not "sharing" at all, depending on Play's current wording). Both Clerk and Anthropic act as processors for AdaptFit, not independent users of the data. Read Play's current definition carefully before deciding which checkbox this is - this is exactly the kind of distinction that changes between Play Console policy revisions.
- **Health info is the one to get right.** Play applies extra scrutiny to apps that collect health-adjacent data. Since `flaggedInjuries` and pain feedback are self-reported preferences (not device sensor data, not diagnosed conditions), they should be declared as "Health info" under the app's own functionality - not under any medical/clinical category. Section 7 of `docs/privacy-policy.md` (the health disclaimer) should stay consistent with however this is declared.
- **Encryption in transit**: true today - all API traffic runs over HTTPS once deployed (Render terminates TLS by default; Clerk and Anthropic are HTTPS-only). Answer "yes" to the encryption-in-transit question.
- **Data deletion**: the privacy policy draft says users can request deletion by emailing support - there's **no self-service in-app "delete my account" flow yet**. Play's form has a yes/no for "you provide a way for users to request data deletion" - an email-based process can satisfy this, but if Play's current policy expects an in-app path for accounts created via in-app sign-up, that's a gap worth closing before launch, not just before this form.
- **Data retention**: matches whatever you fill in for retention window in `docs/privacy-policy.md` - keep the two consistent.

## What to check in Play Console at submission time

1. Confirm the current category list and definitions haven't changed from what's mapped above (Play Console -> App content -> Data safety).
2. Fill in your actual support email and privacy policy URL once hosted.
3. If you add analytics (PostHog/Amplitude) or a payment SDK before launch, add rows for those - they weren't in the app when this was written.
