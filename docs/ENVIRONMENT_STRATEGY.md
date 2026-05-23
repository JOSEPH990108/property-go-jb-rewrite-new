# Environment Strategy

PropertyGo JB separates local development, staging/UAT, preprod, and production behavior. Environment-specific providers must be selected through validated configuration, not scattered conditionals.

## Environment Purposes

- `local`: developer machines. Mock or local providers are allowed when they reduce cost or avoid external side effects.
- `staging`: UAT and human testing. Real integrations are required where the behavior must match release behavior.
- `preprod`: pre-production source branch and release validation environment. Real integrations are required where applicable.
- `production`: live users and data. Real integrations only.

## Provider Pattern

Application code must call services, not providers directly:

```text
App code -> Service -> Provider interface -> Environment-selected provider
```

The service owns validation, consistent return shapes, logging boundaries, and provider selection. Providers own environment-specific API calls.

## Phone OTP Rule

- Local: console/mock OTP provider only.
- Staging/UAT: real OTP provider with staging/UAT variables.
- Preprod: real OTP provider with preprod variables.
- Production: real OTP provider with production variables.

Application code must call an OTP service. OTP logic must not be duplicated across routes, actions, or components.

## Cloudflare R2 Storage Rule

- Local: local/mock storage provider may be used when needed.
- Staging/UAT, preprod, production: use Cloudflare R2 or the approved real storage provider.
- Public frontend code must not receive storage secrets.
- Upload and file-access policies must be documented by variable name only.

## Secrets and Variables

Documentation may name required environment variables but must never include values. Secrets must not appear in markdown, screenshots, logs, PR descriptions, terminal output, or committed files.

## Readiness Checklist

- Local-only providers cannot be selected outside local development.
- Required non-local variables are validated at startup or provider creation.
- Error messages do not reveal secrets.
- Logs avoid tokens, OTPs, private URLs, and unnecessary PII.
- Integration behavior is documented for local, staging/UAT, preprod, and production.
