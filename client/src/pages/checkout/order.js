import React from 'react';
import { Card, CardContent } from '@material-ui/core';

import './order.css';

/**
 * shows the final page after order is placed
 */
export default function Order({ orderId }) {
	return (
		<Card>
			<CardContent>
				<div className="checkout-order">
					<img src="/Images/images/rocket.png" alt={`order ID ${orderId}`} />
				</div>
				<div className="checkout-order">
					<h2>Order {orderId} is completed successfully. It will be shipped soon. Thank you for shopping with us.</h2>
				</div>
			</CardContent>
		</Card>
	);
}