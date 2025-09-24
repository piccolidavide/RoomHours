import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Navbar } from "react-bootstrap";
import { useAuth } from "../../context/useAuth";
import Logo from "../../assets/logo.svg";
import CardNavButton from "./CardNavButton";
import CardNavDropdown from "./CardNavDropdown";
import Spinner from "../../utils/gui_add_ons/Spinner";

interface CardNavProps {
	title: string; // Title to be displayed in the navigation bar
}

// Navigation button configuration based on the current page
interface CardNavButtonConfig {
	to: string;
	label: string;
}

/**
 * Determines the navigation button configuration based on the current page.
 *
 * @param {boolean} isLoginPage if the current page is the login page
 * @param {boolean} isSignupPage if the current page is the signup page
 * @returns the navigation button configuration or null if no button is needed
 */
const getNavButtonConfig = (isLoginPage: boolean, isSignupPage: boolean): CardNavButtonConfig | null => {
	if (isLoginPage) return { to: "/SignupPage", label: "Signup" }; // If in login page, button to SignupPage
	if (isSignupPage) return { to: "/", label: "Login" }; // If in signup page, button to LoginPage

	return null;
};

/**
 * A navigation bar component that displays the title of the current page.
 *
 * If the user is logged in, it displays a dropdown menu with the username and logout button.
 * If the user is on the login page, it displays a button to the signup page.
 * If the user is on the signup page, it displays a button to the login page.
 *
 * @param {string} title - The title of the application
 */
const CardNav: React.FC<CardNavProps> = ({ title }) => {
	const { user, loading } = useAuth(); // context for the user to stay updated on its state
	const location = useLocation(); // Hook to get the current location
	const isLoginPage = location.pathname === "/"; // Check if the current page is the login page
	const isSignupPage = location.pathname === "/SignupPage"; // Check if the current page is the signup page
	const isHomePage = location.pathname === "/HomePage"; // Check if the current page is the home page

	// Get the navigation button configuration based on the current page
	const navButtonConfig = getNavButtonConfig(isLoginPage, isSignupPage);

	if (loading) {
		return <Spinner />; // Show a spinner while loading the user state
	}

	// Render the navigation bar with all its components, logo on the left, title in the center and button on the right
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
