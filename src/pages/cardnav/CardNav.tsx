import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Navbar } from "react-bootstrap";
import CardNavButton from "./CardNavButton";
import CardNavDropdown from "./CardNavDropdown";
import { useAuth } from "../../context/useAuth";
import Logo from "../../assets/logo.svg";
import Spinner from "../../utils/gui_add_ons/Spinner";

interface CardNavProps {
	title: string;
}

interface CardNavButtonConfig {
	to: string;
	label: string;
}

const getNavButtonConfig = (isLoginPage: boolean, isSignupPage: boolean): CardNavButtonConfig | null => {
	if (isLoginPage) return { to: "/SignupPage", label: "Registrati" };
	if (isSignupPage) return { to: "/", label: "Login" };
	return null;
};

const CardNav: React.FC<CardNavProps> = ({ title }) => {
	const { user, loading } = useAuth();
	const location = useLocation();
	const isLoginPage = location.pathname === "/";
	const isSignupPage = location.pathname === "/SignupPage";
	const isHomePage = location.pathname === "/HomePage";

	const navButtonConfig = getNavButtonConfig(isLoginPage, isSignupPage);

	if (loading) {
		return <Spinner />;
	}

	return (
		<Navbar expand="lg" className="card-nav-container">
			<Container fluid className="card-nav-top">
				<div className="navbar-logo-container">
					<img src={Logo} alt="Logo" />
				</div>
				<div className="navbar-brand-container">
					<Navbar.Brand as="h1" className="text-primary">
						{title}
					</Navbar.Brand>
				</div>
				<div className="cta-button-container">
					{isHomePage && <CardNavDropdown username={user?.user_metadata.username ?? "Utente"} />}
					{navButtonConfig && (
						<CardNavButton to={navButtonConfig.to} label={navButtonConfig.label} />
					)}
				</div>
			</Container>
		</Navbar>
	);
};

export default CardNav;
