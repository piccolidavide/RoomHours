import { NavDropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import handleUploadData from "../../utils/gui_add_ons/UploadDataToast";
import handleLogout from "../../utils/gui_add_ons/LogoutToast";
import ExportPDF from "../../utils/gui_add_ons/ExportPdf";

interface CardNavButtonProps {
	username: string | null; // Username to be displayed in the dropdown
}

/**
 * Navbar button component rendered when the user is in the HomePage.
 *
 * Displays a dropdown menu with the actions: Upload Data, Export PDF, Logout.
 *
 * @param username the username of the logged-in user
 * @returns
 */
const CardNavButton: React.FC<CardNavButtonProps> = ({ username }) => {
	return (
		<NavDropdown
			title={
				<div className="d-flex align-items-center">
					<FaUserCircle size={20} className="me-2" />
					<span>{username || "Utente"}</span>
				</div>
			}
			id="user-dropdown"
			align="end" // Allinea il menu a destra
			className="card-nav-cta-button"
		>
			<NavDropdown.Item onClick={handleUploadData}>Upload</NavDropdown.Item>
			<ExportPDF />
			<NavDropdown.Divider />
			<NavDropdown.Item onClick={() => handleLogout(username)}>Logout</NavDropdown.Item>
		</NavDropdown>
	);
};

export default CardNavButton;
