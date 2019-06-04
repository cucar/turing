import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/:product_id': route(req => ({ title: 'Turing Product Page', view: <Product productId={req.params.product_id} /> }))
});

/**
 * shows product details
 */
function Product({ productId }) {
	return (<>
		<h1>Product ID {productId}</h1>
		<LinkButton variant="contained" color="primary" href="/cart">Cart</LinkButton>
	</>);
}