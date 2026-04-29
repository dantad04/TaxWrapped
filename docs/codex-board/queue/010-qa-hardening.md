# Ticket 010: QA Hardening

Status: Ready

## Goal

Harden the app for release readiness after the core product flow and content are complete.

## Allowed Scope

- Review validation, accessibility, responsive behavior, and privacy guarantees.
- Add missing tests for core user paths and edge cases.
- Fix defects found during QA.
- Update docs only where behavior has changed.

## Non-goals

- Do not add new product features.
- Do not change methodology or source assumptions without a separate approved fix.
- Do not add analytics, cookies, persistence, or income storage.
- Do not start unrelated roadmap work.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

Core pages and the wrapped flow pass mobile and desktop smoke checks with no overlapping text, broken controls, or unreadable chart labels.

## Handoff Requirements

Report files changed, defects fixed, commands run, validation result, residual risks, and release blockers. Stop after this ticket.
