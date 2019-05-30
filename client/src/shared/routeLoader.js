import React, { useEffect, useState } from 'react';
import { useLoadingRoute } from 'react-navi';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function RouteLoader({ children }) {

	// styles to make the progress centered
	const outerStyle = { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
	const innerStyle = { marginLeft: 'auto', marginRight: 'auto' };
	
	// if we were previously not loading a route and now we are loading route, start the timer to show the progress
	// we will show it after some short delay - this is so that there won't be a flicker between routes
	let loadingRouteData = useLoadingRoute();
	const [ loadingRoute, setLoadingRoute ] = useState(false);
	useEffect(() => {
		if (!loadingRoute && !!loadingRouteData) setTimeout(() => { if (!!loadingRouteData) setLoadingRoute(true); }, 200); // route is starting to be loaded - show progress if it doesn't load in 200 ms
		if (loadingRoute && !!!loadingRouteData) setLoadingRoute(false); // route loaded don't show progress
	}, [ loadingRoute, loadingRouteData ]);
	
	// If there is a route that hasn't finished loading, it can be retrieved with useLoadingRoute
	return (
		<div className="layout">
			{!!loadingRouteData && <div style={outerStyle}><div style={innerStyle}><CircularProgress size={200} /></div></div>}
			{children}
		</div>
	);
}