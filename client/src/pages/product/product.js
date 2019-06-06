import React from 'react';
import { mount, route } from 'navi';

import ProductDetail from './productDetail';
import ProductReviews from './productReviews';
import PostReview from './postReview';

export default mount({
	'/:product_id': route(req => ({ title: 'Turing Product Page', view: <Product productId={req.params.product_id} /> }))
});

/**
 * shows product details page
 */
function Product({ productId }) {
	return (<>
		<ProductDetail productId={productId} />
		<br/>
		<ProductReviews productId={productId} />
		<br/>
		<PostReview productId={productId} />
	</>);
}