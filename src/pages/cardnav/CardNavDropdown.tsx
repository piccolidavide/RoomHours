import { NavDropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import handleUploadData from "../../utils/gui_add_ons/UploadDataToast";
import handleLogout from "../../utils/gui_add_ons/LogoutToast";
import { toast } from "react-toastify";

interface CardNavButtonProps {
	username: string | null;
}

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
			<NavDropdown.Item
				onClick={() =>
					toast.error("Funzionalità non ancora implementata", {
						autoClose: 1000,
						theme: "dark",
					})
				}
			>
				Settings
			</NavDropdown.Item>
			<NavDropdown.Item onClick={handleUploadData}>Upload</NavDropdown.Item>
			<NavDropdown.Divider />
			<NavDropdown.Item onClick={() => handleLogout(username)}>Logout</NavDropdown.Item>
		</NavDropdown>
	);
};

export default CardNavButton;
