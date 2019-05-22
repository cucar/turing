import React from 'react';
import { mount, route } from 'navi';

export default mount({
	'/': route({ title: 'Turing Order Page', view: <Order /> })
});

/**
 * shows order information for the logged in customer
 */
function Order() {
	return (<>
		<h1>Order</h1>
	</>);
}