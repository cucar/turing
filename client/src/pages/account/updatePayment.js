import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from 'react-navi';
import Button from '@material-ui/core/Button/Button';
import { Card, CardContent, CardActions } from '@material-ui/core';

import { showSuccess, showError } from '../../utils/notifications';
import { getSessionCustomer, updateSessionCustomer } from '../../utils/session';
import { getStripe, getStripeCardElement } from '../../utils/stripe';
import callApi from '../../utils/callApi';
import LinkButton from '../../shared/linkButton';

/**
 * card on file update screen
 */
export default function UpdatePayment(props) {
	
	let customer = getSessionCustomer();
	let navigator = useNavigation();
	
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
		if (document.getElementById('stripe-inputs').innerHTML === '') stripeCardElement.current.mount('#stripe-inputs');
	}, [ props ]);
	
	/**
	 * update card on file event handler - tokenize the card number and then send it to our server to save it on file - then update session with same info
	 */
	const updateCardOnFile = useCallback(async () => {
		
		// call stripe to tokenize the card
		const { token, error } = await stripe.current.createToken(stripeCardElement.current);
		// console.log(token, error);
		if (error) return showError(`Card tokenization error: ${error.message} (response data: ${token}`);
		
		// now call our server to make that token permanent and on file - note that stripe tokens are temporary - in order to make it permanent, we have to create a customer in stripe
		// with that token - that effectively means saving the card - if this call fails we customer will be null and error will already have been shown in a dialog from callApi routine
		const customer = await callApi('customers/creditCard', { credit_card: token.id }, 'PUT');
		// console.log(customer);
		if (!customer) return;

		// now update the customer in session with the returned values
		updateSessionCustomer(customer);
		
		// show success message and redirect to my account page
		showSuccess('Card successfully saved on file.');
		navigator.navigate('/account');
	}, [ stripe, navigator ]);
	
	return (
		<Card>
			<CardContent>
				<h1>Credit Card On File</h1>
				<p>You can use test card numbers: 4242 4242 4242 4242 or 4111 1111 1111 1111.</p>
				{customer.credit_card && <p>Please note that you already have a card on file. If you make an update it will be overwritten.</p>}
				<div id="stripe-inputs" />
			</CardContent>
			<CardActions>
				<Button variant="contained" color="primary" onClick={updateCardOnFile}>Update</Button>
				<LinkButton href="/account">Cancel</LinkButton>
			</CardActions>
		</Card>
	);
}