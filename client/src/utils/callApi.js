import { showError } from './notifications';
import { getAccessToken } from './session';

const queryString = require('querystring');
const fetch = require('node-fetch');

/**
 * main routine to call the server api - shows error in snackbar if the response is not 200 or not a json
 */
const callApi = async (endpoint, args = {}, method = 'GET', headers = {}, abortSignal = null) => {

	let errString = `Error in ${endpoint} API call with ${JSON.stringify(args)} and method ${method} and headers ${JSON.stringify(headers)} - `;

	// determine the headers to be sent to the server for the api call. include content type at all calls and merge with whatever headers were requested for this call.
	// if the user is logged in, send the authorization header as well in the api call - if it's an authenticated call it will be used - otherwise ignored
	let apiHeaders = Object.assign({ Authorization: getAccessToken(), 'Content-Type': 'application/json' }, headers);
	
	// call the api and return the results
	let response = null;
	let apiArgs = { method: method, headers: apiHeaders };
	if (abortSignal) apiArgs.signal = abortSignal; // if an abort controller signal is given, use it
	if (method === 'POST' || method === 'PUT') {
		apiArgs.body = JSON.stringify(args);
		response = await fetch(`/api/${endpoint}`, apiArgs);
	} else if (method === 'GET' || method === 'DELETE') {
		response = await fetch(`/api/${endpoint}?${queryString.stringify(args)}`, apiArgs);
	} else
		return showError(`${errString} Unknown request method.`);
	
	// clone the response because the response is a stream. It can only be read once - if there is a json parse error, we need to show the raw response in error message
	let responseClone = response.clone();
	
	// try to parse the json and return it
	try {
		
		let parsedResponse = await response.json();

		// if the response was successful, return the data as-is
		if (response.status === 200) return parsedResponse;

		// if the response can be parsed and there is a code and message, show them in a more structured way
		if (parsedResponse.hasOwnProperty('code') && parsedResponse.hasOwnProperty('message')) {
			console.log(parsedResponse);
			return showError(`${parsedResponse.message} (${parsedResponse.code})`);
		}
		
		return showError(`${errString} HTTP error: ${response.status} - ${await responseClone.text()}`);
	}
	catch (ex) {
		let rawResponse = await responseClone.text();
		if (response.status !== 200) return showError(`${errString} HTTP error: ${rawResponse}`);
		else return showError(`${errString} JSON parse error: ${rawResponse}`);
	}
};

export default callApi;