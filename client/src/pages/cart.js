import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Cart Page', view: <Cart /> })
});

function Cart() {
	return (
		<div className="page">
			<h1>Cart</h1>
			<LinkButton variant="contained" color="primary" href="/shipping">Checkout</LinkButton>
		</div>
	);
}