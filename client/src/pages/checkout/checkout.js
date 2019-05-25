import React from 'react';
import { mount, route } from 'navi';

export default mount({
	'/': route({ title: 'Turing Checkout Page', view: <Checkout /> })
});

/**
 * shows the checkout page after order is placed
 */
function Checkout() {
	return (<>
		<h1>Checkout</h1>
	</>);
}