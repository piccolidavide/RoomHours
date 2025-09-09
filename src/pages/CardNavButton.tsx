import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

interface CardNavButtonProps {
	to: string;
	label: string;
}

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
