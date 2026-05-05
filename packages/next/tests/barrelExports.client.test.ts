/**
 * @jest-environment jsdom
 *
 * Smoke tests for the per-runtime barrels resolved by the `browser`
 * exports condition. Asserts that client-only barrels expose the
 * documented client-safe surface and DO NOT re-export anything that
 * pulls in `server-only` or `posthog-node`. If a server-only symbol
 * leaks in here, Next.js's enforcement plugin will reject the client
 * bundle in consumer apps.
 */

jest.mock('next/router.js', () => ({ useRouter: jest.fn() }))
jest.mock('next/navigation.js', () => ({
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
}))
jest.mock('@posthog/react', () => ({
    PostHogContext: { Provider: ({ children }: { children: unknown }) => children },
    usePostHog: jest.fn(),
    useFeatureFlagResult: jest.fn(),
    useActiveFeatureFlags: jest.fn(),
    PostHogFeature: jest.fn(() => null),
}))
jest.mock('posthog-js', () => ({ __esModule: true, default: { __loaded: false, init: jest.fn() } }))

import * as pagesClient from '../src/pages.client'
import * as indexClient from '../src/index.client'

const asRecord = (mod: unknown) => mod as Record<string, unknown>

describe('client barrels (browser exports condition)', () => {
    describe("@posthog/next/pages → 'browser' → pages.client", () => {
        it('exposes the documented client-safe surface', () => {
            expect(typeof pagesClient.PostHogProvider).toBe('function')
            expect(typeof pagesClient.PostHogPageView).toBe('function')
        })

        it('omits server-only and Node-only symbols', () => {
            const m = asRecord(pagesClient)
            expect(m.getServerSidePostHog).toBeUndefined()
            expect(m.getPostHog).toBeUndefined()
            expect(m.postHogMiddleware).toBeUndefined()
            expect(m.DEFAULT_INGEST_PATH).toBeUndefined()
        })
    })

    describe("@posthog/next → 'browser' → index.client", () => {
        it('exposes the documented client-safe surface', () => {
            expect(typeof indexClient.PostHogPageView).toBe('function')
            expect(typeof indexClient.usePostHog).toBe('function')
            expect(typeof indexClient.useFeatureFlag).toBe('function')
            expect(typeof indexClient.useActiveFeatureFlags).toBe('function')
            expect(typeof indexClient.PostHogFeature).toBe('function')
            expect(typeof indexClient.DEFAULT_INGEST_PATH).toBe('string')
        })

        it('omits server-only and the App Router PostHogProvider', () => {
            const m = asRecord(indexClient)
            // PostHogProvider in `./` refers to the App Router server component;
            // the Pages Router PostHogProvider lives in `./pages` only.
            expect(m.PostHogProvider).toBeUndefined()
            expect(m.getPostHog).toBeUndefined()
            expect(m.postHogMiddleware).toBeUndefined()
        })
    })
})
