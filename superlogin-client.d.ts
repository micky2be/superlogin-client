import { EventEmitter2 } from 'eventemitter2';
import { AxiosInstance } from 'axios';

export interface Promise<V> {
	then<R1, R2>(onFulfilled: (value: V) => R1 | Promise<R1>, onRejected: (error: any) => R2 | Promise<R2>): Promise<R1 | R2>;
	then<R>(onFulfilled: (value: V) => R | Promise<R>): Promise<R>;
	catch<R>(onRejected: (error: any) => R | Promise<R>): Promise<R>;
}

interface SuperLoginClient extends EventEmitter2.emitter {
	configure: (options: any) => void;
	authenticated: () => boolean;
	authenticate: () => Promise<any>;
	getConfig: () => any;
	validateSession: () => void;
	getSession: () => any;
	setSession: (session: any) => void;
	deleteSession: () => void;
	getDbUrl: (dbName: string) => string;
	confirmRole: (role: string) => boolean;
	confirmAnyRole: (possibleRoles: Array<string>) => boolean;
	confirmAllRoles: (requiredRoles: Array<string>) => boolean;
	refresh: () => void;
	checkRefresh: () => void;
	checkExpired: () => void;
	login: (login: { username: string, password: string }) => Promise<any>;
	register: (register: { username: string, name?: string, email?: string, password: string, confirmPassword: string } | any) => Promise<any>;
	logout: (message?: string) => Promise<any>;
	logoutAll: (message?: string) => Promise<any>;
	logoutOthers: () => Promise<any>;
	socialAuth: (provider: string) => Promise<any>;
	tokenSocialAuth: (provider: string, accessToken: string) => Promise<any>;
	link: (provider: string) => Promise<any>;
	tokenLink: (provider: string, accessToken: string) => Promise<any>;
	unlink: (provider: string) => Promise<any>;
	verifyEmail: (token: string) => Promise<any>;
	forgotPassword: (email: string) => Promise<any>;
	resetPassword: (reset: { password: string, confirmPassword: string, token: string }) => Promise<any>;
	changePassword: (change: { currentPassword?: string, newPassword: string, confirmPassword: string, token: string }) => Promise<any>;
	changeEmail: (email: string) => Promise<any>;
	validateUsername: (username: string) => Promise<any>;
	validateEmail: (email: string) => Promise<any>;
	getHttp: () => AxiosInstance;
}

declare const client: SuperLoginClient;
export default client;
