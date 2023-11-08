import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { unstorage } from "@lucia-auth/adapter-session-unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import { createStorage } from "unstorage";
import { github } from "@lucia-auth/oauth/providers";

import type { D1Database } from '@cloudflare/workers-types';

const { IDENTITY_DB } = (process.env as any as { IDENTITY_DB: D1Database });

export const initializeLucia = (db: D1Database) => {
	const sessions = createStorage({
		driver: cloudflareKVBindingDriver({ binding: process.env.IDENTITY_SESSIONS }),
	});
	const auth = lucia({	
		adapter: {
			user: d1(db, {
				user: "user",
				key: "user_key",
				session: null
			}),
			session: unstorage(sessions)
		},
        env: "PROD",
        middleware: nextjs_future(),
        sessionCookie: {
            expires: false
        },
		getUserAttributes: (data) => {
			return {
				githubUsername: data.username,
				email: data.email
			};
		}
	});
	return auth;
};

export const auth = initializeLucia(IDENTITY_DB);

export const githubAuth = github(auth, {
	clientId: process.env.GITHUB_CLIENT_ID ?? "",
	clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
});

export type Auth = ReturnType<typeof initializeLucia>;


