const queryString = require('querystring');
const fetch = require('node-fetch');

let callApi = async (endpoint, args = {}, method = 'GET', headers = {}) => {

	let errString = `Error in ${endpoint} API call with ${args} and method ${method} and headers ${headers} - `;
	
	try {
		
		// call the api and return the results
		let response = null;
		if (method === 'POST' || method === 'PUT')
			response = await fetch(`/api/${endpoint}`, { method: method, body: JSON.stringify(args), headers: Object.assign({ 'Content-Type': 'application/json' }, headers) });
		else if (method === 'GET' || method === 'DELETE')
			response = await fetch(`/api/${endpoint}?${queryString.stringify(args)}`, { method: method, headers: Object.assign({ 'Content-Type': 'application/json' }, headers) });
		else
			throw new Error(`${errString} Unknown request method.`);

		// if the response is not 200, there is something wrong - error out
		if (response.status !== 200) throw new Error(`${errString} HTTP Status error.`);
	
		// clone the response because the response is a stream. It can only be read once - if there is a json parse error, we need to show the raw response in error message
		let responseClone = response.clone();

		// try to parse the json and return it
		try {
			return await response.json();
		}
		catch (ex) {
			throw new Error(`${errString} JSON parse error: ${await responseClone.text()}`);
		}
	}
	catch (ex) {
		console.log(ex.message);
		return null;
	}
};

export default callApi;