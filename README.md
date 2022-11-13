## useCountdown hook for React

usage in React component:
```
import {useCountdown} from "use-countdown-react"

const value = useCountdown({
	from: 0,
	to: 100,
	duration: 10_000,
	delta: 1,
});

return <div>{value}</div>;
```
