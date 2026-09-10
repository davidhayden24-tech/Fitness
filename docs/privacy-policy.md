> **DRAFT - NOT LEGAL ADVICE.** This is a starting point written to match
> what the AdaptFit codebase actually collects and does today. It has real
> gaps marked `[LIKE THIS]` that need your input, and it has not been
> reviewed by a lawyer. Have one review it - especially the sections on
> health data and children's privacy - before you link to this from the App
> Store, Play Store, or the app itself. Apple and Google both require a live
> privacy policy URL before they'll accept a submission; a payments provider
> (RevenueCat/Stripe/etc.) and analytics provider (PostHog/Amplitude) aren't
> wired into the app yet, so their sections below are written as "if/when
> you add one" rather than asserted as current fact - update them once you
> pick one.

# AdaptFit Privacy Policy

**Effective date:** [DATE]

[COMPANY LEGAL NAME] ("AdaptFit," "we," "us," or "our") operates the AdaptFit
mobile application (the "App"). This policy explains what information we
collect, how we use it, and the choices you have.

## 1. Information We Collect

**Account information.** When you create an account, we collect your email
address.

**Fitness and health-adjacent information.** To generate and adapt your
workout plan, we collect:
- Fitness level and goals you select during onboarding
- Body areas you flag as painful or injured ("flagged injuries")
- Which exercises you've been shown, completed, skipped, or given negative
  feedback on ("this hurt," "too hard," etc.)
- Session history: dates, duration, completed/skipped exercises, and your
  post-session feedback

This is health-adjacent information, not medical data collected by a
healthcare provider. **AdaptFit is not a medical device and does not provide
medical advice** - see Section 7.

**Conversational coach messages.** If you use the check-in coach feature,
the free-text messages you type are sent to our AI service provider
(Anthropic, see Section 3) to be processed and to generate a response. We
also keep a short rolling summary of recurring topics (e.g., "mentioned
knee soreness twice") to make future check-ins more relevant.

**Usage and device information.** [IF/WHEN YOU ADD AN ANALYTICS PROVIDER
LIKE POSTHOG OR AMPLITUDE: describe what it collects here - typically
device type, OS version, app version, crash logs, and in-app events like
screens viewed and buttons tapped.]

**Payment information.** [IF/WHEN YOU ADD A PAYMENT PROVIDER: AdaptFit does
not collect or store payment card details directly - subscription payments
are handled by [PROVIDER, e.g. RevenueCat / Apple / Google Play], who has
their own privacy policy governing that data.]

## 2. How We Use Your Information

- To generate your workout plan and permanently adapt it when you flag pain,
  an injury, or give negative feedback on an exercise
- To power the check-in coach conversation
- To show you your progress (streaks, session history, and a record of how
  the app has adapted for you)
- To maintain and improve the App, including diagnosing bugs
- To communicate with you about your account or the service

We do not use your flagged injuries or health-adjacent information for
advertising, and we do not sell your personal information.

## 3. Third Parties We Share Information With

We share information only with service providers who need it to operate the
App, under contracts that limit their use of it to providing services to us:

- **Anthropic** (the maker of Claude) processes the text you send to the
  check-in coach in order to generate a response. See
  [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy) for
  how they handle that data.
- **[DATABASE/HOSTING PROVIDER, e.g. Render, Supabase, Neon]** stores your
  account and fitness data on our behalf.
- [IF/WHEN ADDED: **PostHog/Amplitude** for product analytics.]
- [IF/WHEN ADDED: **RevenueCat/Stripe/Apple/Google** for subscription billing.]

We do not otherwise share your personal information with third parties,
except: to comply with law, to protect the rights and safety of AdaptFit or
others, or in connection with a merger, acquisition, or sale of assets (in
which case you'll be notified).

## 4. Data Retention and Deletion

We retain your account and fitness data for as long as your account is
active, so the app can keep adapting to your history. You can request
deletion of your account and associated data by contacting us at
[SUPPORT EMAIL]. We will delete your data within [X] days, except where we
are required to retain it by law.

## 5. Your Rights

Depending on where you live, you may have the right to access, correct,
export, or delete your personal information, and to object to or restrict
certain processing. To exercise these rights, contact us at [SUPPORT EMAIL].
[IF YOU HAVE EU/UK/CALIFORNIA USERS: add the specific GDPR/UK GDPR/CCPA
disclosures your counsel recommends here - this draft does not include
jurisdiction-specific legal language.]

## 6. Children's Privacy

AdaptFit is not directed to children under 13 (or under 16 in the EEA/UK),
and we do not knowingly collect information from them. If you believe a
child has provided us information, contact us at [SUPPORT EMAIL] and we
will delete it.

## 7. Health Disclaimer

AdaptFit is a fitness app, not a medical device, and the check-in coach and
adaptive substitution feature are not a substitute for professional medical
advice, diagnosis, or treatment. Flagging pain or an injury in the app tells
it to avoid certain exercise categories - it does not mean the app has
evaluated, diagnosed, or treated any medical condition. Always consult a
qualified healthcare provider before starting a new exercise program,
especially if you have an existing injury or medical condition.

## 8. Security

We use reasonable technical and organizational measures to protect your
information. No method of transmission or storage is 100% secure, and we
cannot guarantee absolute security.

## 9. International Data Transfers

[IF YOUR HOSTING/AI PROVIDERS PROCESS DATA OUTSIDE YOUR USERS' COUNTRY: add
a statement here about transfer mechanisms - your counsel should confirm
what's required for your specific provider list and user base.]

## 10. Changes to This Policy

We may update this policy from time to time. If we make material changes,
we'll notify you in the app or by email before they take effect.

## 11. Contact Us

Questions about this policy or your data: [SUPPORT EMAIL]

[COMPANY LEGAL NAME]
[COMPANY ADDRESS, if required in your jurisdiction]
