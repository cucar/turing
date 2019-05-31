import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

import callApi from '../utils/callApi';

// Context lets us pass a value deep into the component tree without explicitly threading it through every component. Create a context for the api response.
const ApiContext = React.createContext(null);

/**
 * makes an api call and sets the state with the response so that it can be used in children
 * Usage:
 * import { Api, ApiContext } from '../../shared/api';
 * let showProducts = apiResponse => (<div>Api response: {apiResponse && apiResponse.count}</div>);
 * <Api endpoint="products"><ApiContext.Consumer>{showProducts}</ApiContext.Consumer></Api>
*/
const Api = ({ endpoint, args, method, headers, children }) => {

	// these are concurrency control variables - since they need to be updated synchronously, we can't make them part of state - using ref instead
	const apiRequestSent = useRef(false);
	const responseReceived = useRef(false);

	// api response and progress display setting should be set at the same time so that they won't cause double render
	let [ state, setState ] = useState({ apiResponse: null, showProgress: false });
	
	// make the api call and show progress if it takes longer than 200 ms
	useEffect(() => {

		// if api request was sent in previous renders, no need to do anything - return - otherwise, set it true since we're about to make that call
		if (apiRequestSent.current) return;
		apiRequestSent.current = true;

		// start the timer to show the progress - if we get the response within 200 ms, we won't show progress - otherwise show it until response is received
		setTimeout(() => { if (!responseReceived.current) setState({ apiResponse: null, showProgress: true }); }, 200);
		
		// make the api call and store the response - hide progress when it is received
		(async () => {
			
			// if we get an error here, the api response will be set to empty string and an error dialog will be shown
			// at that point we leave it to the caller to handle the error - in any case, we received a response
			setState({ apiResponse: await callApi(endpoint, args, method, headers), showProgress: false });
			responseReceived.current = true;
		})();
	}, [ endpoint, args, method, headers, responseReceived, apiRequestSent ]);
	
	// Using a Provider to pass the api context to the tree below. Any component can read the response data, no matter how deep it is.
	return (
		<ApiContext.Provider value={state.apiResponse}>
			{!state.showProgress && children}
			{state.showProgress && <LinearProgress />}
		</ApiContext.Provider>
	);
};

Api.propTypes = {
	endpoint: PropTypes.string.isRequired,
	args: PropTypes.any,
	method: PropTypes.string,
	headers: PropTypes.any,
	children: PropTypes.node
};

export { Api, ApiContext };