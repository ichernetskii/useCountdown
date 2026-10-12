import { describe, expect, test } from "vitest";
import { type Countdown, createCountdown, getPrecision, round } from "@/helpers";

const getValues = (countdown: Countdown): number[] => Array.from(
	{ length: countdown.stepsCount + 1 },
	(_, step) => countdown.getValue(step),
);

const getStepTimes = (countdown: Countdown): number[] => Array.from(
	{ length: countdown.stepsCount + 1 },
	(_, step) => countdown.getStepTime(step),
);

test("round", () => {
	expect(round(1.23456789, 2)).toBe(1.23);
	expect(round(1.00000001, 2)).toBe(1);
	expect(round(1.1, 2)).toBe(1.1);
	expect(round(1, 2)).toBe(1);
	expect(round(123, 10)).toBe(123);
	expect(round(123.123, 1)).toBe(123.1);
	expect(round(123.123, 0)).toBe(123);
	expect(round(123.123, -1)).toBe(120);
	expect(round(123.123, -2)).toBe(100);
});

test("getPrecision", () => {
	expect(getPrecision(0)).toBe(0);
	expect(getPrecision(10)).toBe(0);
	expect(getPrecision(-0.5)).toBe(1);
	expect(getPrecision(0.25)).toBe(2);
	expect(getPrecision(1e-7)).toBe(7);
	expect(getPrecision(1.5e-7)).toBe(8);
	expect(getPrecision(1e21)).toBe(0);
	expect(getPrecision(NaN)).toBe(0);
	expect(getPrecision(Infinity)).toBe(0);
});

describe("createCountdown", () => {
	test("counts up evenly", () => {
		const countdown = createCountdown({ from: 0, to: 5, delta: 1, duration: 1000 });

		expect(countdown.stepsCount).toBe(5);
		expect(getValues(countdown)).toEqual([0, 1, 2, 3, 4, 5]);
		expect(getStepTimes(countdown)).toEqual([0, 200, 400, 600, 800, 1000]);
	});

	test("counts down", () => {
		const countdown = createCountdown({ from: 5, to: 0, delta: 1, duration: 1000 });

		expect(getValues(countdown)).toEqual([5, 4, 3, 2, 1, 0]);
		expect(getStepTimes(countdown)).toEqual([0, 200, 400, 600, 800, 1000]);
	});

	test("ignores the sign of delta", () => {
		expect(getValues(createCountdown({ from: 0, to: 3, delta: -1, duration: 1000 }))).toEqual([0, 1, 2, 3]);
		expect(getValues(createCountdown({ from: 3, to: 0, delta: -1, duration: 1000 }))).toEqual([3, 2, 1, 0]);
	});

	test("ends exactly at `to` when the distance isn't divisible by delta", () => {
		const countdown = createCountdown({ from: 0, to: 10, delta: 3, duration: 1000 });

		expect(getValues(countdown)).toEqual([0, 3, 6, 9, 10]);
		expect(getStepTimes(countdown)).toEqual([0, 300, 600, 900, 1000]);
	});

	test("makes a single step when delta exceeds the distance", () => {
		const countdown = createCountdown({ from: 0, to: 10, delta: 20, duration: 1000 });

		expect(getValues(countdown)).toEqual([0, 10]);
		expect(getStepTimes(countdown)).toEqual([0, 1000]);
	});

	test("removes floating point errors", () => {
		expect(getValues(createCountdown({ from: 0, to: 0.5, delta: 0.1, duration: 1000 })))
			.toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5]);
		expect(getValues(createCountdown({ from: 1, to: 0.3, delta: 0.1, duration: 1000 })))
			.toEqual([1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]);
		expect(createCountdown({ from: 0, to: 0.3, delta: 0.1, duration: 1000 }).stepsCount).toBe(3);
		expect(createCountdown({ from: 0, to: 0.7, delta: 0.07, duration: 1000 }).stepsCount).toBe(10);
	});

	test("keeps the precision of small steps", () => {
		expect(getValues(createCountdown({ from: 0, to: 0.003, delta: 0.001, duration: 1000 })))
			.toEqual([0, 0.001, 0.002, 0.003]);
		expect(getValues(createCountdown({ from: 1.5, to: 1.4, delta: 0.025, duration: 1000 })))
			.toEqual([1.5, 1.475, 1.45, 1.425, 1.4]);
	});

	test("has no steps when `from` equals `to`", () => {
		const countdown = createCountdown({ from: 5, to: 5, delta: 1, duration: 1000 });

		expect(countdown.stepsCount).toBe(0);
		expect(countdown.getValue(0)).toBe(5);
		expect(countdown.getStep(0)).toBe(0);
		expect(countdown.getStep(5000)).toBe(0);
	});

	test.each([0, NaN, Infinity, -Infinity])("jumps to `to` at the end when delta is %s", (delta) => {
		const countdown = createCountdown({ from: 0, to: 10, delta, duration: 1000 });

		expect(getValues(countdown)).toEqual([0, 10]);
		expect(getStepTimes(countdown)).toEqual([0, 1000]);
	});

	test.each([0, -1000, NaN])("finishes immediately when duration is %s", (duration) => {
		const countdown = createCountdown({ from: 0, to: 10, delta: 1, duration });

		expect(countdown.getStep(0)).toBe(10);
		expect(countdown.getStepTime(5)).toBe(0);
	});

	test("never finishes when duration is Infinity", () => {
		const countdown = createCountdown({ from: 0, to: 10, delta: 1, duration: Infinity });

		expect(countdown.getStep(0)).toBe(0);
		expect(countdown.getStep(Number.MAX_VALUE)).toBe(0);
		expect(countdown.getStepTime(0)).toBe(0);
		expect(countdown.getStepTime(1)).toBe(Infinity);
	});

	test("getStep returns the number of steps due by the given time", () => {
		const countdown = createCountdown({ from: 0, to: 10, delta: 3, duration: 1000 });

		expect(countdown.getStep(0)).toBe(0);
		expect(countdown.getStep(299)).toBe(0);
		expect(countdown.getStep(300)).toBe(1);
		expect(countdown.getStep(999)).toBe(3);
		expect(countdown.getStep(1000)).toBe(4);
		expect(countdown.getStep(5000)).toBe(4);
	});

	test("getStep is consistent with getStepTime", () => {
		const countdown = createCountdown({ from: 0, to: 1, delta: 0.01, duration: 3333 });

		for (let step = 0; step <= countdown.stepsCount; step++) {
			expect(countdown.getStep(countdown.getStepTime(step))).toBe(step);
		}
	});
});
