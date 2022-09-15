import { delay, round } from "@/helpers";

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

test("delay", async () => {
	jest.useFakeTimers();
	jest.spyOn(global, "setTimeout");

	const DELAY_TIME = 100;
	const mockDelay = jest.fn(delay);
	const handler = jest.fn();
	const actual = mockDelay(DELAY_TIME).then(handler);
	jest.runAllTimers();

	await actual;

	expect(handler).toHaveBeenCalled();
	expect(setTimeout).toHaveBeenCalledTimes(1);
	expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), DELAY_TIME);
});
