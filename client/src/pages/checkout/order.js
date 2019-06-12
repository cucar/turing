import React from 'react';

/**
 * shows the final page after order is placed
 */
export default function Order({ orderId }) {
	return (<>
		<h1>Order {orderId} placed successfully.</h1>
	</>);
}