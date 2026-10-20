import { t as deleteMessageFromFolder } from "./messages.functions-CpwBo2E6.js";
import { r as Route } from "./router-BGHOEk5s.js";
import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Inbox, PenLine, RefreshCw, Send, Trash2 } from "lucide-react";
//#region src/routes/dashboard.tsx?tsr-split=component
function Dashboard() {
	const { inbox, sent } = Route.useLoaderData();
	const [folder, setFolder] = useState("inbox");
	const [localInbox, setLocalInbox] = useState(inbox);
	const [localSent, setLocalSent] = useState(sent);
	const [deleting, setDeleting] = useState(null);
	const router = useRouter();
	const messages = folder === "inbox" ? localInbox : localSent;
	const unreadCount = localInbox.filter((m) => !m.read).length;
	async function handleDelete(id) {
		setDeleting(id);
		try {
			await deleteMessageFromFolder({ data: {
				id,
				folder
			} });
			if (folder === "inbox") setLocalInbox((prev) => prev.filter((m) => m.id !== id));
			else setLocalSent((prev) => prev.filter((m) => m.id !== id));
		} catch {} finally {
			setDeleting(null);
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-3xl mx-auto px-4 py-8",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between mb-6",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold text-gray-900",
					children: "Messages"
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => router.invalidate(),
						className: "p-2 text-gray-400 hover:text-gray-600 transition-colors",
						title: "Refresh",
						children: /* @__PURE__ */ jsx(RefreshCw, { size: 18 })
					}), /* @__PURE__ */ jsxs(Link, {
						to: "/compose",
						className: "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors",
						children: [/* @__PURE__ */ jsx(PenLine, { size: 16 }), "Compose"]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex border-b border-gray-200 mb-4",
				children: [/* @__PURE__ */ jsxs("button", {
					onClick: () => setFolder("inbox"),
					className: `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${folder === "inbox" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`,
					children: [
						/* @__PURE__ */ jsx(Inbox, { size: 16 }),
						"Inbox",
						unreadCount > 0 && /* @__PURE__ */ jsx("span", {
							className: "bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full",
							children: unreadCount
						})
					]
				}), /* @__PURE__ */ jsxs("button", {
					onClick: () => setFolder("sent"),
					className: `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${folder === "sent" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`,
					children: [/* @__PURE__ */ jsx(Send, { size: 16 }), "Sent"]
				})]
			}),
			messages.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "text-center py-16 text-gray-400",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-lg font-medium mb-1",
					children: "No messages"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm",
					children: folder === "inbox" ? "Your inbox is empty." : "You have not sent any messages yet."
				})]
			}) : /* @__PURE__ */ jsx("ul", {
				className: "divide-y divide-gray-100 bg-white border border-gray-200 rounded-xl overflow-hidden",
				children: messages.map((msg) => /* @__PURE__ */ jsx(MessageRow, {
					msg,
					folder,
					onDelete: () => handleDelete(msg.id),
					isDeleting: deleting === msg.id
				}, msg.id))
			})
		]
	});
}
function MessageRow({ msg, folder, onDelete, isDeleting }) {
	const isUnread = !msg.read && folder === "inbox";
	return /* @__PURE__ */ jsxs("li", {
		className: "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group",
		children: [
			/* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full shrink-0 ${isUnread ? "bg-blue-600" : "bg-transparent"}` }),
			/* @__PURE__ */ jsxs(Link, {
				to: "/message/$messageId",
				params: { messageId: msg.id },
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-baseline justify-between gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: `text-sm truncate ${isUnread ? "font-semibold text-gray-900" : "text-gray-700"}`,
						children: folder === "inbox" ? `From: ${msg.fromEmail}` : `To: ${msg.toEmail}`
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-gray-400 shrink-0",
						children: formatDate(msg.createdAt)
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: `text-sm truncate mt-0.5 ${isUnread ? "text-gray-800" : "text-gray-500"}`,
					children: msg.subject
				})]
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: (e) => {
					e.preventDefault();
					onDelete();
				},
				disabled: isDeleting,
				className: "p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40",
				title: "Delete",
				children: /* @__PURE__ */ jsx(Trash2, { size: 16 })
			})
		]
	});
}
function formatDate(iso) {
	const d = new Date(iso);
	const now = /* @__PURE__ */ new Date();
	if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
	return d.toLocaleDateString([], {
		month: "short",
		day: "numeric"
	});
}
//#endregion
export { Dashboard as component };
