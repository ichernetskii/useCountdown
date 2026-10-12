import { useEffect, useState } from "react";
import { createCountdown } from "./helpers.js";

export interface CountdownProps {
	/** Initial value of the countdown */
	from: number;
	/** Final value of the countdown */
	to: number;
	/** Step of the countdown; its sign is ignored, the direction is defined by `from` and `to` */
	delta: number;
	/** Duration of the countdown in milliseconds */
	duration: number;
}

/** Maximum delay of `setTimeout`, longer delays make it fire immediately */
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Counts from `from` to `to` (up or down) by `delta` during `duration` milliseconds.
 * The countdown restarts when any of the props changes.
 * @param {CountdownProps} props - Countdown props
 * @param {number} props.from - Initial value of the countdown
 * @param {number} props.to - Final value of the countdown
 * @param {number} props.delta - Step of the countdown; its sign is ignored, the direction is defined by `from` and `to`
 * @param {number} props.duration - Duration of the countdown in milliseconds
 * @returns Current value of the countdown
 */
export const useCountdown = ({
	from,
	to,
	delta,
	duration,
}: CountdownProps): number => {
	const key = [from, to, delta, duration].join();
	const [state, setState] = useState({ key, value: from });

	// Restarts the countdown when the props change. It's done during rendering rather than in an effect,
	// so a stale value is never rendered: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	if (state.key !== key) {
		setState({ key, value: from });
	}

	useEffect(() => {
		const countdown = createCountdown({ from, to, delta, duration });
		const startTime = performance.now();
		let timer: ReturnType<typeof setTimeout> | undefined;

		const scheduleUpdate = (step: number): void => {
			if (step >= countdown.stepsCount) return;
			const delay = countdown.getStepTime(step + 1) - (performance.now() - startTime);
			timer = setTimeout(update, Math.min(Math.max(delay, 1), MAX_TIMEOUT));
		};

		// The step is calculated from the elapsed time rather than counted,
		// so late timers (e.g. in background tabs) don't make the countdown drift
		const update = (): void => {
			const step = countdown.getStep(performance.now() - startTime);
			setState({ key, value: countdown.getValue(step) });
			scheduleUpdate(step);
		};

		scheduleUpdate(0);

		return () => {
			clearTimeout(timer);
		};
	}, [key, from, to, delta, duration]);

	return state.key === key ? state.value : from;
};
