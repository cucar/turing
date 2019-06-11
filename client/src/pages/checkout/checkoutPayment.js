import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, FormControlLabel, Checkbox } from '@material-ui/core';

import { getStripe, getStripeCardElement } from '../../utils/stripe';
import callApi from '../../utils/callApi';
import { getSessionCartId, getSessionCustomer } from '../../utils/session';
import { showSuccess } from '../../utils/notifications';

/**
 * shows the payment section in the checkout page
 */
export default function CheckoutPayment({ shippingMethodId, cartAmount, shippingAmount, taxAmount }) {

	// check if the customer has a saved credit card on file or not
	const customerCardOnFile = !!getSessionCustomer().credit_card;
	
	// state that determines if customer will use card on file or not - if there is a card on file, by default it will be used
	const [ useCardOnFile, setUseCardOnFile ] = useState(customerCardOnFile);
	
	// initialize stripe, elements and card input
	const stripe = useRef(getStripe());
	const elements = useRef(stripe.current.elements());
	const stripeCardElement = useRef(getStripeCardElement(elements.current));
	
	/**
	 * executed after render - inject stripe inputs to the prepared div - the input field is in an iframe coming from stripe
	 * it has to be from them to be able to do the tokenization call without CORS restrictions
	 */
	useEffect(() => {
		
		// if stripe card input is already mounted, nothing to do - otherwise, mount it
		if (document.getElementById('stripe-inputs') && document.getElementById('stripe-inputs').innerHTML === '') stripeCardElement.current.mount('#stripe-inputs');
	}, [ shippingMethodId, cartAmount, shippingAmount, taxAmount ]);
	
	/**
	 * checkbox event handler to show/hide new card input
	 */
	const onCardOnFileChange = (event) => {
		console.log('card on file usage flag changed', event.target.checked);
		setUseCardOnFile(event.target.checked);
	};
	
	/**
	 * checkout event handler - tokenize the entered card and call the server to collect the charges
	 */
	const checkout = useCallback(async () => {
		
		// call stripe to tokenize the card
		const { token, error } = await stripe.current.createToken(stripeCardElement.current);
		console.log(token, error);
		if (error) { alert('Adding card failed with error: ' + error.message); return; }
		
		// now call our server to collect the charges - this method will call stripe to do that from the server side with the token
		// cart, shipping and tax IDs are test values - they would normally be entered and saved prior to coming to the payment page
		const checkoutResponse = await callApi('orders', { cart_id: getSessionCartId(), shipping_id: 1, tax_id: 1, stripe_token: token.id }, 'POST');
		console.log(checkoutResponse);
		if (!checkoutResponse) return;
		
		showSuccess('Checkout successful. Order ID: ' + checkoutResponse.order_id);
		
		// redirect to order page
		
	}, [ stripe ]);
	
	return (
		<div className="checkout-payment">
			{!customerCardOnFile && <div className="checkout-no-saved-card">
				<div className="checkout-text">Please enter your credit card number below:</div>
				<div id="stripe-inputs" />
				<Button variant="contained" color="primary" onClick={checkout}>Checkout</Button>
			</div>}
			
			{customerCardOnFile && <div className="checkout-saved-card">
				<FormControlLabel
					control={<Checkbox checked={useCardOnFile} onChange={onCardOnFileChange} />}
					label="Use Card On File"
				/>
				<br/>
				<div className={`checkout-new-card ${useCardOnFile ? 'invisible' : ''}`}>
					<div className="checkout-text">Please enter your credit card number below:</div>
					<div id="stripe-inputs" />
				</div>
				<Button variant="contained" color="primary" onClick={checkout}>Checkout</Button>
			</div>}
		</div>
	);
}