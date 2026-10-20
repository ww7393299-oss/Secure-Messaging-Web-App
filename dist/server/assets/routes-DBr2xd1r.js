import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, Key, Lock, Shield } from "lucide-react";
//#region src/routes/index.tsx?tsr-split=component
function Landing() {
	return /* @__PURE__ */ jsxs("main", {
		className: "max-w-4xl mx-auto px-4 py-16 text-center",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6",
				children: [/* @__PURE__ */ jsx(Lock, { size: 14 }), "AES-256-GCM encrypted messaging"]
			}),
			/* @__PURE__ */ jsxs("h1", {
				className: "text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6",
				children: [
					"Private messages,",
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("span", {
						className: "text-blue-600",
						children: "truly secure."
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xl text-gray-500 max-w-2xl mx-auto mb-10",
				children: "SecureMsg encrypts every message with AES-256-GCM before storage, protects access with authenticated sessions, and guards against XSS, CSRF, and injection attacks."
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row gap-4 justify-center mb-20",
				children: [/* @__PURE__ */ jsxs(Link, {
					to: "/login",
					className: "inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors",
					children: ["Get Started Free ", /* @__PURE__ */ jsx(ArrowRight, { size: 18 })]
				}), /* @__PURE__ */ jsx(Link, {
					to: "/login",
					className: "inline-flex items-center justify-center px-8 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors",
					children: "Sign In"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid md:grid-cols-3 gap-6 text-left",
				children: [
					/* @__PURE__ */ jsx(SecurityCard, {
						icon: /* @__PURE__ */ jsx(Lock, {
							size: 24,
							className: "text-blue-600"
						}),
						title: "Encrypted at Rest",
						body: "Messages are encrypted with AES-256-GCM before being written to storage. Each message uses a unique IV and includes a GCM auth tag to detect tampering."
					}),
					/* @__PURE__ */ jsx(SecurityCard, {
						icon: /* @__PURE__ */ jsx(Shield, {
							size: 24,
							className: "text-green-600"
						}),
						title: "Authenticated Access",
						body: "Every request is verified via Netlify Identity JWT tokens. Unauthenticated and unauthorized requests are rejected server-side before any data is accessed."
					}),
					/* @__PURE__ */ jsx(SecurityCard, {
						icon: /* @__PURE__ */ jsx(Key, {
							size: 24,
							className: "text-purple-600"
						}),
						title: "Defense in Depth",
						body: "Security headers (CSP, HSTS, X-Frame-Options), Zod input validation, SameSite cookies for CSRF prevention, and no SQL — no injection surface."
					})
				]
			})
		]
	});
}
function SecurityCard({ icon, title, body }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-white border border-gray-200 rounded-xl p-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-3",
				children: icon
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "font-semibold text-gray-900 mb-2",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 leading-relaxed",
				children: body
			})
		]
	});
}
//#endregion
export { Landing as component };
