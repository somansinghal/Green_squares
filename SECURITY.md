# Security Policy

The security of **GitHub Green Squares — Developer Contribution Analytics** and the protection of user data and credentials is of paramount importance.

---

## 🛡️ Supported Versions

Only the latest release receives active security patches.

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

---

## 🔒 Security Architecture & Guarantees

### 1. Protection of Secrets
- **Never commit `.env` files**: All environment configuration containing `GITHUB_CLIENT_SECRET` must remain local or in Vercel project environment settings. `.env` and `.env.*` are excluded via `.gitignore`.
- **Zero Frontend Secret Exposure**: The client secret is strictly stored server-side. No frontend JavaScript, HTML, CSS, or client-side storage mechanism ever receives the client secret.

### 2. OAuth & CSRF Protection
- **Cryptographic State Parameter**: All OAuth authorizations generate a 48-character cryptographic random state (`crypto.randomBytes(24).toString('hex')`) stored in an `HttpOnly`, `SameSite=Lax` cookie and verified strictly on callback.
- **Secure Token Cookies**: Access tokens obtained during server-side authorization exchanges are stored exclusively in HTTP-only cookies (`gh_session`). Browser scripts cannot access these cookies.

### 3. Minimum Scope Principle
- Authentication requests use the minimum required scope: `read:user`.
- Broad repository read/write access (`repo` scope) is strictly avoided.

### 4. Input Sanitization & Content Security
- All incoming JSON datasets and user inputs in forms (activity modals, imports) are validated against strict schemas and sanitized to prevent Cross-Site Scripting (XSS).
- External links use `rel="noopener noreferrer"` and `target="_blank"`.

### 5. API Rate Limiting & Health Monitoring
- Safe public endpoints (`/api/health`, `/api/github/health`) provide connectivity indicators without disclosing internal keys or system tokens.

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability in this project, please follow responsible disclosure:

1. **Do not create a public GitHub issue.**
2. Send a detailed report directly to the repository maintainer through GitHub Security Advisories at [https://github.com/somansinghal/Green_squares/security/advisories/new](https://github.com/somansinghal/Green_squares/security/advisories/new).
3. Include:
   - A clear description of the vulnerability.
   - Steps to reproduce or proof-of-concept.
   - Potential impact.
4. You will receive an initial response within 48 hours, and a remediation timeline will be coordinated.
