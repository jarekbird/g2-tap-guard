export interface TapGuardOptions {
    windowMs: number;
    now?: () => number;
}
export interface StrayTap {
    sinceMs: number;
    run: number;
}
export interface TapGuard {
    scrolled(): void;
    stray(): StrayTap | null;
}
export declare function tapGuard({ windowMs, now }: TapGuardOptions): TapGuard;
