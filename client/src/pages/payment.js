import React from 'react';
import { mount, route } from 'navi';

import { Api, ApiContext } from '../shared/api';
import LinkButton from '../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Payment Page', view: <Payment /> })
});

/**
 * Payment page - user enters the card and submits the payment
 */
function Payment() {
	
	let showProducts = apiResponse => {
		if (!apiResponse) return '';
		return (<div>{apiResponse.count}</div>);
	};
	
	return (<>
		<h1>Payment</h1>
		Api response:
		<div>
			<Api endpoint="products">
				<ApiContext.Consumer>{showProducts}</ApiContext.Consumer>
			</Api>
		</div>
		<br/>
		
		<LinkButton variant="contained" color="primary" href="/checkout">Checkout</LinkButton>
	</>);
}