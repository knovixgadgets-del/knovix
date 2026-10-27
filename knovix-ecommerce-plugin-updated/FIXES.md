# Knovix – fixes in this version
See the chat summary for the full list. Items needing your decision:
- UPI / Card at checkout: no online payment step exists in the frontend. Confirm the backend handles it, or remove those options.
- Newsletter strip hidden (homeContent.js -> homeShow.newsletter) until a subscribe endpoint exists.
- Blog posts are placeholders; policy pages are drafts needing review (Privacy/Terms by a lawyer).
- Footer social links point to facebook.com / instagram.com generically; put your real page URLs.
- "24/7 support" vs Contact page hours (10–8) contradict each other.
- Flash-sale countdown resets daily (fake urgency); consider removing.
- Verify VITE_API_BASE_URL (.env) is the permanent WordPress URL: <url>/wp-json/knovix/v1/health
