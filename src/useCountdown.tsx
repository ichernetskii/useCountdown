import { useEffect, useMemo, useState } from "react";
import { delay, round } from "./helpers.js";

interface CountdownProps {
	from: number;
	to: number;
	delta: number;
	duration: number;
}

async function * getValue ({
	from,
	to,
	delta,
	duration,
}: CountdownProps): AsyncIterable<number> {
	const intervalsCount = round((to - from) / delta);
	const deltaTime = round(duration / intervalsCount);
	for (let i = from; i <= to; i = round(i + delta)) {
		yield i;
		await delay(deltaTime);
	}
}

function useAsyncIterable<T> (initialValue: T, iterable: AsyncIterable<T>): T {
	const [value, setValue] = useState(initialValue);

	useEffect(() => {
		setValue(initialValue);

		void (async () => {
			for await (const value of iterable) {
				setValue(value);
			}
		})();
	}, [iterable]);

	return value;
}

/**
 * @param {CountdownProps} props - Countdown props
 * @param {number} props.from - Initial value of the countdown
 * @param {number} props.to - Final value of the countdown
 * @param {number} props.delta - Value to increment the countdown by
 * @param {number} props.duration - Duration of the countdown in milliseconds
 */
export const useCountdown = ({
	from,
	to,
	delta,
	duration,
}: CountdownProps): number => {
	return useAsyncIterable(
		from,
		useMemo(
			() => getValue({
				from,
				to,
				delta,
				duration,
			}),
			[from, to, delta, duration],
		),
	);
};
