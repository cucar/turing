import BusyIndicator from 'react-busy-indicator';
import React from 'react';
import { useLoadingRoute } from 'react-navi';

export default function Layout({ children }) {

	// If there is a route that hasn't finished loading, it can be retrieved with useLoadingRoute
	let loadingRoute = useLoadingRoute();
	
	return (
		<div className="Layout">
			{/* This component shows a loading indicator after a delay */}
			<BusyIndicator isBusy={!!loadingRoute} delayMs={200} active={true} className="loading" color="primary" style={{}}/>
			<main>
				{children}
			</main>
		</div>
	)
}