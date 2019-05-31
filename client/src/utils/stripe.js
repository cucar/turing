/**
 * this file contains the routines and keys for stripe
 */
const stripeKey = 'pk_test_qpRDTZIbhcuKMOt22fR2FJom00s9GpUoYX';

/**
 * returns stripe card element - we use singleton pattern here - stripe does not let us create more than one card element per application
 */
let cardElement = null;
function getStripeCardElement(elements) {
	if (cardElement) return cardElement;
	cardElement = elements.create('card', { style: {
		base: { color: '#000', fontFamily: 'Roboto, Helvetica, Arial, sans-serif', fontSize: '15px', '::placeholder': { color: '#cccccc' } },
		invalid: { color: '#ff4d4d' }
	}});
	return cardElement;
}

/**
 * returns the stripe object - we use singleton pattern here - stripe does not like it when we have multiple handlers (mixes up the card elements)
 */
let stripeObject = null;
function getStripe() {
	if (stripeObject) return stripeObject;
	stripeObject = global.Stripe(stripeKey);
	return stripeObject;
}

export { getStripe, getStripeCardElement };