import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AuthError, MissingIdentityError, handleAuthCallback, login, requestPasswordRecovery, signup, updateUser } from "@netlify/identity";
import { AlertCircle, CheckCircle, Lock, Mail, User } from "lucide-react";
//#region src/routes/login.tsx?tsr-split=component
function AuthPage() {
	const [tab, setTab] = useState("login");
	const [loading, setLoading] = useState(false);
	const [notice, setNotice] = useState(null);
	const [recoveryMode, setRecoveryMode] = useState(false);
	const navigate = useNavigate();
	useEffect(() => {
		handleAuthCallback().then((result) => {
			if (!result) return;
			if (result.type === "confirmation") {
				setNotice({
					type: "success",
					message: "Email confirmed — you are now logged in."
				});
				navigate({ to: "/dashboard" });
			} else if (result.type === "recovery") {
				setRecoveryMode(true);
				setNotice({
					type: "success",
					message: "Identity verified. Please set a new password."
				});
			} else if (result.type === "oauth") navigate({ to: "/dashboard" });
		}).catch(() => {});
	}, [navigate]);
	function authError(err) {
		if (err instanceof MissingIdentityError) {
			setNotice({
				type: "error",
				message: "Identity is not configured. Ensure the site is deployed on Netlify."
			});
			return;
		}
		if (err instanceof AuthError) {
			const msg = err.status === 401 ? "Invalid email or password." : err.status === 403 ? "Signups are not allowed. Contact the administrator." : err.status === 422 ? "Invalid input — check your email and password." : err.message;
			setNotice({
				type: "error",
				message: msg
			});
			return;
		}
		setNotice({
			type: "error",
			message: "An unexpected error occurred."
		});
	}
	async function handleLogin(e) {
		e.preventDefault();
		setNotice(null);
		setLoading(true);
		const fd = new FormData(e.currentTarget);
		try {
			await login(fd.get("email"), fd.get("password"));
			navigate({ to: "/dashboard" });
		} catch (err) {
			authError(err);
		} finally {
			setLoading(false);
		}
	}
	async function handleSignup(e) {
		e.preventDefault();
		setNotice(null);
		const fd = new FormData(e.currentTarget);
		const password = fd.get("password");
		if (password !== fd.get("confirm")) {
			setNotice({
				type: "error",
				message: "Passwords do not match."
			});
			return;
		}
		if (password.length < 8) {
			setNotice({
				type: "error",
				message: "Password must be at least 8 characters."
			});
			return;
		}
		setLoading(true);
		try {
			if ((await signup(fd.get("email"), password, { full_name: fd.get("name") })).emailVerified) navigate({ to: "/dashboard" });
			else setNotice({
				type: "success",
				message: "Account created! Check your email to confirm your address."
			});
		} catch (err) {
			authError(err);
		} finally {
			setLoading(false);
		}
	}
	async function handleForgot(e) {
		e.preventDefault();
		setNotice(null);
		setLoading(true);
		const fd = new FormData(e.currentTarget);
		try {
			await requestPasswordRecovery(fd.get("email"));
			setNotice({
				type: "success",
				message: "Recovery email sent. Check your inbox."
			});
		} catch (err) {
			authError(err);
		} finally {
			setLoading(false);
		}
	}
	async function handleSetPassword(e) {
		e.preventDefault();
		setNotice(null);
		const password = new FormData(e.currentTarget).get("password");
		if (password.length < 8) {
			setNotice({
				type: "error",
				message: "Password must be at least 8 characters."
			});
			return;
		}
		setLoading(true);
		try {
			await updateUser({ password });
			setNotice({
				type: "success",
				message: "Password updated. Redirecting…"
			});
			setTimeout(() => navigate({ to: "/dashboard" }), 1200);
		} catch (err) {
			authError(err);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ jsx("div", {
			className: "w-full max-w-md",
			children: /* @__PURE__ */ jsxs("div", {
				className: "bg-white border border-gray-200 rounded-2xl shadow-sm p-8",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "text-2xl font-bold text-gray-900 text-center mb-2",
						children: recoveryMode ? "Set new password" : "SecureMsg"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-gray-500 text-center mb-8",
						children: recoveryMode ? "Enter a strong new password to secure your account." : "Encrypted messaging, authenticated access."
					}),
					notice && /* @__PURE__ */ jsxs("div", {
						className: `flex items-start gap-2 text-sm px-4 py-3 rounded-lg mb-6 ${notice.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`,
						children: [notice.type === "error" ? /* @__PURE__ */ jsx(AlertCircle, {
							size: 16,
							className: "shrink-0 mt-0.5"
						}) : /* @__PURE__ */ jsx(CheckCircle, {
							size: 16,
							className: "shrink-0 mt-0.5"
						}), notice.message]
					}),
					recoveryMode ? /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSetPassword,
						className: "space-y-4",
						children: [/* @__PURE__ */ jsx(Field, {
							label: "New password",
							icon: /* @__PURE__ */ jsx(Lock, { size: 16 }),
							children: /* @__PURE__ */ jsx("input", {
								name: "password",
								type: "password",
								required: true,
								minLength: 8,
								placeholder: "Minimum 8 characters",
								className: "input-field",
								autoComplete: "new-password"
							})
						}), /* @__PURE__ */ jsx(SubmitBtn, {
							loading,
							children: "Update password"
						})]
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex border-b border-gray-200 mb-6",
							children: [
								"login",
								"signup",
								"forgot"
							].map((t) => /* @__PURE__ */ jsx("button", {
								onClick: () => {
									setTab(t);
									setNotice(null);
								},
								className: `flex-1 py-2 text-sm font-medium transition-colors capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`,
								children: t === "forgot" ? "Forgot?" : t
							}, t))
						}),
						tab === "login" && /* @__PURE__ */ jsxs("form", {
							onSubmit: handleLogin,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Email",
									icon: /* @__PURE__ */ jsx(Mail, { size: 16 }),
									children: /* @__PURE__ */ jsx("input", {
										name: "email",
										type: "email",
										required: true,
										placeholder: "you@example.com",
										className: "input-field",
										autoComplete: "email"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Password",
									icon: /* @__PURE__ */ jsx(Lock, { size: 16 }),
									children: /* @__PURE__ */ jsx("input", {
										name: "password",
										type: "password",
										required: true,
										placeholder: "Your password",
										className: "input-field",
										autoComplete: "current-password"
									})
								}),
								/* @__PURE__ */ jsx(SubmitBtn, {
									loading,
									children: "Sign in"
								})
							]
						}),
						tab === "signup" && /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSignup,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Full name",
									icon: /* @__PURE__ */ jsx(User, { size: 16 }),
									children: /* @__PURE__ */ jsx("input", {
										name: "name",
										type: "text",
										required: true,
										placeholder: "Jane Smith",
										className: "input-field",
										autoComplete: "name"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Email",
									icon: /* @__PURE__ */ jsx(Mail, { size: 16 }),
									children: /* @__PURE__ */ jsx("input", {
										name: "email",
										type: "email",
										required: true,
										placeholder: "you@example.com",
										className: "input-field",
										autoComplete: "email"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Password",
									icon: /* @__PURE__ */ jsx(Lock, { size: 16 }),
									children: /* @__PURE__ */ jsx("input", {
										name: "password",
										type: "password",
										required: true,
										minLength: 8,
										placeholder: "Minimum 8 characters",
										className: "input-field",
										autoComplete: "new-password"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Confirm password",
									icon: /* @__PURE__ */ jsx(Lock, { size: 16 }),
									children: /* @__PURE__ */ jsx("input", {
										name: "confirm",
										type: "password",
										required: true,
										minLength: 8,
										placeholder: "Repeat your password",
										className: "input-field",
										autoComplete: "new-password"
									})
								}),
								/* @__PURE__ */ jsx(SubmitBtn, {
									loading,
									children: "Create account"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-gray-400 text-center",
									children: "A confirmation email will be sent to verify your address."
								})
							]
						}),
						tab === "forgot" && /* @__PURE__ */ jsxs("form", {
							onSubmit: handleForgot,
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Email",
								icon: /* @__PURE__ */ jsx(Mail, { size: 16 }),
								children: /* @__PURE__ */ jsx("input", {
									name: "email",
									type: "email",
									required: true,
									placeholder: "you@example.com",
									className: "input-field",
									autoComplete: "email"
								})
							}), /* @__PURE__ */ jsx(SubmitBtn, {
								loading,
								children: "Send recovery email"
							})]
						})
					] })
				]
			})
		})
	});
}
function Field({ label, icon, children }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
		className: "block text-sm font-medium text-gray-700 mb-1",
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx("span", {
			className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
			children: icon
		}), /* @__PURE__ */ jsx("div", {
			className: "[&>input]:w-full [&>input]:pl-9 [&>input]:pr-3 [&>input]:py-2 [&>input]:border [&>input]:border-gray-300 [&>input]:rounded-lg [&>input]:text-sm [&>input]:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-blue-500 [&>input]:focus:border-blue-500",
			children
		})]
	})] });
}
function SubmitBtn({ loading, children }) {
	return /* @__PURE__ */ jsx("button", {
		type: "submit",
		disabled: loading,
		className: "w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
		children: loading ? "Please wait…" : children
	});
}
//#endregion
export { AuthPage as component };
