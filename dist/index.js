export function tapGuard({ windowMs, now = () => Date.now() }) {
    let lastAt = null;
    let run = 0;
    return {
        scrolled() {
            lastAt = now();
            run = 0;
        },
        stray() {
            if (lastAt === null)
                return null;
            const at = now();
            const sinceMs = at - lastAt;
            if (sinceMs < 0 || sinceMs >= windowMs) {
                lastAt = null;
                return null;
            }
            lastAt = at;
            run += 1;
            return { sinceMs, run };
        },
    };
}
