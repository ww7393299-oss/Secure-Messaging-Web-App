import { a as markMessageRead, i as getSentMessages, n as getInboxMessages, r as getMessageById } from "./messages.functions-CpwBo2E6.js";
import { useEffect, useState } from "react";
import { HeadContent, Link, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent, redirect, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { getUser, logout, onAuthChange } from "@netlify/identity";
import { Inbox, LogOut, Mail, PenLine } from "lucide-react";
import { z } from "zod";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region src/components/NavBar.tsx
function NavBar() {
	const [email, setEmail] = useState(null);
	const [mounted, setMounted] = useState(false);
	const router = useRouter();
	useEffect(() => {
		setMounted(true);
		getUser().then((u) => setEmail(u?.email ?? null));
		return onAuthChange((_event, user) => {
			setEmail(user?.email ?? null);
		});
	}, []);
	const handleLogout = async () => {
		await logout();
		router.navigate({ to: "/login" });
	};
	return /* @__PURE__ */ jsx("header", {
		className: "border-b border-gray-200 bg-white sticky top-0 z-50",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "flex items-center gap-2 font-bold text-blue-600",
				children: [/* @__PURE__ */ jsx(Mail, { size: 20 }), "SecureMsg"]
			}), mounted && email ? /* @__PURE__ */ jsxs("nav", {
				className: "flex items-center gap-4",
				children: [
					/* @__PURE__ */ jsxs(Link, {
						to: "/dashboard",
						className: "flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors",
						children: [/* @__PURE__ */ jsx(Inbox, { size: 16 }), "Inbox"]
					}),
					/* @__PURE__ */ jsxs(Link, {
						to: "/compose",
						className: "flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors",
						children: [/* @__PURE__ */ jsx(PenLine, { size: 16 }), "Compose"]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-xs text-gray-400 max-w-[140px] truncate hidden sm:block",
						children: email
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: handleLogout,
						className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors",
						title: "Log out",
						children: [/* @__PURE__ */ jsx(LogOut, { size: 16 }), /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "Log out"
						})]
					})
				]
			}) : mounted ? /* @__PURE__ */ jsxs("nav", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx(Link, {
					to: "/login",
					className: "text-sm text-gray-600 hover:text-blue-600 transition-colors",
					children: "Log in"
				}), /* @__PURE__ */ jsx(Link, {
					to: "/login",
					className: "text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors",
					children: "Sign up"
				})]
			}) : null]
		})
	});
}
//#endregion
//#region src/routes/__root.tsx
var Route$6 = createRootRoute({
	head: () => ({ meta: [
		{ charSet: "utf-8" },
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1"
		},
		{ title: "SecureMsg — Encrypted Message Manager" },
		{
			name: "description",
			content: "End-to-end encrypted private messaging with secure authentication."
		}
	] }),
	shellComponent: RootDocument
});
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", {
			className: "bg-gray-50 min-h-screen",
			children: [
				/* @__PURE__ */ jsx(NavBar, {}),
				children,
				/* @__PURE__ */ jsx(Scripts, {})
			]
		})]
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$5 = () => import("./routes-DBr2xd1r.js");
var Route$5 = createFileRoute("/")({
	loader: async () => {
		if (await getUser()) throw redirect({ to: "/dashboard" });
		return {};
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
//#endregion
//#region src/routes/compose.tsx
var $$splitComponentImporter$4 = () => import("./compose-BSn_Fo3U.js");
var searchSchema = z.object({
	to: z.string().optional(),
	subject: z.string().optional()
});
var Route$4 = createFileRoute("/compose")({
	validateSearch: (search) => searchSchema.parse(search),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/dashboard.tsx
var $$splitComponentImporter$3 = () => import("./dashboard-BHcFDCZ0.js");
var Route$3 = createFileRoute("/dashboard")({
	loader: async () => {
		const [inbox, sent] = await Promise.all([getInboxMessages(), getSentMessages()]);
		return {
			inbox,
			sent
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/faq.tsx
var $$splitComponentImporter$2 = () => import("./faq-BnfNdMk6.js");
var Route$2 = createFileRoute("/faq")({
	loader: async () => {
		throw redirect({ to: "/dashboard" });
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/login.tsx
var $$splitComponentImporter$1 = () => import("./login-YKOz36h1.js");
var Route$1 = createFileRoute("/login")({
	loader: async () => {
		if (await getUser()) throw redirect({ to: "/dashboard" });
		return {};
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/message.$messageId.tsx
var $$splitComponentImporter = () => import("./message._messageId-tI1hmxbv.js");
var Route = createFileRoute("/message/$messageId")({
	loader: async ({ params }) => {
		const [message, user] = await Promise.all([getMessageById({ data: { id: params.messageId } }), getUser()]);
		if (message && user && message.toEmail === user.email.toLowerCase() && !message.read) await markMessageRead({ data: { id: params.messageId } });
		return {
			message,
			userEmail: user?.email ?? ""
		};
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	ComposeRoute: Route$4.update({
		id: "/compose",
		path: "/compose",
		getParentRoute: () => Route$6
	}),
	DashboardRoute: Route$3.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$6
	}),
	FaqRoute: Route$2.update({
		id: "/faq",
		path: "/faq",
		getParentRoute: () => Route$6
	}),
	LoginRoute: Route$1.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$6
	}),
	MessageMessageIdRoute: Route.update({
		id: "/message/$messageId",
		path: "/message/$messageId",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter, Route$4 as i, Route as n, Route$3 as r, router_exports as t };
