import React from "react";

interface SpinnerProps {
	size?: number;
	color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 40, color = "#6f42c1" }) => {
	return (
		<div
			style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				display: "inline-block",
				width: size,
				height: size,
				border: `2px solid ${color}`,
				borderRadius: "50%",
				borderTopColor: "transparent",
				animation: "spin 1s linear infinite",
			}}
		/>
	);
};

export default Spinner;
