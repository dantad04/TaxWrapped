# Australian Budget Wrapped

Mobile-first placeholder app for estimating Commonwealth income tax and showing an illustrative proportional allocation across Australian Government spending categories.

This setup slice intentionally does not implement the full wrapped flow, tax engine, allocation engine, charts, sharing, or final methodology content.

## Product Promise

Enter your taxable income. We estimate your Commonwealth income tax and show an illustrative receipt of Australian Government spending.

## Privacy Rule

Income must remain client-side only. Do not store income in localStorage, sessionStorage, cookies, a database, analytics, or server logs.

## Development

```bash
npm run dev
```

## Checks

```bash
npm run validate
npm run test:e2e
git diff --check
```

## Ticket Rule

See `docs/codex-board/ONE_TICKET_RULE.md`. Future tickets live in `docs/codex-board/queue/` and must be handled one at a time.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
