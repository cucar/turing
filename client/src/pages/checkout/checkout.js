import React, { useState } from 'react';
import { mount } from 'navi';
import { Card, CardContent } from '@material-ui/core';

import routeAuth from '../../utils/routeAuth';
import { getSessionCartId } from '../../utils/session';
import { Api } from '../../shared/api';
import CheckoutSummary from './checkoutSummary';
import CheckoutPayment from './checkoutPayment';
import Order from './order';

export default mount({
	'/': routeAuth({ title: 'Turing Checkout Page', view: <Checkout /> }),
	'/order': routeAuth({ title: 'Turing Order Page', view: <Order /> })
});

/**
 * Payment page - user enters the card and submits the payment
 */
function Checkout() {
	
	// cart amount, shipping method ID, shipping amount and tax amount are part of state object. we set them together so that when we update them it won't trigger render multiple times.
	const [ orderData, setOrderData ] = useState({ shippingMethodId: '', cartAmount: 0, shippingAmount: 0, taxAmount: 0 });
	
	/**
	 * this is called from summary component when the user updates the shipping method. we will in turn pass the method and updated amounts to the payment component so that order can be completed
	 */
	const onShippingMethodChange = (shippingMethodId, cartAmount, shippingAmount, taxAmount) => setOrderData({ shippingMethodId, cartAmount, shippingAmount, taxAmount });
	
	return (
		<Card>
			<CardContent>
				<h1>Checkout</h1>
				<Api endpoint={`shoppingcart/checkout/${getSessionCartId()}`} render={checkoutData => (<>
					<CheckoutSummary onShippingMethodChange={onShippingMethodChange} checkoutData={checkoutData} />
					<CheckoutPayment shippingMethodId={orderData.shippingMethodId} cartAmount={orderData.cartAmount} shippingAmount={orderData.shippingAmount} taxAmount={orderData.taxAmount} />
				</>)} />
			</CardContent>
		</Card>
	);
}