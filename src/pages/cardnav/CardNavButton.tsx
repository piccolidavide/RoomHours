import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

interface CardNavButtonProps {
	to: string; // Path to navigate to
	label: string; // Label to display on the button
}

/**
 * A navigation button component that displays a button with a label and a link to a specified page.
 *
 * @param {string} to - Path to navigate to when the button is clicked
 * @param {string} label - The label to display on the button
 * @returns {JSX.Element} - The JSX element representing the CardNavButton component
 */
const CardNavButton: React.FC<CardNavButtonProps> = ({ to, label }) => {
	return (
		<Link to={to}>
			<Button variant="secondary" className="card-nav-cta-button">
				{label}
			</Button>
		</Link>
	);
};

export default CardNavButton;
