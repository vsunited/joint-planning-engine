# Architecture & Product Decisions

## 1. Initial Monorepo Scaffold
- **Decision:** Use Turborepo with pnpm workspaces.
- **Rationale:** Supports shared code between Next.js (web) and Expo (mobile) apps while maintaining strict dependency boundaries and fast builds.

## 2. Auth Abstraction Layer
- **Decision:** Implement `IAuthService` interface instead of direct CAC PIV federation.
- **Rationale:** Allows rapid prototyping and testing using standard identity providers (Firebase Auth) while retaining a clean interface to swap to DoW CAC / Okta for Government once an executive sponsor is secured.

## 3. UI Theme & Target Audience
- **Decision:** Design for O3-O7 Joint Planners using a "dark tactical" theme with Joint Purple accents.
- **Rationale:** Matches user expectations for military software while providing a clean, non-fatiguing experience during long planning sessions.
