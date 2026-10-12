import { act, cleanup, type RenderHookResult, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { type CountdownProps, useCountdown } from "@/index";

const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const advance = async (ms: number): Promise<void> => {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
};

const render = (props: CountdownProps): RenderHookResult<number, CountdownProps> => renderHook(useCountdown, { initialProps: props });

test("counts up by delta during duration", async () => {
	const { result } = render({ from: 0, to: 10, delta: 1, duration: 10_000 });
	expect(result.current).toBe(0);

	await advance(999);
	expect(result.current).toBe(0);

	await advance(1);
	expect(result.current).toBe(1);

	await advance(4000);
	expect(result.current).toBe(5);

	await advance(5000);
	expect(result.current).toBe(10);
	expect(vi.getTimerCount()).toBe(0);
});

test("counts down", async () => {
	const { result } = render({ from: 10, to: 0, delta: 1, duration: 10_000 });
	expect(result.current).toBe(10);

	await advance(3000);
	expect(result.current).toBe(7);

	await advance(7000);
	expect(result.current).toBe(0);
});

test("finishes exactly at `to` after duration", async () => {
	const { result } = render({ from: 0, to: 10, delta: 3, duration: 10_000 });

	await advance(9999);
	expect(result.current).toBe(9);

	await advance(1);
	expect(result.current).toBe(10);
	expect(vi.getTimerCount()).toBe(0);
});

test("doesn't drift when timers fire late", async () => {
	const { result } = render({ from: 0, to: 10, delta: 1, duration: 10_000 });

	// emulates a throttled background tab: the next timer fires 4.5 seconds late
	const now = performance.now.bind(performance);
	vi.spyOn(performance, "now").mockImplementation(() => now() + 4500);

	await advance(1000);
	expect(result.current).toBe(5);

	await advance(500);
	expect(result.current).toBe(6);
});

test("restarts when props change", async () => {
	const { result, rerender } = render({ from: 0, to: 10, delta: 1, duration: 10_000 });
	await advance(3000);
	expect(result.current).toBe(3);

	rerender({ from: 20, to: 10, delta: 1, duration: 10_000 });
	expect(result.current).toBe(20);

	await advance(1000);
	expect(result.current).toBe(19);
});

test("doesn't render a stale value when props change", async () => {
	const values: number[] = [];
	const { rerender } = renderHook(
		(props: CountdownProps) => {
			const value = useCountdown(props);
			values.push(value);
			return value;
		},
		{ initialProps: { from: 0, to: 10, delta: 1, duration: 10_000 } },
	);
	await advance(3000);

	values.length = 0;
	rerender({ from: 20, to: 10, delta: 1, duration: 10_000 });

	expect(values).not.toHaveLength(0);
	expect(values.every(value => value === 20)).toBe(true);
});

test("doesn't restart when rerendered with the same props", async () => {
	const { result, rerender } = render({ from: 0, to: 10, delta: 1, duration: 10_000 });
	await advance(3000);

	rerender({ from: 0, to: 10, delta: 1, duration: 10_000 });
	expect(result.current).toBe(3);

	await advance(1000);
	expect(result.current).toBe(4);
});

test("stops the timer on unmount", async () => {
	const { unmount } = render({ from: 0, to: 10, delta: 1, duration: 10_000 });
	await advance(3000);
	expect(vi.getTimerCount()).toBe(1);

	unmount();
	expect(vi.getTimerCount()).toBe(0);
});

test("runs a single timer in StrictMode", async () => {
	const { result } = renderHook(useCountdown, {
		initialProps: { from: 0, to: 10, delta: 1, duration: 10_000 },
		wrapper: StrictMode,
	});

	await advance(5000);
	expect(result.current).toBe(5);
	expect(vi.getTimerCount()).toBe(1);
});

test("doesn't start a timer when `from` equals `to`", () => {
	const { result } = render({ from: 5, to: 5, delta: 1, duration: 10_000 });

	expect(result.current).toBe(5);
	expect(vi.getTimerCount()).toBe(0);
});

test.each([0, NaN])("jumps to `to` at the end when delta is %s", async (delta) => {
	const { result } = render({ from: 0, to: 10, delta, duration: 10_000 });

	await advance(9999);
	expect(result.current).toBe(0);

	await advance(1);
	expect(result.current).toBe(10);
	expect(vi.getTimerCount()).toBe(0);
});

test("supports durations longer than the maximum timeout", async () => {
	const { result } = render({ from: 0, to: 1, delta: 1, duration: 30 * DAY });

	await advance(25 * DAY);
	expect(result.current).toBe(0);

	await advance(5 * DAY);
	expect(result.current).toBe(1);
});
