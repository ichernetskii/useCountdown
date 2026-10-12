import type { CountdownProps } from "./useCountdown.js";

export interface Countdown {
	/** Number of steps from `from` to `to` */
	stepsCount: number;
	/** Value after the given number of steps */
	getValue: (step: number) => number;
	/** Time (ms since the start) when the given step is due */
	getStepTime: (step: number) => number;
	/** Number of steps that are due by the given time (ms since the start) */
	getStep: (time: number) => number;
}

export const round = (
	num: number,
	digits = 2,
): number => Math.round((num + Number.EPSILON) * 10 ** digits) / 10 ** digits;

/** Number of digits after the decimal point: 0.25 → 2, 1e-7 → 7 */
export const getPrecision = (num: number): number => {
	const [mantissa = "", exponent = "0"] = String(num).split("e");
	const decimals = mantissa.split(".")[1]?.length ?? 0;
	return Math.max(0, decimals - Number(exponent));
};

const getStepsCount = (distance: number, stepSize: number): number => {
	if (distance === 0) return 0;
	// toPrecision removes floating point errors: 0.7 / 0.07 = 10.000000000000002
	const stepsCount = Math.ceil(Number((distance / stepSize).toPrecision(12)));
	// invalid props (e.g. delta = 0) make a single step instead of an endless countdown
	return Number.isFinite(stepsCount) && stepsCount > 0 ? stepsCount : 1;
};

/**
 * Splits the countdown into steps of `delta` evenly distributed over `duration`.
 * The direction is defined by `from` and `to`, the sign of `delta` is ignored.
 * The last step ends exactly at `to` even if the distance isn't divisible by `delta`.
 */
export const createCountdown = ({
	from,
	to,
	delta,
	duration,
}: CountdownProps): Countdown => {
	const distance = Math.abs(to - from);
	const direction = Math.sign(to - from);
	const stepSize = Math.abs(delta);
	const totalTime = duration > 0 ? duration : 0;
	const stepsCount = getStepsCount(distance, stepSize);
	// duration of a full step, the last step may be shorter
	const stepTime = stepsCount > 1 ? totalTime * stepSize / distance : totalTime;
	const precision = Math.max(getPrecision(from), getPrecision(delta));

	return {
		stepsCount,
		getValue: (step) => {
			if (step <= 0) return from;
			if (step >= stepsCount) return to;
			// rounding removes floating point errors: 3 * 0.1 = 0.30000000000000004
			return round(from + direction * step * stepSize, precision);
		},
		getStepTime: (step) => {
			if (step <= 0) return 0;
			if (step >= stepsCount) return totalTime;
			return step * stepTime;
		},
		getStep: (time) => {
			if (time >= totalTime) return stepsCount;
			// the epsilon compensates floating point errors at the steps boundaries
			return Math.min(Math.floor(time / stepTime + 1e-9), stepsCount);
		},
	};
};
