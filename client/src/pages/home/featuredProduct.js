import React from 'react';
import LinkButton from '../../shared/linkButton';
import { Card, CardContent } from '@material-ui/core';

import './featuredProduct.css';

/**
 * shows one product in featured products list
 */
export default function FeaturedProduct({ product }) {
	return (<>
		<Card className="featured-product-card">
			<CardContent>
				<div className="featured-product">
					<div className="featured-product-image">
						<img src={`/Images/product_images/${product.thumbnail}`} alt={product.name} />
					</div>
					<div className="featured-product-header">
						{product.name}
					</div>
					<div className="featured-product-price">
						${parseFloat(product.discounted_price) > 0 ? product.discounted_price : product.price}
					</div>
					<div className="featured-product-link">
						<LinkButton href={`/product/${product.product_id}`} >View</LinkButton>
					</div>
				</div>
			</CardContent>
		</Card>
	</>);
}