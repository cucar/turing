import React from 'react';
import { mount, route } from 'navi';

export default mount({
	'/': route({ title: 'Turing Checkout Page', view: <Checkout /> })
});

function Checkout() {
	return (
		<div className="page">
			<h1>Checkout</h1>
		</div>
	);
}