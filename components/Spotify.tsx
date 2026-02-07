import React from 'react';

const Spotify = () => {
    return (
        <div className="glass-card bento-hover rounded-3xl md:col-span-4 lg:col-span-4 row-span-1 min-h-[352px] overflow-hidden p-0 flex flex-col md:flex-row items-center gap-6 bg-white/50">
            {/* Spotify Embed */}
            <div className="w-full md:w-2/3 h-full p-4 flex items-center justify-center">
                <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: '24px' }}
                    src="https://open.spotify.com/embed/track/4iveM86TL9ombdSfV9T1P9?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="shadow-lg"
                ></iframe>
            </div>

            {/* Listening Status */}
            <div className="w-full md:w-1/3 flex flex-col justify-center items-center text-center p-6 gap-5 h-full border-l border-white/20">
                <div className="w-20 h-20 rounded-full bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-5xl">headphones</span>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-text-main mb-2">Currently Coding To</h3>
                    <p className="text-base text-text-secondary font-medium">Focus Mode • 100% Volume</p>
                </div>

                {/* Visualizer */}
                <div className="flex gap-2 items-end h-8 opacity-90 mt-2">
                    <span className="w-2 bg-[#1DB954] animate-[pulse_0.8s_ease-in-out_infinite] h-4 rounded-full"></span>
                    <span className="w-2 bg-[#1DB954] animate-[pulse_1.2s_ease-in-out_infinite] delay-100 h-8 rounded-full"></span>
                    <span className="w-2 bg-[#1DB954] animate-[pulse_1.0s_ease-in-out_infinite] delay-200 h-6 rounded-full"></span>
                    <span className="w-2 bg-[#1DB954] animate-[pulse_0.6s_ease-in-out_infinite] delay-75 h-3 rounded-full"></span>
                </div>
            </div>
        </div>
    );
};

export default Spotify;