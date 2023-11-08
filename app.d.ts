/// <reference types="lucia" />
declare namespace Lucia {
	type Auth = import("./app/auth/lucia").Auth;
    type DatabaseUserAttributes = {
		username: string;
		email: string;
	};	
	type DatabaseSessionAttributes = {};
}