'use client';

import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const PostHogPageView = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && posthog) {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', { '$current_url': url });
        }
    }, [pathname, searchParams]);

    return null;
};

const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        posthog.init("phc_a2zTf2inviVnTyYMJ4i8PleiAlXGpLLMd6BGS14NxLB" as string, {
            api_host: "https://us.i.posthog.com",
            person_profiles: 'identified_only',
            // Enable debug mode in development
            loaded: (posthog) => {
                if (process.env.NODE_ENV === 'development') posthog.debug();
            },
        });
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
