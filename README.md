# use-countdown-react

[![npm version](https://img.shields.io/npm/v/use-countdown-react)](https://www.npmjs.com/package/use-countdown-react)
[![CI](https://github.com/ichernetskii/useCountdown/actions/workflows/ci.yml/badge.svg)](https://github.com/ichernetskii/useCountdown/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/use-countdown-react)](https://www.npmjs.com/package/use-countdown-react)
[![types](https://img.shields.io/npm/types/use-countdown-react)](https://www.npmjs.com/package/use-countdown-react)
[![react](https://img.shields.io/npm/dependency-version/use-countdown-react/peer/react)](https://react.dev)
[![license](https://img.shields.io/npm/l/use-countdown-react)](LICENSE)

A tiny React hook that counts from one number to another — up or down, by a fixed step, within a given time.

- **Accurate.** The value is calculated from the elapsed time, so the countdown never drifts and catches up after the browser throttles a background tab.
- **Flexible.** Counts up and down, with integer or fractional steps, and always ends exactly at the final value.
- **Safe.** Clears its timer on unmount, restarts when the props change and works in `StrictMode`.
- **Small.** About 0.6 kB minified and gzipped, no dependencies besides React, TypeScript types included.

## Installation

```sh
npm install use-countdown-react
```

or

```sh
yarn add use-countdown-react
```

React 16.8 or newer is required.

## Quick start

```tsx
import { useCountdown } from "use-countdown-react";

export function Timer () {
	const secondsLeft = useCountdown({
		from: 10,
		to: 0,
		delta: 1,
		duration: 10_000,
	});

	return <p>{secondsLeft} seconds left</p>;
}
```

The value starts at `10` and decreases by `1` every second until it reaches `0`.

## Examples

### Animated number

Count up to a statistic in 2 seconds:

```tsx
const users = useCountdown({ from: 0, to: 1500, delta: 10, duration: 2000 });

return <strong>{users.toLocaleString()} users</strong>;
```

### Fractional steps

```tsx
const progress = useCountdown({ from: 0, to: 1, delta: 0.1, duration: 5000 });

return <progress value={progress} max={1} />;
```

The values are `0`, `0.1`, `0.2`, `0.3`, … — floating point errors such as `0.30000000000000004` are removed.

### Doing something at the end

The last value is always exactly `to`, so it's safe to compare with it:

```tsx
const secondsLeft = useCountdown({ from: 5, to: 0, delta: 1, duration: 5000 });

return secondsLeft === 0 ? <p>Time is up!</p> : <p>{secondsLeft}</p>;
```

### Restarting

The countdown restarts whenever any prop changes. To restart it with the same props, remount the component with a new `key`:

```tsx
function RestartableTimer () {
	const [attempt, setAttempt] = useState(0);

	return (
		<>
			<Timer key={attempt} />
			<button onClick={() => setAttempt(attempt + 1)}>Restart</button>
		</>
	);
}
```

## API

```ts
function useCountdown (props: CountdownProps): number;
```

| Prop       | Type     | Description                                                                                       |
|------------|----------|---------------------------------------------------------------------------------------------------|
| `from`     | `number` | Initial value.                                                                                    |
| `to`       | `number` | Final value: greater than `from` to count up, less than `from` to count down.                     |
| `delta`    | `number` | Step between two consecutive values. Its sign is ignored: the direction is defined by `from` and `to`. |
| `duration` | `number` | Duration of the countdown in milliseconds.                                                        |

Returns the current value: `from` on the first render, then `from ± delta`, `from ± 2 × delta`, … and finally `to`.

The props type is exported as well:

```ts
import type { CountdownProps } from "use-countdown-react";
```

## How it works

- **Timing.** The steps are evenly distributed over `duration`: the value changes every `duration × |delta| / |to − from|` milliseconds. For example, `{ from: 0, to: 10, delta: 1, duration: 10_000 }` changes the value every second.
- **Exact end.** The value reaches `to` exactly when `duration` elapses. If the distance isn't divisible by `delta`, the last step is shorter: `{ from: 0, to: 10, delta: 3 }` gives `0`, `3`, `6`, `9`, `10`.
- **No drift.** The current step is calculated from the time elapsed since the start instead of counting timer ticks. Late timers (for example, in background tabs, where browsers throttle them) don't slow the countdown down: it jumps to the right value as soon as the timer fires.
- **Clean numbers.** The values are rounded to the precision of `from` and `delta`, which removes floating point errors.
- **Restarts.** When any prop changes, the countdown starts over from the new `from`. The new value is returned in the same render, so a stale value is never shown. Re-rendering with equal props doesn't restart the countdown.
- **Cleanup.** Only one timer is active at a time, and none is left running after unmount or after the countdown ends.
- **Server-side rendering.** On the server the hook returns `from`; the countdown starts after hydration.
- **Edge cases.** If `from` equals `to`, no timer is started. If `delta` is `0` or not a finite number, the value jumps from `from` to `to` when `duration` elapses. If `duration` is `0` or negative, the value becomes `to` right after the first render.

## Compatibility

- React 16.8 or newer; tested with React 18 and 19.
- The package is an ES module with TypeScript declarations. CommonJS code can load it with `require()` in Node.js 20.19+ and 22.12+, or with a dynamic `import()` in older versions.

## Migrating from 1.x

Version 2.0.0 fixes several bugs, which changes the behavior in some cases:

- **Counting down works.** Previously the value never changed if `from` was greater than `to`.
- **The countdown always ends at `to`.** Previously it could stop at the last multiple of `delta`, e.g. at `9` instead of `10`.
- **Values keep their precision.** Previously every value was rounded to 2 decimal places, so `delta: 0.001` never moved the countdown. Now the values are rounded to the precision of `from` and `delta`.
- **Invalid props don't cause endless loops.** Previously `delta: 0`, a very small `delta` or a `delta` of the wrong sign started an endless loop of timers and re-renders.
- **No drift and no leaks.** The countdown keeps the right pace in background tabs and stops its timer on unmount and when the props change.
- **`react` is a peer dependency.** Previously it was a regular dependency, which could install a second copy of React and cause "Invalid hook call" errors. `react-dom` and `classnames` are no longer installed.
- **Deep imports aren't supported.** The package defines `exports`, so only the package root can be imported: use `use-countdown-react` instead of paths like `use-countdown-react/build/useCountdown.js`.

## Development

```sh
yarn install     # install dependencies (Yarn 4)
yarn manual      # playground at http://localhost:4200
yarn test        # unit tests (Vitest)
yarn lint        # ESLint
yarn typecheck   # type checking
yarn build       # compile the package to ./build
```

Releases are published by the [Publish workflow](.github/workflows/publish.yml) when a version tag is pushed. It checks that the tag matches the version in `package.json`, runs the checks and publishes the package to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements) using trusted publishing. `npm version <patch|minor|major>` runs the checks, bumps the version and pushes it together with the tag.

## License

[MIT](LICENSE)
