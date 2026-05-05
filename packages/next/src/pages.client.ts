// Client-runtime barrel for the `./pages` subpath. Resolved by Next.js's
// `browser` exports condition. Excludes `getPostHog`, `getServerSidePostHog`,
// and `postHogMiddleware`, which import `server-only` or `posthog-node` and
// must not be reachable from a client bundle.
export { PostHogProvider } from './pages/PostHogProvider.js'
export { PostHogPageView } from './pages/PostHogPageView.js'
export type { PagesPostHogProviderProps } from './pages/PostHogProvider.js'
