import { n as createServerFn, r as TSS_SERVER_FUNCTION, t as createMiddleware } from "../server.js";
import { redirect } from "@tanstack/react-router";
import { getUser } from "@netlify/identity";
import { z } from "zod";
import { getStore } from "@netlify/blobs";
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "crypto";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/server/crypto.server.ts
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 16;
var KEY_LENGTH = 32;
function getKey() {
	const hex = process.env.MESSAGE_ENCRYPTION_KEY;
	if (hex && hex.length === 64) return Buffer.from(hex, "hex");
	return Buffer.alloc(KEY_LENGTH, 0);
}
/**
* Encrypts a plaintext string with AES-256-GCM.
* Returns a colon-separated hex string: iv:authTag:ciphertext
*/
function encrypt(plaintext) {
	const key = getKey();
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		iv.toString("hex"),
		tag.toString("hex"),
		encrypted.toString("hex")
	].join(":");
}
/**
* Decrypts a ciphertext produced by `encrypt`.
* Verifies the GCM authentication tag — throws on tampering.
*/
function decrypt(ciphertext) {
	const key = getKey();
	const parts = ciphertext.split(":");
	if (parts.length !== 3) throw new Error("Invalid ciphertext format");
	const [ivHex, tagHex, encHex] = parts;
	const iv = Buffer.from(ivHex, "hex");
	const tag = Buffer.from(tagHex, "hex");
	const enc = Buffer.from(encHex, "hex");
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
//#endregion
//#region src/server/messages.server.ts
/** Converts an email into a safe blob key segment. */
function emailSlug(email) {
	return email.toLowerCase().replace(/[^a-z0-9]/g, "-");
}
function messageStore() {
	return getStore({
		name: "secure-messages",
		consistency: "strong"
	});
}
function indexStore() {
	return getStore({
		name: "message-indexes",
		consistency: "strong"
	});
}
async function saveMessage(params) {
	const id = randomUUID();
	const msg = {
		id,
		fromEmail: params.fromEmail.toLowerCase(),
		fromId: params.fromId,
		toEmail: params.toEmail.toLowerCase(),
		subject: params.subject,
		encryptedBody: encrypt(params.body),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		read: false
	};
	const ms = messageStore();
	const ix = indexStore();
	await ms.setJSON(`msg:${id}`, msg);
	const sentKey = `sent:${emailSlug(params.fromEmail)}`;
	const sentIds = await ix.get(sentKey, { type: "json" }) ?? [];
	sentIds.unshift(id);
	await ix.setJSON(sentKey, sentIds);
	const inboxKey = `inbox:${emailSlug(params.toEmail)}`;
	const inboxIds = await ix.get(inboxKey, { type: "json" }) ?? [];
	inboxIds.unshift(id);
	await ix.setJSON(inboxKey, inboxIds);
	return id;
}
async function fetchRawMessage(id) {
	return await messageStore().get(`msg:${id}`, { type: "json" });
}
async function getMessageDetail(id, requestingEmail) {
	const msg = await fetchRawMessage(id);
	if (!msg) return null;
	const email = requestingEmail.toLowerCase();
	if (msg.fromEmail !== email && msg.toEmail !== email) return null;
	return {
		id: msg.id,
		fromEmail: msg.fromEmail,
		toEmail: msg.toEmail,
		subject: msg.subject,
		body: decrypt(msg.encryptedBody),
		createdAt: msg.createdAt,
		read: msg.read
	};
}
async function listMessages(folder, email) {
	const ix = indexStore();
	const ms = messageStore();
	const key = `${folder}:${emailSlug(email)}`;
	const ids = await ix.get(key, { type: "json" }) ?? [];
	return (await Promise.all(ids.map(async (id) => {
		const msg = await ms.get(`msg:${id}`, { type: "json" });
		if (!msg) return null;
		return {
			id: msg.id,
			fromEmail: msg.fromEmail,
			toEmail: msg.toEmail,
			subject: msg.subject,
			createdAt: msg.createdAt,
			read: msg.read
		};
	}))).filter((m) => m !== null);
}
function getInbox(email) {
	return listMessages("inbox", email);
}
function getSent(email) {
	return listMessages("sent", email);
}
async function markRead(id, userEmail) {
	const ms = messageStore();
	const msg = await ms.get(`msg:${id}`, { type: "json" });
	if (!msg || msg.toEmail !== userEmail.toLowerCase()) return;
	if (msg.read) return;
	msg.read = true;
	await ms.setJSON(`msg:${id}`, msg);
}
async function removeFromIndex(id, folder, userEmail) {
	const ix = indexStore();
	const key = `${folder}:${emailSlug(userEmail)}`;
	const ids = await ix.get(key, { type: "json" }) ?? [];
	await ix.setJSON(key, ids.filter((i) => i !== id));
}
//#endregion
//#region src/server/messages.functions.ts?tss-serverfn-split
var authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const user = await getUser();
	if (!user) throw redirect({ to: "/login" });
	return next({ user });
});
var getInboxMessages_createServerFn_handler = createServerRpc({
	id: "ea6191f83e7f6962bfaef58721e9a15ccfc1d6bac0185ce40e62ed8a19feb00f",
	name: "getInboxMessages",
	filename: "src/server/messages.functions.ts"
}, (opts) => getInboxMessages.__executeServer(opts));
var getInboxMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getInboxMessages_createServerFn_handler, async ({ context }) => {
	const { user } = context;
	return getInbox(user.email);
});
var getSentMessages_createServerFn_handler = createServerRpc({
	id: "f1f907be24ab56ffa9a789e6aa54d1df16b1ca4e7940096e42838d7dedce5953",
	name: "getSentMessages",
	filename: "src/server/messages.functions.ts"
}, (opts) => getSentMessages.__executeServer(opts));
var getSentMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSentMessages_createServerFn_handler, async ({ context }) => {
	const { user } = context;
	return getSent(user.email);
});
var getMessageById_createServerFn_handler = createServerRpc({
	id: "8d917d05635867c75e3a10c2da9516a16cb62eba638ed90149e54cff093a62e3",
	name: "getMessageById",
	filename: "src/server/messages.functions.ts"
}, (opts) => getMessageById.__executeServer(opts));
var getMessageById = createServerFn({ method: "GET" }).middleware([authMiddleware]).inputValidator(z.object({ id: z.string().uuid() })).handler(getMessageById_createServerFn_handler, async ({ data, context }) => {
	const { user } = context;
	const message = await getMessageDetail(data.id, user.email);
	if (!message) throw new Error("Message not found or access denied");
	return message;
});
var sendMessageFn_createServerFn_handler = createServerRpc({
	id: "59e76d017f9d4f046ea170137c787cb61efd5f2a501f9e9203a5a64cbaf21bfb",
	name: "sendMessageFn",
	filename: "src/server/messages.functions.ts"
}, (opts) => sendMessageFn.__executeServer(opts));
var sendMessageFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({
	toEmail: z.string().email("Recipient must be a valid email address").max(254),
	subject: z.string().min(1, "Subject is required").max(200, "Subject must be 200 characters or fewer"),
	body: z.string().min(1, "Message body is required").max(1e4, "Message must be 10,000 characters or fewer")
})).handler(sendMessageFn_createServerFn_handler, async ({ data, context }) => {
	const { user } = context;
	return { id: await saveMessage({
		fromEmail: user.email,
		fromId: user.id,
		toEmail: data.toEmail,
		subject: data.subject,
		body: data.body
	}) };
});
var markMessageRead_createServerFn_handler = createServerRpc({
	id: "efddfcb549c01297e72ba017712a1d33de654b671cb6af3365cafc484664fa53",
	name: "markMessageRead",
	filename: "src/server/messages.functions.ts"
}, (opts) => markMessageRead.__executeServer(opts));
var markMessageRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({ id: z.string().uuid() })).handler(markMessageRead_createServerFn_handler, async ({ data, context }) => {
	const { user } = context;
	await markRead(data.id, user.email);
	return { ok: true };
});
var deleteMessageFromFolder_createServerFn_handler = createServerRpc({
	id: "3fb32ad76f9232d14e47b6dfa3d2a95f64a1bfd5643b24c1b754b0131618a3bc",
	name: "deleteMessageFromFolder",
	filename: "src/server/messages.functions.ts"
}, (opts) => deleteMessageFromFolder.__executeServer(opts));
var deleteMessageFromFolder = createServerFn({ method: "POST" }).middleware([authMiddleware]).inputValidator(z.object({
	id: z.string().uuid(),
	folder: z.enum(["inbox", "sent"])
})).handler(deleteMessageFromFolder_createServerFn_handler, async ({ data, context }) => {
	const { user } = context;
	await removeFromIndex(data.id, data.folder, user.email);
	return { ok: true };
});
//#endregion
export { deleteMessageFromFolder_createServerFn_handler, getInboxMessages_createServerFn_handler, getMessageById_createServerFn_handler, getSentMessages_createServerFn_handler, markMessageRead_createServerFn_handler, sendMessageFn_createServerFn_handler };
