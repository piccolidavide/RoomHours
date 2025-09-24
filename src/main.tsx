import "./styles/Style.scss";
import "react-toastify/dist/ReactToastify.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { PdfProvider } from "./context/PdfContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import CardNav from "./pages/cardnav/CardNav";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<PdfProvider>
					<CardNav title="Rooms usage" />
					<ToastContainer // Generic toast settings
						position="top-right"
						autoClose={1000} // 1 second
						hideProgressBar={false}
						newestOnTop
						closeOnClick
						draggable={false}
						pauseOnHover
						theme="dark"
					/>
					<Routes>
						<Route path="/" element={<LoginPage />} />
						<Route path="/SignupPage" element={<SignupPage />} />
						<Route path="/HomePage" element={<HomePage />} />
					</Routes>
				</PdfProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
);
