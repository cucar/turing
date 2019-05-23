import { showError } from './notifications';

const queryString = require('querystring');
const fetch = require('node-fetch');

/**
 * main routine to call the server api - shows error in snackbar if the response is not 200 or not a json
 */
const callApi = async (endpoint, args = {}, method = 'GET', headers = {}) => {

	let errString = `Error in ${endpoint} API call with ${JSON.stringify(args)} and method ${method} and headers ${JSON.stringify(headers)} - `;
	
	// call the api and return the results
	let response = null;
	if (method === 'POST' || method === 'PUT')
		response = await fetch(`/api/${endpoint}`, { method: method, body: JSON.stringify(args), headers: Object.assign({ 'Content-Type': 'application/json' }, headers) });
	else if (method === 'GET' || method === 'DELETE')
		response = await fetch(`/api/${endpoint}?${queryString.stringify(args)}`, { method: method, headers: Object.assign({ 'Content-Type': 'application/json' }, headers) });
	else
		return showError(`${errString} Unknown request method.`);
	
	// clone the response because the response is a stream. It can only be read once - if there is a json parse error, we need to show the raw response in error message
	let responseClone = response.clone();
	
	// try to parse the json and return it
	try {
		
		let parsedResponse = await response.json();

		// if the response was successful, return the data as-is
		if (response.status === 200) return parsedResponse;

		// if the response can be parsed and there is a code and message, show them in a more structured way
		if (parsedResponse.hasOwnProperty('code') && parsedResponse.hasOwnProperty('message'))
			return showError(`${parsedResponse.message} (${parsedResponse.code})`);
		
		return showError(`${errString} HTTP error: ${response.status} - ${await responseClone.text()}`);
	}
	catch (ex) {
		let rawResponse = await responseClone.text();
		if (response.status !== 200) return showError(`${errString} HTTP error: ${rawResponse}`);
		else return showError(`${errString} JSON parse error: ${rawResponse}`);
	}
};

export default callApi;