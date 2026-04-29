# One Ticket Rule

Codex must only work on one ticket at a time.

Codex must not proceed to the next ticket unless explicitly prompted.

Codex must not mark unrelated tickets complete.

Codex must run checks before handing off.

Codex must stop after the current ticket and report files changed, commands run, and risks.

## Operating Notes

- Treat files in `docs/codex-board/queue/` as future work unless the user explicitly names the ticket to run.
- Keep future tickets at `Status: Ready` until that ticket is actively completed.
- Do not bundle future ticket implementation into setup, polish, refactor, or cleanup work.
- Preserve the privacy rule on every ticket: income remains client-side only and is not stored in browser storage, cookies, a database, analytics, or server logs.
