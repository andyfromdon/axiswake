# Axis Wake Boats New Zealand

Independent Next.js / TypeScript build using the current Malibu layout and Axis Wake content.

- Source: https://www.axiswake.com/ (checked 10 November 2026).
- Models: A245, A225, A200, T250, T235 and T220; international specifications, NZ availability to be confirmed.
- Hosting target: separate Node.js 24 SiteHost container; GitHub repository https://github.com/andyfromdon/axiswake.
- Live demo: https://axis-demo.don.digital/; validated GitHub Actions deployments from main.
- Demo is always noindex. No credentials or runtime customer records belong in Git.
- Current enquiry form prepares an email draft for the visitor to review and send. Direct SMTP delivery requires explicit configuration, enabling both ENQUIRY_ENABLED and NEXT_PUBLIC_ENQUIRY_ENABLED, and updating the privacy copy for private 90-day recovery retention.
- Stock opens the existing multi-brand dealer catalogue; an Axis-only live feed is not yet configured.

## Local development

Use Node.js 24. Run `npm ci`, `npm run dev -- --port 3012`.

## Release checks

`npm run build`, `npm run typecheck`, `npm run prepare:release`, `npm run test:release`, `npm run test:enquiry`, `npm run test:analytics`.

The enquiry tests use local test SMTP only. See docs/source-audit.json for verified sources and assets.
