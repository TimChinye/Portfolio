import { useEffect, RefObject } from 'react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

export function useEnforceMuted(playerRef: RefObject<MuxPlayerRefAttributes | null>, dependency: any) {
    useEffect(() => {
        const player = playerRef.current;
        const videoEl = player?.media;

        if (!videoEl) return;

        const enforceMuted = () => {
            if (!videoEl.muted) {
                videoEl.muted = true;
            }
        };

        const handlePlay = () => enforceMuted();
        const handleVolumeChange = () => enforceMuted();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                enforceMuted();
                videoEl.play().catch(() => {});
            }
        };
        
        videoEl.addEventListener('play', handlePlay);
        videoEl.addEventListener('volumechange', handleVolumeChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        enforceMuted(); // Initial check

        return () => {
            videoEl.removeEventListener('play', handlePlay);
            videoEl.removeEventListener('volumechange', handleVolumeChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [playerRef, dependency]);
}