import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Product Page', view: <Product /> })
});

function Product() {
	return (
		<div className="page">
			<h1>Product</h1>
			<LinkButton variant="contained" color="primary" href="/cart">Cart</LinkButton>
		</div>
	);
}