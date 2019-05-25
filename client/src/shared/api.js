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
const Api = (props) => {

	// api response and response received are not state variables because we don't want them to trigger render when they are changed
	// they are just internal variables used to keep track of the api response data - the render is triggered by showProgress and that's why it's a state variable
	let apiResponse = useRef(null);
	let responseReceived = useRef(false);
	let [ showProgress, setShowProgress ] = useState(false);

	// make the api call and show progress if it takes longer than 200 ms
	useEffect(() => {
		
		// start the timer to show the progress - if we get the response within 200 ms, we won't show progress - otherwise show it until response is received
		setTimeout(() => { if (!responseReceived.current) setShowProgress(true); }, 200);
		
		// make the api call and store the response - hide progress when it is received
		(async () => {
			apiResponse.current = await callApi(props.endpoint, props.args, props.method, props.headers);
			responseReceived.current = true;
			setShowProgress(false);
		})();
	}, [ props ]);

	// Using a Provider to pass the api context to the tree below. Any component can read the response data, no matter how deep it is.
	return (<>
		<ApiContext.Provider value={apiResponse.current}>
			{!showProgress && props.children}
			{showProgress && <LinearProgress />}
		</ApiContext.Provider>
	</>);
};
Api.propTypes = {
	endpoint: PropTypes.string.isRequired,
	children: PropTypes.node
};

export { Api, ApiContext };