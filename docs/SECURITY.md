# Security, cost, privacy and licensing audit

Reviewed 2026-10-17 on `security-audit`, branched from freshly fetched `origin/main` (`a7b64a4`). The owner requested this whole-project audit explicitly, superseding the ordinary next-step/branch-name workflow. Findings were reported in chat before fixes. This is a source, dependency, reachable-history, build and local HTTP review, not a penetration test or verification of the Vercel account.

## Findings and changes

| Finding before changes | Resolution |
| --- | --- |
| No application security headers | Added CSP, nosniff, no-referrer, Permissions-Policy and DENY frame protection globally in `next.config.ts`; removed X-Powered-By. |
| Provider helper trusted its caller's curated-reference check | Added its own exact `data/emotions.json` allowlist before format validation, quota reservation or network access; added a rejection regression test. No arbitrary-passage HTTP endpoint exists. |
| Every valid share request rendered a PNG | Cache completed WEB image bytes by canonical reference with `use cache`/`cacheLife("max")`; successful public responses allow one day browser caching and 30 days shared caching, with one day stale-while-revalidate. Invalid/error responses remain no-store. Downloads now permit normal HTTP cache use. |
| Social image routes were dynamic due to font filesystem I/O | Cache only the public OFL font bytes; build now prerenders Open Graph and Twitter images, with 30-day revalidation and one-year expiry. They contain branding only. |
| Unused default image optimizer was available | Set `images.unoptimized: true`; the app has no `next/image` consumers. Existing PNG/SVG assets, WEB cards and WebGL are unaffected. |
| Seven high production dependency findings through shadcn tooling | Move shadcn to devDependencies because only its CSS is consumed at build time. Remove the unused Button scaffold and its unused `@base-ui/react` and `class-variance-authority` dependencies. Production audit now has zero findings; tooling risks remain below. |
| Compatible maintenance releases available | Next and eslint-config-next 16.4.0 to 16.4.2; React/react-dom 19.3.0 to 19.3.1; shadcn 4.21.5 to 4.22.0. No major upgrades, forced audit fix, new dependencies or paid services. Framework pins remain exact. |

## Secrets and history

- The only application read of `NLT_API_KEY` is in `lib/verse-passage.ts`, behind `import "server-only"`. Clients never import the provider at runtime; PassageAttribution uses a type-only import. `lib/bible-api.ts` itself accepts an injected key for testing and does not read environment variables. No NEXT_PUBLIC secret variable, secret serialization, raw error logging or client credential fetch was found.
- The provider key is necessarily in Tyndale's server-to-server HTTPS query string, per its API. Redirects are rejected. Provider exceptions are replaced with fixed messages without causes. Operational monitoring accepts only two fixed codes, throttled once per minute per instance; error screens never print errors or stacks.
- `.env.local` is ignored (`git check-ignore` verified); `.env.example` now has empty NLT and site-origin values. Its previous real preview origin was public, not a credential, but was removed to keep the template deployment-neutral. No environment credential file is tracked.
- Scanned all 574 reachable objects (333 file blobs) across local and remote refs in this non-shallow clone. No occurrence of the current local key, nonempty NLT environment assignment, tracked credential environment file or public NLT-key assignment was found. Two initial multiline-regex alerts were checked using line-based parsing and were empty historical example assignments. Secret values were never printed. The final scan of all 34 generated browser assets found no local key, NLT_API_KEY name or provider endpoint, without printing the key.
- A clean scan cannot prove that a different historic key never appeared in an unrecognized form, deleted remote ref, inaccessible fork, log or previous deployment. Hosting access and outgoing-fetch tracing must be checked separately; do not capture credential-bearing fetch URLs.

## NLT requests, inputs and errors

There is no standalone `/api/nlt` route. Results validate a known parent/feeling route and compare accepts only a known local reference and two to four deduplicated active translations. The server service checks known WEB references; data validation and the audit confirm these match the 84 curated references. The provider now independently checks emotions.json, then validates chapter/verse format, ascending range and at most 50 verses. The upstream host/path/version are fixed. Caller input cannot select a host or arbitrary passage.

Per-instance guards reserve attempts synchronously before network work: 20 per rolling minute, 500 per rolling day for TEST, 5,000 for registered keys. Failures count. 429/503 enforce Retry-After with a 60-second minimum/default; 401/403 block that instance for a day. An eight-second AbortSignal bounds the real fetch and body stream; bodies are capped at 200,000 bytes. No retry loop. Parsing requires the matching reference header and exact verse numbers; it extracts text and discards notes/scripts/styles instead of inserting remote HTML. Failures display local WEB with its actual translation and an explicit fallback note.

**Accepted remaining limitation:** instance-local quotas reset on restart and do not coordinate across instances/deployments. They cannot enforce an account-wide quota or stop distributed request amplification. The owner previously declined a shared quota service. Four result passages mean at most four upstream attempts per result render; compare can request NLT at most once. Tyndale quotas remain authoritative. No claim of zero hosting cost or DDoS immunity is made.

Journal notes and collection names use React text/value bindings. No eval, remote HTML injection or user-controlled script insertion was found. There is exactly one `dangerouslySetInnerHTML`: the fixed, repository-authored pre-paint theme script in `app/layout.tsx`. It interpolates a local function, not visitor, cookie, environment or API text. It is retained to preserve pre-paint theme behavior; a literal claim that this API is absent would be false.

Import checks `File.size` before reading and UTF-8 size again during JSON parsing (5 MiB). Schema validation checks exact keys, types, active translations, curated references, UUIDs, dates, maximum list lengths (10,000), 80-character collection names, 2,000-character notes, uniqueness and relationships. Prototype-related keys and unexpected Scripture fields are rejected. Streak totals are recomputed. Export validates data and size; backups contain references and metadata, never NLT text. Import confirmation, stale-state protection and failed-write preservation remain tested. Translation cookies resolve only active ids, otherwise NLT; writes use Path=/, one-year Max-Age, SameSite=Lax and Secure on HTTPS. HttpOnly is intentionally unavailable because the browser selector writes this non-sensitive preference.

## Headers and compatibility

CSP permits scripts/styles/assets/fonts/connections from this origin, data/blob images for decorative SVG/download previews, and inline scripts/styles required by React streaming, the fixed theme bootstrap and existing styled/motion components. It blocks remote origins, objects, frames, embedding, base elements and off-origin form submissions. WebGL requires no additional origin or unsafe-eval permission. Development alone permits unsafe-eval and WebSocket connections for debugging/HMR; production does not.

The static-compatible CSP deliberately retains `unsafe-inline` for scripts and styles. It restricts sources but is not a strict script-injection defense. The installed Next documentation says per-request nonces are incompatible with partial prerendering/static shells. Converting every page to dynamic rendering would change architecture and costs, so this audit does not do that. User/API text must continue to render as text. No remote font/image allowlist was needed.

No requested header was omitted. Extra headers/directives intentionally skipped: HSTS/preload and upgrade-insecure-requests until HTTPS/custom-domain behavior is verified by the owner (local HTTP must keep working); obsolete X-XSS-Protection; COEP/COOP because cross-origin isolation is not required and would change popup/window behavior. Permissions-Policy disables camera, microphone, location, payment and USB. CSP frame-ancestors plus X-Frame-Options DENY protect against embedding.

## Dependency audit

Initial `npm.cmd audit --omit=dev --json`: seven high findings, all one root denial-of-service advisory, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Deeply nested brace glob patterns can exhaust the Node stack. No production route consumes globs or runs the CLI.

| Initially flagged package | Why it was flagged |
| --- | --- |
| braces | Vulnerable recursive pattern parser, through 3.0.3; advisory lists no patched version. |
| micromatch | Consumes braces. |
| fast-glob | Consumes micromatch. |
| @shadcn/registry | Consumes fast-glob. |
| @ts-morph/common | Consumes fast-glob. |
| ts-morph | Consumes @ts-morph/common. |
| shadcn | Direct CLI/build dependency consuming the registry, glob and ts-morph chains. |

Final production audit: **zero vulnerabilities**. Full audit still reports **nine high dev-tool package findings**: those seven plus eslint-config-next and @next/eslint-plugin-next through fast-glob. Moving tooling does not patch it: build/install environments still contain it. Do not feed untrusted glob patterns to these tools. npm proposes incompatible downgrades for some paths; no safe root patch exists, so no forced fix/override was used. Recheck upstream releases. No remaining direct dependency is unused: cn/card, lucide icons, Next/React, parse5/provider, three/wheel and tw-animate-css/CSS; dev dependencies support TypeScript, lint, CSS build, types and shadcn CSS. No browser script imports the shadcn CLI.

## Cost and privacy

No paid-only dependency is required. The standard noncommercial NLT integration, static public-domain sources and a personal [Vercel Hobby deployment](https://vercel.com/docs/plans/hobby) can operate within free allowances. Actual account plan, usage caps and issued-key terms were not accessible. Higher traffic can exhaust quotas, and paid plans can incur usage charges. Review [Vercel usage controls](https://vercel.com/docs/pricing/manage-and-optimize-usage) in the dashboard.

Repository-implied Vercel features: Git preview/production builds, static asset/CDN delivery, Next.js partial prerendering and streamed Node server rendering for results/compare, Node route handling for WEB cards, framework cache for public WEB PNG/font bytes, revalidated static social metadata images, the results-path Proxy, environment secrets, domains/TLS and ordinary operational logs. No app database, KV/Redis, Blob storage, cron jobs, queues, auth service, Edge Runtime declaration, Analytics, Speed Insights or image optimization. Actual project/dashboard integrations may differ and need owner verification.

No route has an input-controlled upstream loop or unbounded passage/image render: curated inputs, fixed result counts, bounded source/body sizes and cached public images limit work. Attackers can still consume requests/bandwidth and cold cache work across instances. Query spelling/order can fragment CDN entries, but the render cache uses only the canonical validated reference. No private query fields are accepted or cached. The first request after deployment/cache expiry can still render a card; caching is not a global abuse limiter.

No application browser request to a third party is present: next/font downloads Google fonts at build time and self-hosts them; wheel scripts/assets are local. No tracker, browser error upload, analytics, Speed Insights or service worker is enabled. The intentional **server runtime exception is Tyndale**, which receives a public curated reference and server key, never personal records. External credit links contact their sites only if followed. Vercel preview toolbar/account-level injection is outside repository control and could be blocked by CSP; check the preview settings.

About/privacy accurately describes browser-only records, unencrypted local backups, deletion/eviction, origin separation, local daily selection, public WEB image requests, translation cookie, IP/public-page exposure, Tyndale and hosting logs. It does not promise anonymity or account-wide quotas. No personal record, name, note, backup, activity or badge enters a request, log, cookie or image. Hosting access logs may reveal the public feeling page being read; this limitation is already disclosed.

## Licensing evidence

Official sources rechecked 2026-10-17:

- [NLT API terms](https://api.nlt.to/) say “No more than 500 verses per request”, “No more than 5000 requests per day” and “Non-commercial use” for standard keyed use. Anonymous access is limited to 50 verses/request and 500 requests/day. Issued licenses can differ. These pages grant no explicit cache duration; this app keeps `cache: "no-store"`, disables development HMR fetch caching and waits for a real connection before NLT work. No NLT deduplication/persistent cache was added.
- [Tyndale permissions](https://www.tyndale.com/permissions) requires that “the initials (NLT) must appear at the end of each quotation.” Its artwork guidance requires permission “before permission may be granted”. Verselight conservatively excludes all NLT from generated/downloadable imagery; it does not infer an artwork license from API access or print quotation allowances. The complete mixed-translation notice in `data/translation-notices.json` matches the publisher wording and is displayed beneath each NLT passage and on About/Licenses. The parser retains the NLT marker. No change to the text or notices.
- [WEB](https://ebible.org/engwebp/copyright.htm) is public domain, with the World English Bible trademark identifying unchanged text. Cards preserve wording and show WEB/eBible.org/public-domain credits; daily passages and cards use WEB only. [ASV 1901](https://ebible.org/asv/copyright.htm) is public domain. [BSB](https://berean.bible/licensing.htm) was dedicated to the public domain on April 30, 2023. [KJV](https://ebible.org/eng-kjv/copyright.htm) has UK letters-patent restrictions; the app discloses this instead of claiming worldwide public domain. Source credits match the download script and local files. The bundled Lora font includes its OFL license.

NLT is request/display-only: no licensed text in localStorage, backups, saved records, generated images, committed data or persistent framework caches. WEB image caching is separately allowed by its public-domain status. Social images contain brand copy only. NIV remains disabled and no NIV text/provider was added. No advertising, sales, subscriptions, donations or paid features. Confirm the particular issued-key license in the Tyndale account before launch or usage changes; this audit cannot see that contract.

## Verification and remaining hand checks

- `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build` (including data validation) and `node --test scripts/test-*.mjs`: pass, 57 tests. Provider tests use synthetic fixtures, not live licensed text.
- Production HTTP review: global headers on pages/images/errors, valid/invalid WEB cards, repeated-image byte equality/cache headers, known/invalid comparison and result paths, invalid-cookie WEB fallback, static social image responses and disabled optimizer. The smoke server overrides the key with whitespace, so invalid-cookie testing confirms WEB fallback without contacting Tyndale. Passage responses are private/no-cache/no-store. Both social images match their prerendered .next/server/app/*.body artifacts byte for byte; Next sends public,max-age=0,must-revalidate for these metadata images, so the protection here is static generation rather than a promised browser/CDN freshness period. Repeated WEB cards are byte-identical and have the intended public cache headers. POST returns 405, invalid image inputs return 400/no-store and the unused optimizer returns 404. npm.cmd run dev also served Home with development-only CSP allowances.
- A browser was not connected for this audit. Manually check the Vercel preview in both themes: wheel, result/compare reading and fallback, daily/share download, local notes/collections and Export/Import. Confirm CSP console/network behavior, self-hosted fonts and no injected tracking. This audit does not claim new visual/accessibility measurements.
- In Vercel, verify the branch/commit and Preview/Production secret scopes, disabled Analytics/Speed Insights/injected tracking, HTTPS, usage settings, log retention/access and no credential-bearing upstream tracing. Inspect your issued NLT terms and provider quota. Approve the preview before merge; production deployment is not authorized by this audit.

## If the key leaks

1. Revoke/rotate the key at NLT/Tyndale; contact their support if the portal does not offer rotation. Do not paste the old or new key into issues, chat or logs.
2. Update ignored `.env.local` and the Vercel NLT_API_KEY secret in every affected environment. Remove any public-prefixed copy and inspect build/config exposure.
3. Redeploy affected Vercel environments with the new secret; remove or protect older deployments holding the old key. Confirm the revoked key no longer works and NLT or labeled WEB fallback behaves correctly.
4. Review Tyndale quota activity and hosting/build/log access. Remove leaked copies/logs. If committed, coordinate history cleanup and secret-scanning follow-up; rewriting Git alone cannot revoke a credential.
