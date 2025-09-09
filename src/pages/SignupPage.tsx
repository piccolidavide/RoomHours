import { useState } from "react";
import { Link, useNavigate /* , Link  */ } from "react-router-dom";
import { signUp } from "../services/supabase";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";

function SignupPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [age, setAge] = useState("");
	// const [error, setError] = useState<string | null>(null);
	// const [success, setSuccess] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!username || !email || !password || !age) {
			toast.error("Tutti i campi sono obbligatori.");
			return;
		}
		if (isNaN(parseInt(age)) || parseInt(age) <= 0) {
			toast.error("Inserisci un'età valida.");
			return;
		}
		if (!email.includes("@") || !email.includes(".")) {
			toast.error("Inserisci un indirizzo email valido.");
			return;
		}
		if (password.length < 6) {
			toast.error("La password deve essere lunga almeno 6 caratteri.");
			return;
		}

		try {
			// Chiama la funzione di registrazione definita in supabase.ts
			const { user: userData } = await signUp(
				username,
				parseInt(age),
				email,
				password,
			);

			toast.success("Benvenuto " + userData.user_metadata.username, {
				autoClose: 2000,
			});

			navigate("/HomePage");
		} catch (err: any) {
			toast.error("Errore durante la registrazione: " + err.message);
			console.error(err);
		}
	};

	return (
		<Container className="mt-5">
			<Row className="justify-content-center">
				<Col md={4}>
					<Card className="form-card">
						<Card.Body>
							<h4 className="text-center mb-4">
								Create your account
							</h4>
							<Form onSubmit={handleSignup}>
								<Form.Group
									className="mb-3"
									controlId="username"
								>
									{/* <Form.Label>Username</Form.Label> */}
									<Form.Control
										type="text"
										value={username}
										onChange={(e) =>
											setUsername(e.target.value)
										}
										placeholder="Inserisci il tuo username"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="age">
									{/* <Form.Label>Età</Form.Label> */}
									<Form.Control
										type="number"
										value={age}
										onChange={(e) => setAge(e.target.value)}
										placeholder="Inserisci la tua età"
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="email">
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
									className="mb-3"
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
									Registrati
								</Button>
								<p className="text-center mt-3">
									Hai già un account?{" "}
									<Link to="/">Login</Link>
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
