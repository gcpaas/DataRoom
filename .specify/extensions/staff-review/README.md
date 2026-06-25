# Staff Review Extension for Spec Kit

Staff-engineer-level code review that validates implementation against spec, checks security, performance, and test coverage.

## Installation

```bash
specify extension add staff-review --from https://github.com/arunt14/spec-kit-staff-review/archive/refs/tags/v1.0.0.zip
```

## Usage

```bash
/speckit.staff-review.run [focus area]
```

Run after `/speckit.implement` to get a thorough code review before shipping.

## What It Does

- Performs deep code review from a staff engineer perspective
- Validates implementation against `spec.md` requirements
- Checks for security vulnerabilities, performance regressions, and error handling gaps
- Assesses test coverage relative to acceptance criteria
- Generates structured review report in `FEATURE_DIR/reviews/`
- Assigns severity: 🔴 Blocker, 🟡 Warning, 🟢 Suggestion

## Review Report

Reports are generated at `FEATURE_DIR/reviews/review-{YYYYMMDD-HHMMSS}.md` using `commands/review-template.md`.

## Workflow Position

```
/speckit.implement → /speckit.staff-review.run → /speckit.ship
```

## Hook

This extension hooks into `after_implement` — you'll be prompted to run the review after implementation completes.

## License

MIT
