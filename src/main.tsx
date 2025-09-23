import "./styles/Style.scss";
import "react-toastify/dist/ReactToastify.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import { ToastContainer } from "react-toastify";
import CardNav from "./pages/cardnav/CardNav";
import { AuthProvider } from "./context/AuthContext";
import { ChartProvider } from "./context/ChartContext";
// import ErrorBoundary from "./utils/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ChartProvider>
					<CardNav title="Rooms usage" />
					<ToastContainer
						position="top-right"
						autoClose={1000}
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
				</ChartProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
);
