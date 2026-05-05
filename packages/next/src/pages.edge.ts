// Edge-runtime barrel for the `./pages` subpath. Resolved by Next.js's
// `edge-light`, `edge`, and `worker` exports conditions. Excludes
// `getPostHog`, `getServerSidePostHog`, and `PostHogProvider` which require
// Node.js APIs (via `posthog-node`) that aren't available in the Edge runtime.
export { postHogMiddleware } from './middleware/postHogMiddleware.js'
export { PostHogPageView } from './pages/PostHogPageView.js'
export { DEFAULT_INGEST_PATH } from './shared/constants.js'
export type { PostHogMiddlewareOptions, PostHogProxyOptions } from './middleware/postHogMiddleware.js'
