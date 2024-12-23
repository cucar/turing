/**
 * this file contains the routines used for storing and accessing session information after login/register
 */

import PubSub from 'pubsub-js';

/**
 * saves session information after login/register
 */
const saveSession = (session) => {

	// determine the session expiration and save it - expires_in comes in hours with a format like 24h
	let expDate = new Date();
	expDate.setHours(expDate.getHours() + parseInt(session.expires_in.replace('h')));

	// now set the session data in local storage
	localStorage.setItem('customer', JSON.stringify(session.customer.schema));
	localStorage.setItem('token', session.accessToken);
	localStorage.setItem('expires', expDate);
	
	// once the login session is set, we need to update the view so that it can be shown that customer logged in - update listeners for that (top right section in header with avatar)
	PubSub.publish('Authentication', 'Login');
};

/**
 * removes session information for logout operation
 */
const deleteSession = () => {
	
	// remove the session data
	localStorage.clear();
	
	// once the user logs out, we need to update the view so that it can be shown that customer is not logged in - update listeners for that (top right section in header with avatar)
	PubSub.publish('Authentication', 'Logout');
};

/**
 * returns if there is a valid session in effect - if it is expired or not saved at all, there is no session
 */
const loggedIn = () => {
	
	// if there is no data saved for expiration date, there is no session
	if (!localStorage.getItem('expires')) return false;
	
	// if session exists but is in the past, it's expired - effectively no session
	if (new Date(localStorage.getItem('expires')) < new Date()) return false;
	
	// looks like there is session data and it's not expired - return true
	return true;
};

/**
 * updates customer information in session after an update
 */
const updateSessionCustomer = (customer) => {
	let sessionCustomer = getSessionCustomer();
	for (let field of Object.keys(sessionCustomer)) if (customer.hasOwnProperty(field)) sessionCustomer[field] = customer[field];
	localStorage.setItem('customer', JSON.stringify(sessionCustomer));
};

/**
 * returns customer information from session if not expired
 */
const getSessionCustomer = () => {
	return (loggedIn() ? JSON.parse(localStorage.getItem('customer')) : null);
};

/**
 * returns access token from session if not expired
 */
const getAccessToken = () => {
	return (loggedIn() ? localStorage.getItem('token') : null);
};

/**
 * saves current cart id
 */
const saveSessionCartId = (cartId) => localStorage.setItem('cart_id', cartId);

/**
 * returns currently saved cart id
 */
const getSessionCartId = () => localStorage.getItem('cart_id');

/**
 * saves current cart product count
 */
const saveSessionCartProductCount = (cartProductCount) => localStorage.setItem('cart_product_count', cartProductCount);

/**
 * returns currently saved cart product count
 */
const getSessionCartProductCount = () => localStorage.getItem('cart_product_count');

export {
	saveSession,
	deleteSession,
	loggedIn,
	getSessionCustomer,
	getAccessToken,
	updateSessionCustomer,
	saveSessionCartId,
	getSessionCartId,
	saveSessionCartProductCount,
	getSessionCartProductCount
};