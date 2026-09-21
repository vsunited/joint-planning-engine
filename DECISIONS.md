# Architecture & Product Decisions

## 1. Initial Monorepo Scaffold
- **Decision:** Use Turborepo with pnpm workspaces.
- **Rationale:** Supports shared code between Next.js (web) and Expo (mobile) apps while maintaining strict dependency boundaries and fast builds.
- **Outcome (Sep 2026):** The mobile client and the shared `ui` package were never built, and their empty directories have been removed. The monorepo still earns its keep: `shared` holds the doctrinal constants that both the web app and the assistant's prompts are built from.

## 2. Auth Abstraction Layer
- **Decision:** Implement `IAuthService` interface instead of direct CAC PIV federation.
- **Rationale:** Allows rapid prototyping and testing using standard identity providers (Firebase Auth) while retaining a clean interface to swap to DoW CAC / Okta for Government once an executive sponsor is secured.

## 3. UI Theme & Target Audience
- **Decision:** Design for O3-O7 Joint Planners using a "dark tactical" theme with Joint Purple accents.
- **Rationale:** Matches user expectations for military software while providing a clean, non-fatiguing experience during long planning sessions.

## 4. Protected Environment & Google SSO Whitelist
- **Decision:** Use Google SSO via Firebase Auth but strictly whitelist access to specific email addresses. Bypass authentication entirely when running in the local development environment (`NODE_ENV === 'development'`).
- **Rationale:** Prevents unauthorized public access to the live production deployment while allowing rapid, friction-free local development. Allows us to test the `IAuthService` abstraction in a secure way before integrating full CAC PIV federation.
