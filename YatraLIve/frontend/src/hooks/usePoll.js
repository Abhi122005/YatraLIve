import { useEffect, useRef } from 'react';

export function usePoll(fn, interval = 3000) {
    const savedFn = useRef(fn);
    const failCount = useRef(0);

    useEffect(() => {
        savedFn.current = fn;
    }, [fn]);

    useEffect(() => {
        let id;
        const tick = async () => {
            try {
                await savedFn.current();
                failCount.current = 0;
            } catch (err) {
                failCount.current += 1;
                console.warn(`Poll failed (${failCount.current}):`, err);
            }
        };

        // Initial call
        tick();

        id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [interval]);

    return failCount;
}
