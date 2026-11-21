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
| Portuguese (Portugal) | `packages/i18n/src/locales/pt-PT/*.json` (from pt-BR, reviewed against `en`); registered in `packages/i18n/src/{constants,types}/language.ts`; default via `FALLBACK_LANGUAGE = "pt-PT"` with `fallbackLng: ["pt-PT", "en"]` in `core/instance.ts`; `<html lang="pt-PT">` in `apps/web/app/root.tsx` |
| No Plane promotion | return `null` in `star-us-link.tsx`, `workspace/edition-badge.tsx`, `workspace/upgrade-badge.tsx`, `account/terms-and-conditions.tsx` (web and space), `space/components/common/powered-by.tsx`; help menu `workspace/sidebar/help-section/root.tsx` (shortcuts and version only); active cycles hidden in `workspace-menu-item.tsx` and `extended-sidebar-item.tsx`; billing out of `GROUPED_WORKSPACE_SETTINGS` and the command palette; Pro features filtered in `project/settings/features-list.tsx`; product tour off in `home/root.tsx`; plane.so links removed in `workspace-invitations/page.tsx`, `settings/projects/page.tsx`, `estimates/root.tsx`, `error/prod.tsx`, `space/app/error.tsx`, admin `sidebar-help-section.tsx` |
| Image build | `.github/workflows/flowix-images.yml` (GHCR: `flowix-plane-frontend`, `flowix-plane-admin`, `flowix-plane-space`) |

Brand: ink `#01010d`, blue `#1a6eff`, white. The mark is always blue; the wordmark follows the text colour.

When rebasing, check new upstream keys: `pt-PT` must have the same keys as `en` (missing ones fall back to English). Search for new promotion with `git grep -n "plane.so\|Upgrade\|github.com/makeplane" apps`.

Deployment and the update process are documented in the `flowix-vps` repo, `vps-b/apps/flowix-plane/README.md`.
