import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Review Page', view: <Review /> })
});

/**
 * shows the list of products that are about to be purchased in checkout second step
 */
function Review() {
	return (<>
		<h1>Review</h1>
		<LinkButton variant="contained" color="primary" href="/payment">Payment</LinkButton>
	</>);
}