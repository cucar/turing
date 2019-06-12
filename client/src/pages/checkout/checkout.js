import React, { useState, useCallback } from 'react';
import { mount } from 'navi';
import { useNavigation } from 'react-navi';
import { Card, CardContent } from '@material-ui/core';

import routeAuth from '../../utils/routeAuth';
import { getSessionCartId } from '../../utils/session';
import { Api } from '../../shared/api';
import CheckoutSummary from './checkoutSummary';
import CheckoutPayment from './checkoutPayment';
import Order from './order';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': routeAuth({ title: 'Turing Checkout Page', view: <Checkout /> }),
	'/order/:order_id': routeAuth(req => ({ title: 'Turing Order Page', view: <Order orderId={req.params.order_id}/> }))
});

/**
 * Payment page - user enters the card and submits the payment
 */
function Checkout() {
	
	let navigator = useNavigation();
	
	// if there is no cart in session, we can't do checkout - link to catalog
	const [ cartId, setCartId ] = useState(getSessionCartId());
	
	// cart amount, shipping method ID, shipping amount and tax amount are part of state object. we set them together so that when we update them it won't trigger render multiple times.
	const [ orderData, setOrderData ] = useState({ shippingMethodId: 0, cartAmount: 0, shippingAmount: 0, taxAmount: 0 });

	/**
	 * this is called from summary component when the user updates the shipping method. we will in turn pass the method and updated amounts to the payment component so that order can be completed
	 */
	const onShippingMethodChange = useCallback((shippingMethodId, cartAmount, shippingAmount, taxAmount) => setOrderData({ shippingMethodId, cartAmount, shippingAmount, taxAmount }), []);
	
	/**
	 * when checkout is successful, this will be called from payment component to redirect to order page
	 */
	const onCheckout = useCallback((orderId) => {
		setCartId('');
		navigator.navigate(`/checkout/order/${orderId}`);
	}, [ navigator ]);
	
	return (<>
		{!cartId && <Card>
			<CardContent>
				<h1>No products in cart</h1>
				<LinkButton href="/catalog">Add Products to Cart</LinkButton>
			</CardContent>
		</Card>}
		
		{!!cartId && <Card>
			<CardContent>
				<h1>Checkout</h1>
				<Api endpoint={`shoppingcart/checkout/${getSessionCartId()}`} render={checkoutData => (<>
					<CheckoutSummary
						onShippingMethodChange={onShippingMethodChange}
						checkoutData={checkoutData}
					/>
					<CheckoutPayment
						shippingMethodId={orderData.shippingMethodId}
						cartAmount={orderData.cartAmount}
						shippingAmount={orderData.shippingAmount}
						taxAmount={orderData.taxAmount}
						onCheckout={onCheckout}
					/>
				</>)} />
			</CardContent>
		</Card>}
	</>);
}