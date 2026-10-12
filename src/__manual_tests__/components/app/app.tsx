import type { JSX } from "react";
import { type CountdownProps, useCountdown } from "@/useCountdown";

const Label = (props: CountdownProps): JSX.Element => {
	const value = useCountdown(props);

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
			<Label from={10} to={100} duration={10_000} delta={1} />
			<Label from={10} to={0} duration={10_000} delta={1} />
			<Label from={0} to={1} duration={10_000} delta={0.1} />
			<h1>{value}</h1>
		</div>
	);
}
