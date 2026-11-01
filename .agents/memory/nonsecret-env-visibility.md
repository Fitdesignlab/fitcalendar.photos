---
name: Non-secret environment visibility
description: Shared non-secret configuration is committed to the public source repository.
---

Replit's shared non-secret environment settings are persisted in the tracked `.replit` file. They are not a private place to store a person's email address.

**Why:** This project pushes its source to a public GitHub repository. Keeping identity configuration in a server environment variable does not by itself keep the configured value out of that repository.

**How to apply:** Review configuration diffs before pushing. Keep credentials in Secrets. For an exact verified-email allowlist, use its normalized email hash rather than placing the plaintext address in non-secret configuration. A hash avoids publishing the literal address; it is not an authentication credential or a guarantee of anonymity.
