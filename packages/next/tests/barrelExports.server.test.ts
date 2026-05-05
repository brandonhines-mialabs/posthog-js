/**
 * @jest-environment node
 *
 * Smoke tests for the per-runtime barrels resolved when running outside
 * a browser bundle: the `default` (Node server) and `edge`/`edge-light`/
 * `worker` (Edge runtime) exports conditions, plus `react-server`. The
 * default barrels are the superset; the edge barrels deliberately omit
 * Node-server-only symbols so that bundles targeting the Edge runtime
 * don't transitively pull in `posthog-node`.
 */

jest.mock('server-only', () => ({}))
jest.mock('next/router.js', () => ({ useRouter: jest.fn() }))
jest.mock('next/navigation.js', () => ({
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
}))
jest.mock('next/headers.js', () => ({
    cookies: jest.fn(),
    headers: jest.fn(),
}))
jest.mock('next/server.js', () => ({
    NextResponse: { next: jest.fn(), rewrite: jest.fn() },
}))
jest.mock('@posthog/react', () => ({
    PostHogContext: { Provider: ({ children }: { children: unknown }) => children },
    usePostHog: jest.fn(),
    useFeatureFlagResult: jest.fn(),
    useActiveFeatureFlags: jest.fn(),
    PostHogFeature: jest.fn(() => null),
}))
jest.mock('posthog-js', () => ({ __esModule: true, default: { __loaded: false, init: jest.fn() } }))
jest.mock('posthog-node', () => ({ PostHog: jest.fn() }))

import * as pagesNode from '../src/pages'
import * as pagesEdge from '../src/pages.edge'
import * as indexNode from '../src/index'
import * as indexEdge from '../src/index.edge'
import * as indexReactServer from '../src/index.react-server'

const asRecord = (mod: unknown) => mod as Record<string, unknown>

describe('server barrels (default / edge / react-server exports conditions)', () => {
    describe("@posthog/next/pages → 'default' / 'react-server' → pages", () => {
        it('exposes the full Pages Router surface', () => {
            expect(typeof pagesNode.PostHogProvider).toBe('function')
            expect(typeof pagesNode.PostHogPageView).toBe('function')
            expect(typeof pagesNode.getServerSidePostHog).toBe('function')
            expect(typeof pagesNode.getPostHog).toBe('function')
            expect(typeof pagesNode.postHogMiddleware).toBe('function')
            expect(typeof pagesNode.DEFAULT_INGEST_PATH).toBe('string')
        })
    })

    describe("@posthog/next/pages → 'edge' → pages.edge", () => {
        it('exposes the documented edge-safe surface', () => {
            expect(typeof pagesEdge.postHogMiddleware).toBe('function')
            expect(typeof pagesEdge.PostHogPageView).toBe('function')
            expect(typeof pagesEdge.DEFAULT_INGEST_PATH).toBe('string')
        })

        it('omits Node-server-only symbols that pull in posthog-node', () => {
            const m = asRecord(pagesEdge)
            expect(m.getServerSidePostHog).toBeUndefined()
            expect(m.getPostHog).toBeUndefined()
            // The Pages Router PostHogProvider belongs only in the client / default
            // barrels — middleware files cannot render React.
            expect(m.PostHogProvider).toBeUndefined()
        })
    })

    describe("@posthog/next → 'default' → index", () => {
        it('exposes the full App Router surface', () => {
            expect(typeof indexNode.PostHogProvider).toBe('function')
            expect(typeof indexNode.PostHogPageView).toBe('function')
            expect(typeof indexNode.getPostHog).toBe('function')
            expect(typeof indexNode.postHogMiddleware).toBe('function')
            expect(typeof indexNode.DEFAULT_INGEST_PATH).toBe('string')
        })
    })

    describe("@posthog/next → 'edge' → index.edge", () => {
        it('exposes the documented edge-safe surface', () => {
            expect(typeof indexEdge.postHogMiddleware).toBe('function')
            expect(typeof indexEdge.PostHogPageView).toBe('function')
            expect(typeof indexEdge.DEFAULT_INGEST_PATH).toBe('string')
        })

        it('omits Node-server-only symbols', () => {
            const m = asRecord(indexEdge)
            expect(m.PostHogProvider).toBeUndefined()
            expect(m.getPostHog).toBeUndefined()
        })
    })

    describe("@posthog/next → 'react-server' → index.react-server", () => {
        it('exposes the App Router server component plus the client-safe re-exports', () => {
            expect(typeof indexReactServer.PostHogProvider).toBe('function')
            expect(typeof indexReactServer.PostHogPageView).toBe('function')
            expect(typeof indexReactServer.usePostHog).toBe('function')
            expect(typeof indexReactServer.useFeatureFlag).toBe('function')
            expect(typeof indexReactServer.useActiveFeatureFlags).toBe('function')
            expect(typeof indexReactServer.PostHogFeature).toBe('function')
        })
    })
})
