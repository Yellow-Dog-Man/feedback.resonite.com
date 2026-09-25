import type { FC } from "hono/jsx";

export const Cheese: FC = () => {
	return (
		<div>
			<p>Thank you for testing an INFINITE, cheese to you.</p>
			<img src="/images/cheese.png" alt="CHEESE" />
			<p>
				However due to testing, we're not submitting GH issues today. However,
				you are "PRIME CERTIFIED" today, because you tested.
			</p>
			<img
				src="/images/PrimeCertified.png"
				alt="Prime certifies this message"
			/>
		</div>
	);
};
