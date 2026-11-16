# g2-tap-guard

Even G2 glasses sometimes report one swipe in a series of scrolls as a tap. If a tap does something big on your
screen, such as jumping to the end of a long text, that stray tap throws the user away from where they were reading.

`g2-tap-guard` tells you whether a tap came too soon after a scroll to be meant. It has no dependencies, keeps no
timers and does not touch the Even Hub SDK: you tell it when a scroll happened and ask it about each tap.

- A tap within `windowMs` of the last scroll is stray.
- A stray tap keeps the window open, so a run of stray taps on the scroll's rhythm is caught too. `run` counts them.
- The first tap that gets through closes the window until the next scroll.

## Install

No registry release yet; install from GitHub, pinned to a tag:

```sh
npm install git+https://github.com/jarekbird/g2-tap-guard.git#v0.1.0
```

Use the `git+https` form rather than `github:`: npm records `github:` in the lockfile as an SSH URL, which a CI runner
without an SSH key cannot fetch.

## Use

```ts
import { OsEventTypeList as T, waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import { tapGuard } from 'g2-tap-guard'

const guard = tapGuard({ windowMs: 1_500 })
const bridge = await waitForEvenAppBridge()

bridge.onEvenHubEvent(event => {
  const envelope = event.textEvent ?? event.sysEvent ?? event.listEvent
  if (!envelope) return
  const type = envelope.eventType ?? T.CLICK_EVENT
  if (type === T.SCROLL_TOP_EVENT || type === T.SCROLL_BOTTOM_EVENT) {
    guard.scrolled()
    scroll(type === T.SCROLL_TOP_EVENT)
  } else if (type === T.CLICK_EVENT) {
    const stray = guard.stray()
    if (stray) console.log('stray tap', stray.sinceMs, 'ms after a scroll, run', stray.run)
    else jumpToEnd()
  }
})
```

A single tap is event type 0, which protobuf leaves out, hence the `?? T.CLICK_EVENT`.

Use one guard per screen whose tap you protect, and call `scrolled()` only for scrolls on that screen.

## Choosing `windowMs`

Steady scrolling on the G2 sends events roughly 0.7 to 0.9 s apart, and stray taps land on that rhythm, sometimes a
little past 1 s after the last scroll. 1.5 s caught them in practice; a deliberate tap then needs a short pause after
scrolling. Pass `now` to use another clock, for example in tests.

## API

```ts
tapGuard(options: { windowMs: number; now?: () => number }): {
  scrolled(): void
  stray(): { sinceMs: number; run: number } | null
}
```

## Develop

```sh
npm ci
npm run check
```

`dist/` is committed so that installing from GitHub needs no build step; `npm run check` fails if it is stale.

## Licence

MIT
