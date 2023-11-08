import { cache } from 'react';
import { auth } from '@/app/auth/lucia';
import * as context from "next/headers";

export const runtime = 'edge';

export const getPageSession = cache(() => {
	const authRequest = auth.handleRequest("GET", context);
	return authRequest.validate();
});