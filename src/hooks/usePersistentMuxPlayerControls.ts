import { useEffect, RefObject } from 'react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

export function usePersistentMuxPlayerControls(playerRef: RefObject<MuxPlayerRefAttributes | null>) {
    useEffect(() => {
		const player = playerRef.current;
		if (!player) return;

		let observer: MutationObserver | null = null;

		const setupObserver = () => {
            const mediaController = player
                .shadowRoot?.querySelector('media-theme')
                ?.shadowRoot?.querySelector('media-controller');

            if (mediaController) {
                mediaController.setAttribute('noautohide', '');

                observer = new MutationObserver(() => {
                    if (!mediaController.hasAttribute('noautohide')) {
                        mediaController.setAttribute('noautohide', '');
                    }
                });

                observer.observe(mediaController, { attributes: true });
            } else {
                setTimeout(setupObserver, 50);
            }
		};

		setupObserver();

		return () => {
            if (observer) {
                observer.disconnect();
            }
		};
	}, [playerRef]);
}