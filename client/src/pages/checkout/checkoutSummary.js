import React from 'react';

/**
 * shows the checkout items and allows selection of shipping method
 */
export default function CheckoutSummary({ checkoutData, onShippingMethodChange }) {
	
	return (<>
		<p>{JSON.stringify(checkoutData)}</p>
	</>);
}