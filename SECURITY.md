# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer or use [GitHub's private vulnerability reporting](https://github.com/amitrok1/remix-of-github-adoption-insights/security/advisories/new)
3. Include steps to reproduce and any relevant details

We will respond within 7 days and work with you to address the issue.

## Scope

This project processes GitHub Copilot usage metrics (NDJSON files) entirely in the browser. The optional AI chat feature sends aggregated, non-identifying summary data to the Google Gemini API during local development only.

### What to report

- Secrets or credentials accidentally committed
- XSS, injection, or data exfiltration vectors
- Dependencies with known CVEs
- Privacy violations (unexpected data transmission)

### Out of scope

- Issues in third-party dependencies that have already been reported upstream
- Social engineering attacks
- Denial of service against local dev servers
