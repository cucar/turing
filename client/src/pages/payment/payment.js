import React, { useEffect, useRef, useCallback } from 'react';
import { mount, route } from 'navi';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';

import callApi from '../../utils/callApi';
import { showSuccess } from '../../utils/notifications';

export default mount({
	'/': route({ title: 'Turing Payment Page', view: <Payment /> })
});

/**
 * Payment page - user enters the card and submits the payment
 */
function Payment(props) {
	
	// initialize stripe, elements and card input
	const stripe = useRef(global.Stripe('pk_test_qpRDTZIbhcuKMOt22fR2FJom00s9GpUoYX'));
	const elements = useRef(stripe.current.elements());
	const stripeCardElement = useRef(elements.current.create('card', { style: {
		base: { color: '#fff', fontFamily: 'Roboto, Helvetica, Arial, sans-serif', fontSize: '15px', '::placeholder': { color: '#cccccc' } },
		invalid: { color: '#ff4d4d' }
	}}));
	
	// input refs
	const nameField = useRef(null);
	
	/**
	 * executed after render - inject stripe inputs to the prepared div - the input field is in an iframe coming from stripe
	 * it has to be from them to be able to do the tokenization call without CORS restrictions
	 */
	useEffect(() => {
		stripeCardElement.current.mount('#stripe-inputs');
	}, [ props ]);
	
	/**
	 * checkout event handler - tokenize the entered card and call the server to collect the charges
	 */
	const checkout = useCallback(async () => {
		
		// call stripe to tokenize the card
		const { token, error } = await stripe.current.createToken(stripeCardElement.current, { name: nameField.current.value });
		console.log(token, error);
		if (error) { alert('Adding card failed with error: ' + error.message); return; }
		
		// this is a call setup for testing - normally the login would be done prior to coming to the payment page
		const loginResponse = await callApi('customers/login', { email: 'test@test.com', password: 'Test1234!' }, 'POST');
		console.log(loginResponse);
		if (!loginResponse) return;
		
		// this is a call setup for testing - normally the product would be added to the cart prior to coming to the payment page
		const cartResponse = await callApi('shoppingcart/add', { cart_id: 'test', product_id: 1, attributes: 'L, Red' }, 'POST');
		console.log(cartResponse);
		if (!cartResponse) return;
		
		// now call our server to collect the charges - this method will call stripe to do that from the server side with the token
		// cart, shipping and tax IDs are test values - they would normally be entered and saved prior to coming to the payment page
		const checkoutResponse = await callApi('orders', { cart_id: 'test', shipping_id: 1, tax_id: 1, stripe_token: token.id }, 'POST', { Authorization: loginResponse.accessToken });
		console.log(checkoutResponse);
		if (!checkoutResponse) return;

		showSuccess('Checkout successful. Order ID: ' + checkoutResponse.order_id);
		
		// redirect to checkout page and show success message
		
	}, [ stripe ]);
	
	return (
		<div style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
			<h1>Payment</h1>
			<TextField label="Name" style={{ width: '100%' }} inputRef={nameField} />
			<div id="stripe-inputs" style={{ paddingTop: 20, paddingBottom: 5, marginBottom: 15, borderBottom: '1px solid #bbbbbb' }} />
			<Button variant="contained" color="primary" onClick={checkout}>Checkout</Button>
		</div>
	);
}