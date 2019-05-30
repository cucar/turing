/**
 * this file contains the routine for protecting authenticated routes
 */
import { route, map, redirect } from 'navi';

import { loggedIn } from './session';

/**
 * returns the desired route if authenticated - otherwise it redirects to the login page
 * note that this is purely for user convenience - API calls are already protected on the server side
 */
export default function routeAuth(routeRule) {
	return map(() => loggedIn() ? route(routeRule) : redirect('/account/login'));
}