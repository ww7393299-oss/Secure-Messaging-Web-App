import { o as sendMessageFn } from "./messages.functions-CpwBo2E6.js";
import { i as Route } from "./router-BGHOEk5s.js";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, ArrowLeft, Send } from "lucide-react";
//#region src/routes/compose.tsx?tsr-split=component
var MAX_BODY = 1e4;
var MAX_SUBJECT = 200;
function Compose() {
	const navigate = useNavigate();
	const { to, subject } = Route.useSearch();
	const [error, setError] = useState(null);
	const [sending, setSending] = useState(false);
	const [bodyLen, setBodyLen] = useState(0);
	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		const fd = new FormData(e.currentTarget);
		const toEmail = fd.get("toEmail").trim();
		const subjectVal = fd.get("subject").trim();
		const body = fd.get("body").trim();
		if (!toEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			setError("Recipient must be a valid email address.");
			return;
		}
		if (!subjectVal) {
			setError("Subject is required.");
			return;
		}
		if (subjectVal.length > MAX_SUBJECT) {
			setError(`Subject must be ${MAX_SUBJECT} characters or fewer.`);
			return;
		}
		if (!body) {
			setError("Message body is required.");
			return;
		}
		if (body.length > MAX_BODY) {
			setError(`Message must be ${MAX_BODY.toLocaleString()} characters or fewer.`);
			return;
		}
		setSending(true);
		try {
			await sendMessageFn({ data: {
				toEmail,
				subject: subjectVal,
				body
			} });
			navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
		} finally {
			setSending(false);
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-2xl mx-auto px-4 py-8",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3 mb-6",
				children: [/* @__PURE__ */ jsx(Link, {
					to: "/dashboard",
					className: "p-2 text-gray-400 hover:text-gray-600 transition-colors",
					title: "Back to inbox",
					children: /* @__PURE__ */ jsx(ArrowLeft, { size: 20 })
				}), /* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold text-gray-900",
					children: "New Message"
				})]
			}),
			error && /* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6",
				children: [/* @__PURE__ */ jsx(AlertCircle, {
					size: 16,
					className: "shrink-0 mt-0.5"
				}), error]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "bg-white border border-gray-200 rounded-xl overflow-hidden",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "divide-y divide-gray-100",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center px-4 py-3 gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium text-gray-500 w-16 shrink-0",
								children: "To"
							}), /* @__PURE__ */ jsx("input", {
								name: "toEmail",
								type: "email",
								required: true,
								defaultValue: to ?? "",
								placeholder: "recipient@example.com",
								className: "flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400",
								autoComplete: "email",
								autoFocus: !to
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center px-4 py-3 gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium text-gray-500 w-16 shrink-0",
								children: "Subject"
							}), /* @__PURE__ */ jsx("input", {
								name: "subject",
								type: "text",
								required: true,
								maxLength: MAX_SUBJECT,
								defaultValue: subject ?? "",
								placeholder: "What is this about?",
								className: "flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400"
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ jsx("textarea", {
								name: "body",
								required: true,
								maxLength: MAX_BODY,
								rows: 12,
								placeholder: "Write your message here…",
								className: "w-full text-sm outline-none text-gray-900 placeholder:text-gray-400 resize-none",
								onChange: (e) => setBodyLen(e.target.value.length)
							})
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "text-xs text-gray-400",
						children: [
							bodyLen.toLocaleString(),
							" / ",
							MAX_BODY.toLocaleString(),
							" characters"
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx(Link, {
							to: "/dashboard",
							className: "text-sm text-gray-500 hover:text-gray-700 transition-colors",
							children: "Cancel"
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: sending,
							className: "flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
							children: [/* @__PURE__ */ jsx(Send, { size: 15 }), sending ? "Sending…" : "Send"]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xs text-gray-400 text-center mt-4",
				children: "Messages are encrypted with AES-256-GCM before storage."
			})
		]
	});
}
//#endregion
export { Compose as component };
