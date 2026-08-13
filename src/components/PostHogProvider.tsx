'use client';

import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const PostHogPageView = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        try {
            if (pathname && posthog) {
                let url = window.origin + pathname;
                if (searchParams && searchParams.toString()) {
                    url = url + `?${searchParams.toString()}`;
                }
                posthog.capture('$pageview', { '$current_url': url });
            }
        } catch {
            // Silently ignore pageview capture errors
        }
    }, [pathname, searchParams]);

    return null;
};

const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        try {
            const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_a2zTf2inviVnTyYMJ4i8PleiAlXGpLLMd6BGS14NxLB";
            if (!key) return;

            posthog.init(key, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
                person_profiles: 'identified_only',
                capture_pageview: false,
                disable_session_recording: true,
                on_xhr_error: () => {
                    // Silently ignore network / ad-blocker blocks
                },
            });
        } catch {
            // Silently handle initialization blocks
        }
    }, []);

    return (
        <>
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </>
    );
};

export default PostHogProvider;
