import React from 'react';
import { mount, route } from 'navi';
import LinkButton from "../shared/linkButton";

export default mount({
	'/': route({ title: 'Turing Payment Page', view: <Payment /> })
});

function Payment() {
	return (
		<div className="page">
			<h1>Payment</h1>
			<LinkButton variant="contained" color="primary" href="/checkout">Checkout</LinkButton>
		</div>
	);
}