---
name: API code generation compatibility
description: Why generated client options must explicitly target the installed React Query version.
---

Keep the API generator explicitly aligned with React Query 5 rather than relying on dependency auto-detection.

**Why:** Orval can inspect the API-spec package, which does not declare React Query, and silently generate version-4 query option types even though the application uses version 5. Generated request-header helpers also use DOM iterable APIs.

**How to apply:** When changing generator configuration or upgrading it, check generated hook compatibility and the client library's DOM type coverage. Regenerate from the specification, then typecheck shared libraries before the apps. Do not repair generated hook signatures by hand.
