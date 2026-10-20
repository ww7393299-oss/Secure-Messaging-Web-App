import { t as deleteMessageFromFolder } from "./messages.functions-CpwBo2E6.js";
import { n as Route } from "./router-BGHOEk5s.js";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, Lock, Reply, Trash2 } from "lucide-react";
//#region src/routes/message.$messageId.tsx?tsr-split=component
function MessageView() {
	const { message, userEmail } = Route.useLoaderData();
	const navigate = useNavigate();
	const [deleting, setDeleting] = useState(false);
	if (!message) return /* @__PURE__ */ jsx("div", {
		className: "max-w-2xl mx-auto px-4 py-16 text-center text-gray-400",
		children: "Message not found or you do not have access."
	});
	const folder = message.toEmail === userEmail.toLowerCase() ? "inbox" : "sent";
	async function handleDelete() {
		setDeleting(true);
		try {
			await deleteMessageFromFolder({ data: {
				id: message.id,
				folder
			} });
			navigate({ to: "/dashboard" });
		} catch {
			setDeleting(false);
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-2xl mx-auto px-4 py-8",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between mb-6",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/dashboard",
				className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 16 }), "Back to inbox"]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsxs(Link, {
					to: "/compose",
					search: {
						to: message.fromEmail,
						subject: `Re: ${message.subject}`
					},
					className: "flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors",
					children: [/* @__PURE__ */ jsx(Reply, { size: 15 }), "Reply"]
				}), /* @__PURE__ */ jsxs("button", {
					onClick: handleDelete,
					disabled: deleting,
					className: "flex items-center gap-1.5 text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors",
					children: [/* @__PURE__ */ jsx(Trash2, { size: 15 }), deleting ? "Deleting…" : "Delete"]
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "bg-white border border-gray-200 rounded-xl overflow-hidden",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "px-6 py-5 border-b border-gray-100",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-xl font-semibold text-gray-900 mb-4",
						children: message.subject
					}), /* @__PURE__ */ jsxs("dl", {
						className: "space-y-1 text-sm",
						children: [
							/* @__PURE__ */ jsx(MetaRow, {
								label: "From",
								value: message.fromEmail
							}),
							/* @__PURE__ */ jsx(MetaRow, {
								label: "To",
								value: message.toEmail
							}),
							/* @__PURE__ */ jsx(MetaRow, {
								label: "Date",
								value: new Date(message.createdAt).toLocaleString([], {
									dateStyle: "medium",
									timeStyle: "short"
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "px-6 py-5",
					children: /* @__PURE__ */ jsx("pre", {
						className: "whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed",
						children: message.body
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "px-6 py-3 bg-gray-50 border-t border-gray-100",
					children: /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full",
						children: [/* @__PURE__ */ jsx(Lock, { size: 11 }), "Decrypted from AES-256-GCM"]
					})
				})
			]
		})]
	});
}
function MetaRow({ label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ jsx("dt", {
			className: "w-12 text-gray-400 shrink-0",
			children: label
		}), /* @__PURE__ */ jsx("dd", {
			className: "text-gray-700",
			children: value
		})]
	});
}
//#endregion
export { MessageView as component };
