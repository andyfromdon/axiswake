# Axis Wake Boats New Zealand

Independent Next.js / TypeScript build using the current Malibu layout and Axis Wake content.

- Source: https://www.axiswake.com/ (checked 10 November 2026).
- Models: A245, A225, A200, T250, T235 and T220; international specifications, NZ availability to be confirmed.
- Hosting target: separate Node.js 24 SiteHost container; GitHub repository https://github.com/andyfromdon/axiswake.
- Live demo: https://axis-demo.don.digital/; validated GitHub Actions deployments from main.
- Public site: https://axisboats.co.nz/. The public and demo domains share the Axis container. After launch sign-off, set the GitHub Actions repository variable `AXIS_INDEXING_ENABLED=true` and deploy `main` to open the canonical public domain to crawlers. The demo and `www` domains retain their crawl hold. The public sitemap is at https://axisboats.co.nz/sitemap.xml.
- The favicon and Apple touch icon use the [official red Axis mark](https://www.axiswake.com/sites/site.axiswake.com/files/Axis-LogoMark-Red.png).
- Set the GitHub Actions repository secret `AXIS_ENQUIRY_TO` and run the existing deployment on `main` to enable direct form delivery. The workflow passes the address to private server configuration and selects the matching form and privacy copy. If the setting is empty, the form prepares an email draft. Switch the recipient by updating that setting and redeploying.
- Stock embeds the live multi-brand dealer boat catalogue from AutoPlay, restricted to recreational boats. Boat enquiries return to this site; photos and details open the dealer listing. An Axis-only filter is not available in the current feed.

## Local development

Use Node.js 24. Run `npm ci`, `npm run dev -- --port 3012`.

## Release checks

`npm run build`, `npm run typecheck`, `npm run prepare:release`, `npm run test:release`, `npm run test:enquiry`, `npm run test:analytics`.

The enquiry tests use local test SMTP only. See docs/source-audit.json for verified sources and assets.
