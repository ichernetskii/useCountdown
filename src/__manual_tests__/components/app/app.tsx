import * as React from "react";
import { useCountdown } from "@/useCountdown";

const Label = (): JSX.Element => {
	const value = useCountdown({
		from: 10,
		to: 100,
		duration: 10_000,
		delta: 1,
	});

	return <div>{value}</div>;
};

export default function App (): JSX.Element {
	const value = useCountdown({
		from: 1,
		to: 10,
		duration: 10_000,
		delta: 1,
	});

	return (
		<div className="App">
			<Label />
			<h1>{value}</h1>
		</div>
	);
}
