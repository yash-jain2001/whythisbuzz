'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

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

    return <>{children}</>;
};

export default PostHogProvider;
