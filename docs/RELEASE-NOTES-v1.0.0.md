# Verselight v1.0.0

Emotion-based Scripture, reflection, and prayer. Live: https://verselight-app.vercel.app

## Features

- Two-step WebGL emotion wheel with an accessible simple-picker fallback.
- Dawn reveal on every verse, Skip, reduced-motion reading and a verse carousel.
- NLT default plus KJV, WEB, ASV and BSB; side-by-side Compare.
- Reference-only saved verses, collections and validated JSON Export and Import.
- Private mood journal, calendar heatmap, local-date streaks with grace days and badges.
- Device-local daily WEB verse and downloadable WEB share cards.
- Responsive dark and light themes, keyboard controls, motion and design polish.

## Security and privacy

Everyone is a guest. Personal records stay in browser storage; no account, server persistence, analytics or tracking. Backups are unencrypted local files. A validated translation cookie is the preference exception. Hosting receives public page URLs and network metadata; Tyndale receives only public passage requests and the server credential.

NLT uses a server-only key, curated inputs, bounded responses, no persistent verse caching and labeled WEB fallback. Generated Scripture cards use WEB only. Security headers and fixed operational warning codes limit exposure. The 2026-10-17 audit recorded zero production dependency findings. See [security evidence](SECURITY.md) and [operations](OPERATIONS.md).

## Known limitations

- NLT quotas and cooldowns are per instance, reset on restart and cannot enforce account-wide limits across deployments.
- Nine high dev-tool package audit findings remain; moving tooling out of production does not patch build/install environments.
- CSP retains inline script/style allowances for static rendering and streaming.
- Browser data can be lost through cleanup, eviction or device loss; export regularly. There is no cross-device sync or app encryption.
- Daily verses repeat a curated 84-passage cycle. NIV remains disabled pending licensed access.
- Optional Step 10 (night sky journal) and Step 11 (additional polish and delight) are not built.

## Credits and licenses

Created by [brentjoel](https://github.com/brentjoel). Built with Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Three.js and Lucide; hosted on Vercel. Lora and Geist typography retain their respective font licenses; bundled Lora includes its OFL notice.

NLT is provided through Tyndale's official API with publisher attribution. Public-domain sources include bible-api.com for KJV, WEB and ASV, and BereanBible.com for BSB. KJV has special UK rights; WEB retains its trademark credit. Full Scripture notices: [licenses](https://verselight-app.vercel.app/licenses). Code is MIT licensed; Scripture and third-party assets retain their own terms. Verselight remains strictly noncommercial.
