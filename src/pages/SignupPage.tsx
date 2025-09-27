import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/supabase";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * SignupPage component.
 * Allows users to create a new account with username, age, email, and password.
 *
 * @returns {JSX.Element} - The JSX element representing the SignupPage component.
 */
function SignupPage() {
	const [username, setUsername] = useState(""); // State to hold the username input
	const [age, setAge] = useState(""); // State to hold the age input
	const [email, setEmail] = useState(""); // State to hold the email input
	const [password, setPassword] = useState(""); // State to hold the password input
	const [confirmPassword, setConfirmPassword] = useState(""); // State to hold the confirm password input
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate(); // Hook to navigate to different pages

	/**
	 * Handles the signup form submission.
	 * Validates the input fields and attempts to sign up the user using the Supabase client
	 *
	 * If successful, displays a success toast and navigates to the HomePage.
	 * If not, displays an error toast with the error message.
	 */
	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validates input
		if (!username || !email || !password || !confirmPassword || !age) {
			toast.error("All fields are required.");
			return;
		}
		if (isNaN(parseInt(age)) || parseInt(age) <= 0) {
			toast.error("You must enter a valid age.");
			return;
		}
		if (!email.includes("@") || !email.includes(".")) {
			toast.error("You must enter a valid email address.");
			return;
		}
		if (password.length < 6) {
			toast.error("Password has to be at least 6 characters long.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Inserted password are not equal");
			return;
		}

		try {
			// Attempt to sign up the user using the Supabase client
			const { user: userData } = await signUp(username, parseInt(age), email, password);

			toast.success("Welcome " + userData.user_metadata.username, {
				autoClose: 2000,
			});

			navigate("/HomePage"); // Navigate to HomePage on successful signup
		} catch (err: any) {
			toast.error("Error during signup: " + err.message);
			console.error(err);
		}
	};

	// Render the signup form
	return (
		<Container className="mt-5 min-vh-100 align-items-center">
			<Row className="justify-content-center">
				<Col md={4} className="w-100">
					<Card className="form-card">
						<Card.Body>
							<h4 className="text-center mb-4">Create your account</h4>
							<Form onSubmit={handleSignup}>
								<Form.Group className="mb-3" controlId="username">
									<Form.Control
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										placeholder="Enter username"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="age">
									<Form.Control
										type="number"
										value={age}
										onChange={(e) => setAge(e.target.value)}
										placeholder="Enter age"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="email">
									<Form.Control
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter email"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="password">
									<Form.Control
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter password"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-1" controlId="confirmPassword">
									<Form.Control
										type={showPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Confirm password"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Check
										type="checkbox"
										label="show password"
										checked={showPassword}
										onChange={(e) => setShowPassword(e.target.checked)}
									/>
								</Form.Group>
								<Button variant="primary" type="submit" className="w-100">
									Sign up
								</Button>
								<p className="text-center mt-3">
									Already have an account? <Link to="/">Login</Link>
								</p>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export default SignupPage;
