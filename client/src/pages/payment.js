import React from 'react';
import { mount, route } from 'navi';
import Button from '@material-ui/core/Button';

import { Api, ApiContext } from '../shared/api';
import LinkButton from '../shared/linkButton';
import callApi from '../utils/callApi';

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
	
	async function testApi() {
		await callApi('products');
	}
	
	return (<>
		<h1>Payment</h1>
		Api response:
		<div>
			<Api endpoint="products">
				<ApiContext.Consumer>{showProducts}</ApiContext.Consumer>
			</Api>
		</div>
		<br/>
		
		<Button variant="contained" color="primary" onClick={testApi}>Test API</Button> <br/><br/><br/>
		<LinkButton variant="contained" color="primary" href="/checkout">Checkout</LinkButton>
	</>);
}