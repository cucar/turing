import React, { useEffect, useRef } from 'react';
import { useNavigation } from 'react-navi';
import Button from '@material-ui/core/Button/Button';

import { showSuccess } from '../../utils/notifications';
import { getSessionCustomer, updateSessionCustomer } from '../../utils/session';
import { stripeKey, getStripeCardElement } from '../../utils/stripe';

/**
 * card on file update screen
 */
export default function UpdatePayment(props) {
	
	let customer = getSessionCustomer();
	let navigator = useNavigation();
	
	// initialize stripe, elements and card input
	const stripe = useRef(global.Stripe(stripeKey));
	const elements = useRef(stripe.current.elements());
	const stripeCardElement = useRef(getStripeCardElement(elements.current));
	
	/**
	 * executed after render - inject stripe inputs to the prepared div - the input field is in an iframe coming from stripe
	 * it has to be from them to be able to do the tokenization call without CORS restrictions
	 */
	useEffect(() => {
		stripeCardElement.current.mount('#stripe-inputs');
	}, [ props ]);
	
	/**
	 * update card on file event handler
	 */
	const update = async (response, fieldValues) => {
		showSuccess('Update successful.');
		updateSessionCustomer(fieldValues);
		navigator.navigate('/account');
	};
	
	return (<>
		<h1>Credit Card On File</h1>
		{customer.credit_card && <p>Please note that you already have a card on file. If you make an update it will be overwritten.</p>}
		<div id="stripe-inputs" style={{ paddingTop: 20, paddingBottom: 5, marginBottom: 15, borderBottom: '1px solid #bbbbbb' }} />
		<Button variant="contained" color="primary" onClick={update}>Update</Button>
	</>);
}