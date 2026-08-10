"use client";

import { useEffect } from "react";

interface AdBannerProps {
    slot?: string;
    format?: "auto" | "fluid" | "rectangle";
    responsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

export function AdBanner({
    slot,
    format = "auto",
    responsive = true,
    style = { display: "block" },
    className = "",
}: AdBannerProps) {
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    useEffect(() => {
        try {
            // @ts-expect-error window.adsbygoogle global object
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense unit error:", err);
        }
    }, []);

    if (!clientId) return null;

    return (
        <div className={`ad-container my-6 text-center ${className}`}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
}
