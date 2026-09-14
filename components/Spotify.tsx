import React, { useEffect, useRef } from 'react';

const TRACK_ID = '75l9zUSkj3eexkmDdaYHBZ';
const START_AT_SECONDS = 60;

declare global {
    interface Window {
        onSpotifyIframeApiReady?: (IFrameAPI: any) => void;
        SpotifyIframeApi?: any;
    }
}

const Spotify = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // The iFrame API replaces this placeholder with its own iframe
        const placeholder = document.createElement('div');
        container.replaceChildren(placeholder);

        const mount = (IFrameAPI: any) => {
            IFrameAPI.createController(
                placeholder,
                { uri: `spotify:track:${TRACK_ID}`, width: '100%', height: 352 },
                (controller: any) => {
                    // Embeds can't start mid-track on their own, so jump to 1:00 on first play
                    let seeked = false;
                    controller.addListener('playback_update', (e: any) => {
                        if (!seeked && !e.data.isPaused && e.data.position < START_AT_SECONDS * 1000) {
                            seeked = true;
                            controller.seek(START_AT_SECONDS);
                        }
                    });
                }
            );
        };

        // Plain embed if the API script can't load
        const fallback = () => {
            container.innerHTML = `<iframe src="https://open.spotify.com/embed/track/${TRACK_ID}?utm_source=generator&theme=0" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
        };

        if (window.SpotifyIframeApi) {
            mount(window.SpotifyIframeApi);
        } else {
            window.onSpotifyIframeApiReady = (IFrameAPI) => {
                window.SpotifyIframeApi = IFrameAPI;
                mount(IFrameAPI);
            };
            if (!document.getElementById('spotify-iframe-api')) {
                const script = document.createElement('script');
                script.id = 'spotify-iframe-api';
                script.src = 'https://open.spotify.com/embed/iframe-api/v1';
                script.async = true;
                script.onerror = fallback;
                document.body.appendChild(script);
            }
        }

        return () => container.replaceChildren();
    }, []);

    return (
        <div className="glass-card bento-hover rounded-3xl md:col-span-4 lg:col-span-4 row-span-1 min-h-[352px] overflow-hidden p-0 flex flex-col md:flex-row items-center gap-6 bg-white/50">
            {/* Spotify Embed */}
            <div className="w-full md:w-2/3 h-full p-4 flex items-center justify-center">
                <div
                    ref={containerRef}
                    className="w-full h-[352px] rounded-[24px] overflow-hidden shadow-lg"
                ></div>
            </div>

            {/* Listening Status */}
            <div className="w-full md:w-1/3 flex flex-col justify-center items-center text-center p-6 gap-4 h-full border-l border-white/20">
                <style>{`
                    @keyframes vinyl-spin { to { transform: rotate(360deg); } }
                    @keyframes eq-bounce { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
                    @keyframes note-float { 0% { opacity: 0; transform: translate(0, 0) rotate(0deg); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(14px, -46px) rotate(18deg); } }
                    .vinyl-disc { animation: vinyl-spin 3.2s linear infinite; }
                    .eq-bar { animation: eq-bounce 1s ease-in-out infinite; transform-origin: bottom; }
                    .music-note { animation: note-float 2.8s ease-out infinite; }
                    @media (prefers-reduced-motion: reduce) { .vinyl-disc, .eq-bar, .music-note { animation: none; } }
                `}</style>

                {/* Turntable vector */}
                <div className="relative w-36 h-36">
                    <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-xl" aria-hidden="true">
                        {/* Record */}
                        <g className="vinyl-disc" style={{ transformOrigin: '60px 70px' }}>
                            <circle cx="60" cy="70" r="56" fill="#121212" />
                            <circle cx="60" cy="70" r="48" fill="none" stroke="#2a2a2a" strokeWidth="1" />
                            <circle cx="60" cy="70" r="41" fill="none" stroke="#2a2a2a" strokeWidth="1" />
                            <circle cx="60" cy="70" r="34" fill="none" stroke="#2a2a2a" strokeWidth="1" />
                            <path d="M22 50 A44 44 0 0 1 48 28" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="60" cy="70" r="20" fill="#1DB954" />
                            <path d="M56 62 v12.5 a3.5 3.5 0 1 1 -2 -3.2 V60 l10 -2.5 v4 z" fill="#121212" />
                            <circle cx="60" cy="70" r="2" fill="#f5f5f7" />
                        </g>
                        {/* Tonearm */}
                        <circle cx="122" cy="20" r="8" fill="#d2d2d7" />
                        <circle cx="122" cy="20" r="3.5" fill="#86868b" />
                        <path d="M122 20 L118 70 L98 92" fill="none" stroke="#d2d2d7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="90" y="88" width="12" height="8" rx="2" transform="rotate(-40 96 92)" fill="#86868b" />
                    </svg>
                    {/* Floating notes */}
                    <span className="music-note absolute -top-1 left-2 text-[#1DB954] text-lg font-bold">♪</span>
                    <span className="music-note absolute top-6 -left-3 text-[#1DB954]/70 text-sm font-bold" style={{ animationDelay: '1.4s' }}>♫</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1DB954]/10 text-[#1a8f43] text-[10px] font-bold uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]"></span>
                    </span>
                    On Repeat
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-text-main mb-1 leading-tight">My Shipping Soundtrack</h3>
                    <p className="text-sm text-text-secondary font-medium">Headphones on. Bugs off. Deploy mode.</p>
                </div>

                {/* Equalizer */}
                <div className="flex gap-1.5 items-end h-7">
                    {[0.9, 0.6, 1.1, 0.75, 1.3, 0.65, 1].map((dur, i) => (
                        <span
                            key={i}
                            className="eq-bar w-1.5 h-full bg-[#1DB954] rounded-full"
                            style={{ animationDuration: `${dur}s`, animationDelay: `${i * 0.12}s` }}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Spotify;
