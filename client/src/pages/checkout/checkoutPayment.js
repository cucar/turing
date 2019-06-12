import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, FormControlLabel, Checkbox } from '@material-ui/core';

import { getStripe, getStripeCardElement } from '../../utils/stripe';
import callApi from '../../utils/callApi';
import { getSessionCartId, getSessionCustomer } from '../../utils/session';
import { showSuccess } from '../../utils/notifications';
import './checkoutPayment.css';

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
			
			<br/>
			
			{/* shipping method is not selected - cannot continue */}
			{shippingMethodId === 0 && <div className="checkout-no-shipping-method-selected">
				Please select a shipping method to continue.
			</div>}
			
			{/* shipping method is selected on there is no card on file */}
			{shippingMethodId > 0 && !customerCardOnFile && <div className="checkout-no-saved-card">
				<div className="checkout-text">Please enter your credit card number below. You can use 4242 4242 4242 4242 or 4111 1111 1111 1111 with any exp date and CVC to test.</div>
				<div id="stripe-inputs" />
			</div>}
			
			{/* shipping method is selected on there is card on file */}
			{shippingMethodId > 0 && customerCardOnFile && <div className="checkout-saved-card">
				<FormControlLabel
					control={<Checkbox checked={useCardOnFile} onChange={onCardOnFileChange} />}
					label="Use Card On File"
				/>
				<br/>
				<div className={`checkout-new-card ${useCardOnFile ? 'invisible' : ''}`}>
					<div className="checkout-text">Please enter your credit card number below. You can use 4242 4242 4242 4242 or 4111 1111 1111 1111 with any exp date and CVC to test.</div>
					<div id="stripe-inputs" />
				</div>
			</div>}
			
			{shippingMethodId > 0 && <Button variant="contained" color="primary" onClick={checkout}>Pay ${(cartAmount + shippingAmount + taxAmount).toFixed(2)}</Button>}
		</div>
	);
}