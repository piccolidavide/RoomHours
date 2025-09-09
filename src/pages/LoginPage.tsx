import { useState } from "react";
import { signIn } from "../services/supabase";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	/* const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null); */
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			toast.error("Tutti i campi sono obbligatori.");
			return;
		}
		if (!email.includes("@") || !email.includes(".")) {
			toast.error("Inserisci un indirizzo email valido.");
			return;
		}

		try {
			const { user: userData } = await signIn(email, password);

			toast.success("Benvenuto " + userData.user_metadata.username, {
				autoClose: 2000,
			});
			navigate("/HomePage");
		} catch (error: any) {
			toast.error("Errore durante il login!");
			console.error(error);
		}
	};

	return (
		<Container className="mt-5">
			<Row className="justify-content-center">
				<Col md={4}>
					<Card className="form-card">
						<Card.Body>
							<h3 className="text-center mb-4">
								Login to your account
							</h3>
							<Form onSubmit={handleLogin}>
								<Form.Group className="mb-4" controlId="email">
									{/* <Form.Label>Email</Form.Label> */}
									<Form.Control
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										placeholder="Inserisci la tua email"
										required
									/>
								</Form.Group>
								<Form.Group
									className="mb-4"
									controlId="password"
								>
									{/* <Form.Label>Password</Form.Label> */}
									<Form.Control
										type="password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										placeholder="Inserisci la tua password"
										required
									/>
								</Form.Group>
								<Button
									variant="primary"
									type="submit"
									className="w-100"
								>
									Login
								</Button>
								<p className="text-center mt-3">
									Non hai un account?{" "}
									<Link to="/SignupPage">Registrati</Link>
								</p>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}
