export interface Promise<V> {
	then<R1, R2>(onFulfilled: (value: V) => R1 | Promise<R1>, onRejected: (error: any) => R2 | Promise<R2>): Promise<R1 | R2>;
	then<R>(onFulfilled: (value: V) => R | Promise<R>): Promise<R>;
	catch<R>(onRejected: (error: any) => R | Promise<R>): Promise<R>;
}

interface Http {
	post(path: string, data: any): Promise<any>;
	get(path: string): Promise<any>;
}

type loginType = { username: string, password: string };
type registerType = { username: string, password: string, confirmPassword: string };
type resetType = { password: string, confirmPassword: string, token: string };

interface SuperLoginClient extends EventEmitter {
	getHttp(): Http;
	validateSession();
	configure(options: any);
	login(loginType);
	logout();
	socialAuth(social: string);
	register(registerType);
	setSession(session: any);
	forgotPassword(email: string);
	resetPassword(resetType);
}

declare const client: SuperLoginClient;

declare module 'superlogin-client' {	
	export default client;
}