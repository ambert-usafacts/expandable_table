import { format } from "d3-format";

export const dollarFormat = (v) => {
	if (v >= 1e12) {
		return format("$,.2s")(v).replace("G", "B").replace("k", "K");
	}
	return format("$,.3s")(v).replace("G", "B").replace("k", "K");
};

export const roundedNumber = (v) => {
	if (v >= 1e12) {
		return format(".2s")(v).replace("G", "B").replace("k", "K");
	}
	return format(".3s")(v).replace("G", "B").replace("k", "K");
};

// Custom percentage formatter
export const percentFormat = (value) => {
	const percentage = value; // Convert to percentage
	if (percentage >= 1) {
		return format(".1f")(percentage) + "%"; // Round to 1 decimal for large percentages
	} else if (percentage >= 0.01) {
		return format(".2f")(percentage) + "%"; // Show up to 4 decimals for smaller percentages
	} else {
		return format(".4f")(percentage) + "%"; // Show up to 6 decimals for very small percentages
	}
};
