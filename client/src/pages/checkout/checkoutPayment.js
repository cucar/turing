import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-navi';
import { Button, FormControlLabel, Checkbox, LinearProgress } from '@material-ui/core';
import PubSub from 'pubsub-js';

import { getStripe, getStripeCardElement } from '../../utils/stripe';
import callApi from '../../utils/callApi';
import { getSessionCartId, getSessionCustomer, saveSessionCartId, saveSessionCartProductCount } from '../../utils/session';
import { showSuccess, showError } from '../../utils/notifications';
import './checkoutPayment.css';

/**
 * shows the payment section in the checkout page
 */
export default function CheckoutPayment({ shippingMethodId, cartAmount, shippingAmount, taxAmount }) {
	
	let navigator = useNavigation();
	
	// check if the customer has a saved credit card on file or not
	const customer = getSessionCustomer();
	const customerCardOnFile = customer && customer.credit_card && customer.credit_card !== '';
	
	// state that determines if customer will use card on file or not - if there is a card on file, by default it will be used
	const [ useCardOnFile, setUseCardOnFile ] = useState(customerCardOnFile);
	
	// state that determines if we are showing progress - used when we make the api call for checkout
	const [ showProgress, setShowProgress ] = useState(false);
	
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
	 * tokenizes stripe token if we are not using card on file - otherwise returns empty string - server will understand that it means "use card on file"
	 */
	const getCardToken = useCallback(async () => {
		
		// if we are using card on file, we will not tokenize the entered card - just return empty - server will understand that it means "use card on file"
		if (useCardOnFile) return { token: '', error: '' };
		
		// call stripe to tokenize the card if we are not using card on file
		const { token, error } = await stripe.current.createToken(stripeCardElement.current);
		// console.log('stripe response', token, error);
		return { token: token.id, error: (error ? error.message : '') };
	}, [ stripe, useCardOnFile ]);
	
	/**
	 * checkout event handler - tokenize the entered card and call the server to collect the charges
	 */
	const checkout = useCallback(async () => {
		
		// we need to make sure shipping method is selected
		if (shippingMethodId === 0) return showError('Shipping method needs to be selected.');
		
		// we need to make sure there are products in the cart
		if (cartAmount === 0) return showError('Please add a product to cart to checkout.');

		// show progress until api call returns
		setShowProgress(true);
		
		// get card token to use from stripe if we are not using card on file
		const { token, error } = await getCardToken();
		// console.log('card token response', token, error);
		if (error) { showError('Adding card failed with error: ' + error); setShowProgress(false); return; }
		
		// now call our server to collect the charges - this method will call stripe to do that from the server side with the token (or card on file)
		const checkoutResponse = await callApi('orders', { cart_id: getSessionCartId(), shipping_id: shippingMethodId, stripe_token: token }, 'POST');
		// console.log(checkoutResponse);
		setShowProgress(false); // hide progress as soon as api returns
		if (!checkoutResponse) return;
		
		// get the order id from the response
		const orderId = checkoutResponse.order_id;
		
		// if the order was successful, reset the cart information in session and update mini cart display
		saveSessionCartId('');
		saveSessionCartProductCount(0);
		PubSub.publish('CartUpdate', 0);

		// show success and redirect to order confirmation page
		showSuccess(`Checkout successful. Order ID: ${orderId}`);
		navigator.navigate(`/checkout/order/${orderId}`);
		
	}, [ getCardToken, shippingMethodId, cartAmount, navigator ]);
	
	return (
		<div className="checkout-payment">
			
			<br/>

			{showProgress && <LinearProgress />}
			
			{/* shipping method is not selected - cannot continue */}
			{shippingMethodId === 0 && <div className={`checkout-no-shipping-method-selected ${showProgress ? 'invisible' : ''}`}>
				Please select a shipping method to continue.
			</div>}
			
			{/* shipping method is selected on there is no card on file */}
			{shippingMethodId > 0 && !customerCardOnFile && <div className={`checkout-no-saved-card ${showProgress ? 'invisible' : ''}`}>
				<div className="checkout-text">Please enter your credit card number below. You can use 4242 4242 4242 4242 or 4111 1111 1111 1111 with any exp date and CVC to test.</div>
				<div id="stripe-inputs" />
			</div>}
			
			{/* shipping method is selected on there is card on file */}
			{shippingMethodId > 0 && customerCardOnFile && <div className={`checkout-saved-card ${showProgress ? 'invisible' : ''}`}>
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

			{/* button to checkout - not shown if there is no shipping method selected - also not shown during api call */}
			{!showProgress && shippingMethodId > 0 && <Button variant="contained" color="primary" onClick={checkout}>
				Pay ${(cartAmount + shippingAmount + taxAmount).toFixed(2)}
			</Button>}
			
		</div>
	);
}