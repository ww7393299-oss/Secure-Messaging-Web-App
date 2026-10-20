import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION, t as createMiddleware } from "../server.js";
import { redirect } from "@tanstack/react-router";
import { getUser } from "@netlify/identity";
import { z } from "zod";
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/server/messages.functions.ts
var authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const user = await getUser();
	if (!user) throw redirect({ to: "/login" });
	return next({ user });
});
var getInboxMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ea6191f83e7f6962bfaef58721e9a15ccfc1d6bac0185ce40e62ed8a19feb00f"));
var getSentMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f1f907be24ab56ffa9a789e6aa54d1df16b1ca4e7940096e42838d7dedce5953"));
var getMessageById = createServerFn({ method: "GET" }).middleware([authMiddleware]).inputValidator(z.object({ id: z.string().uuid() })).handler(createSsrRpc("8d917d05635867c75e3a10c2da9516a16cb62eba638ed90149e54cff093a62e3"));
var sendMessageFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({
	toEmail: z.string().email("Recipient must be a valid email address").max(254),
	subject: z.string().min(1, "Subject is required").max(200, "Subject must be 200 characters or fewer"),
	body: z.string().min(1, "Message body is required").max(1e4, "Message must be 10,000 characters or fewer")
})).handler(createSsrRpc("59e76d017f9d4f046ea170137c787cb61efd5f2a501f9e9203a5a64cbaf21bfb"));
var markMessageRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({ id: z.string().uuid() })).handler(createSsrRpc("efddfcb549c01297e72ba017712a1d33de654b671cb6af3365cafc484664fa53"));
var deleteMessageFromFolder = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({
	id: z.string().uuid(),
	folder: z.enum(["inbox", "sent"])
})).handler(createSsrRpc("3fb32ad76f9232d14e47b6dfa3d2a95f64a1bfd5643b24c1b754b0131618a3bc"));
//#endregion
export { markMessageRead as a, getSentMessages as i, getInboxMessages as n, sendMessageFn as o, getMessageById as r, deleteMessageFromFolder as t };
