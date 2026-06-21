# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a vulnerability

If you discover a security vulnerability in PixelMart, please report it responsibly.

**Do not** open a public GitHub issue for security-sensitive findings.

Instead, email the maintainer with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

**Contact:** [ashwani-labs](https://github.com/ashwani-labs) via GitHub (open a private security advisory on this repository if you have access, or contact the repo owner directly).

We aim to acknowledge reports within **72 hours** and will work with you on a fix and coordinated disclosure timeline.

## Security notes for deployers

- Change all default demo credentials (`admin@pixelmart.local`, `customer@pixelmart.local`) before any public deployment.
- Set a strong, unique `JWT_SECRET` (256+ bits) in production — do not rely on local dev defaults.
- Keep `.env` out of version control; rotate secrets if accidentally exposed.
- Restrict database network access (see [DEPLOYMENT-CHECKLIST.md](pixelmart-setup/DEPLOYMENT-CHECKLIST.md)).
- Use HTTPS in production (required for secure refresh-token cookies).

## Scope

In scope: authentication, authorization, injection flaws, sensitive data exposure, and misconfigurations in PixelMart services and the React frontend.

Out of scope: third-party services (Render, Vercel, TiDB Cloud, AWS) unless the issue is caused by PixelMart configuration documented in this repo.
