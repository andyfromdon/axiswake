# Axis build status — 10 November 2026

- Independent Next.js / TypeScript website using the current Malibu template and official Axis content.
- 23 content pages, six international models, two series and official Axis imagery/video.
- Local production build, TypeScript, standalone release, mock SMTP enquiry checks and analytics checks passed.
- GitHub Actions build and release checks passed.
- Desktop/mobile review covered homepage, menu, model search, series keyboard navigation and gallery/lightbox. Mobile menu spacing corrected.
- All 129 official media references responded successfully.
- Live demo: https://axis-demo.don.digital/.
- GitHub Actions deployed successfully to the separate SiteHost container; HTTPS, deployed revision and noindex checks passed.
- Axis-only deployment access is configured with read-only configuration, encrypted GitHub Actions secrets and a pinned SSH host fingerprint.
- Demo remains excluded from search.

## Deployment

Pushes to main run the production build, release and integration checks before deploying. The workflow verifies the application revision and noindex response after restarting the Axis demo. Production launch and direct enquiry delivery remain separate decisions.

## Content and integrations

- International specifications are labelled. Confirm NZ model availability and order configuration with the dealer.
- No US financing, pricing or warranty promises.
- Enquiries prepare an email draft for the visitor to review and send. Direct server email is disabled until configured.
- Stock links to the dealer's multi-brand catalogue; Axis-only inventory filtering is a later integration check.
