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
const Api = ({ endpoint, args, method, headers, render }) => {
	
	// these are concurrency control variables - since they need to be updated synchronously, we can't make them part of state - using ref instead
	const apiRequestSent = useRef(false);
	const responseReceived = useRef(false);

	// api response and progress display setting should be set at the same time so that they won't cause double render
	let [ state, setState ] = useState({ apiResponse: null, showProgress: false });
	
	// make the api call and show progress if it takes longer than 500 ms
	useEffect(() => {

		// if api request was sent in previous renders, no need to do anything - return - otherwise, set it true since we're about to make that call
		if (apiRequestSent.current) return;
		apiRequestSent.current = true;
		
		// start the timer to show the progress - if we get the response within 500 ms, we won't show progress - otherwise show it until response is received
		setTimeout(() => { if (!responseReceived.current) setState({ apiResponse: null, showProgress: true }); }, 500);
		
		// setup abort controller for fetch unsubscribe - needed for cleanup when api component unmounts
		const abortController = new AbortController();
		
		// make the api call and store the response - hide progress when it is received
		// if we get an error here, the api response will be set to empty string and an error dialog will be shown
		// at that point we leave it to the caller to handle the error - in any case, we received a response
		// we also reset api request sent flag used to control progress display at render
		responseReceived.current = false;
		callApi(endpoint, args, method, headers, abortController.signal).then(apiResponse => {
			setState({ apiResponse: apiResponse, showProgress: false });
			responseReceived.current = true;
			apiRequestSent.current = false;
		});
		
		// clean up function - unsubscribe from fetch
		return () => abortController.abort();
	}, [ endpoint, args, method, headers, responseReceived, apiRequestSent ]);
	
	// api components are supposed to have only one child which would be a function of what to display with the retrieved response
	const renderChildren = (response) => {
	
		// if we did not get a valid response back, do not render anything
		if (!response) return '';
		
		// otherwise call the passed in render function with the api response
		return render(response);
	};
	
	// Using a Provider to pass the api context to the tree below. Any component can read the response data, no matter how deep it is.
	return (
		<ApiContext.Provider value={state.apiResponse}>
			{!state.showProgress && renderChildren(state.apiResponse)}
			{state.showProgress && <LinearProgress />}
		</ApiContext.Provider>
	);
};

Api.propTypes = {
	endpoint: PropTypes.string.isRequired,
	args: PropTypes.any,
	method: PropTypes.string,
	headers: PropTypes.any,
	render: PropTypes.any.isRequired
};

export { Api, ApiContext };