import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import callApi from '../utils/callApi';

// Context lets us pass a value deep into the component tree without explicitly threading it through every component. Create a context for the api response.
const ApiContext = React.createContext(null);

/**
 * makes an api call and sets the state with the response so that it can be used in children
 */
const Api = (props) => {

	const [ apiResponse, setApiResponse ] = useState(null);
	
	// testing data fetch from server
	useEffect(() => {(async function() {
		setApiResponse(await callApi(props.endpoint));
	})(); }, [ props ]);

	// Use a Provider to pass the api context to the tree below. Any component can read the response data, no matter how deep it is.
	return (<>
		<ApiContext.Provider value={apiResponse}>
			{props.children}
		</ApiContext.Provider>
	</>);
};
Api.propTypes = {
	endpoint: PropTypes.string.isRequired,
	children: PropTypes.node
};

export { Api, ApiContext };