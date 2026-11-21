# Flowix fork of Plane

Plane Community (AGPL-3.0) with the Flowix brand. Only branding changes live here, so a new Plane tag can be rebased with few conflicts.

## Branches

- `flowix/base-vX.Y.Z`: the upstream tag `vX.Y.Z`, untouched.
- `flowix/branding`: the Flowix changes on top of the current base. PRs go from here into the base branch.

## What changes

| Area | Files |
|---|---|
| Logos (all apps) | `packages/propel/src/icons/brand/plane-{lockup,logo,wordmark}.tsx` draw the Flowix logo; `flowix-mark.tsx` holds the shared paths |
| Loading spinner | `apps/{web,admin,space}/**/logo-spinner.tsx` |
| Login and sign-up | `apps/web/core/components/account/auth-forms/auth-header.tsx`, `apps/web/core/components/auth-screens/{header,footer}.tsx`, `apps/space/components/account/auth-forms/auth-header.tsx`, `auth.common.new_to_plane` in `packages/i18n/src/locales/*/auth.json` |
| Titles and metadata | `packages/constants/src/metadata.ts`, `apps/{web,admin,space}/app/root.tsx`, `apps/web/app/layout.tsx`, page `meta` titles, `apps/web/core/components/core/page-title.tsx` |
| Favicons, PWA icons, og-image | `apps/{web,admin,space}/app/assets/favicon/*`, `apps/{web,admin,space}/public/favicon/*`, `apps/web/app/assets/icons/*`, `apps/web/public/icons/*`, `apps/web/app/assets/og-image.png`, manifests |
| Image build | `.github/workflows/flowix-images.yml` (GHCR: `flowix-plane-frontend`, `flowix-plane-admin`, `flowix-plane-space`) |

Brand: ink `#01010d`, blue `#1a6eff`, white. The mark is always blue; the wordmark follows the text colour.

Deployment and the update process are documented in the `flowix-vps` repo, `vps-b/apps/flowix-plane/README.md`.
