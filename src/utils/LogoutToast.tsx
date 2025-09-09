import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { signOut } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const LogoutToast = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<div className="w-100">
			<p>{user.user_metadata.username} sei sicuro di volere uscire?</p>
			<div className=" d-flex justify-content-end gap-2">
				<Button
					variant="secondary"
					className="toast-cancel-button"
					size="sm"
					onClick={() => toast.dismiss()}
				>
					Annulla
				</Button>
				<Button
					variant="secondary"
					className="toast-confirm-button"
					size="sm"
					onClick={async () => {
						try {
							await signOut();

							toast.dismiss();

							toast.success("Logout effettuato con successo!");

							navigate("/");
						} catch (error) {
							toast.error("Errore durante il logout.");
							console.error(error);
						}
					}}
				>
					Logout
				</Button>
			</div>
		</div>
	);
};
const handleLogout = () => {
	// Toast di conferma logout
	toast(<LogoutToast />, {
		position: "top-center",
		autoClose: false,
		closeOnClick: false,
		draggable: false,
		className: "cardnav-dropdown-toast-form",
	});
};

export default handleLogout;
