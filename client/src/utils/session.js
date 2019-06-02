/**
 * this file contains the routines used for storing and accessing session information after login/register
 */

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
};

/**
 * removes session information for logout operation
 */
const deleteSession = () => {
	localStorage.clear();
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

export { saveSession, deleteSession, loggedIn, getSessionCustomer, getAccessToken, updateSessionCustomer };