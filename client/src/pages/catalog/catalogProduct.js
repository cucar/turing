import React from 'react';
import LinkButton from '../../shared/linkButton';
import { Card, CardContent } from '@material-ui/core';

import './catalogProduct.css';

/**
 * shows one product in catalog
 */
export default function CatalogProduct({ product }) {
	return (<>
		<Card>
			<CardContent>
				<div className="catalog-product">
					<div className="catalog-product-image">
						<img src={`/Images/product_images/${product.thumbnail}`} alt={product.name} />
					</div>
					<div className="catalog-product-info">
						<div className="catalog-product-header">
							{product.name}
						</div>
						<div className="catalog-product-text">
							{product.description}
						</div>
					</div>
					<div className="catalog-product-price">
						<div>
							<span className="catalog-product-effective-price">${parseFloat(product.discounted_price) > 0 ? product.discounted_price : product.price}</span>
							{parseFloat(product.discounted_price) > 0 && <span className="catalog-product-discounted-from">${product.price}</span>}
						</div>
					</div>
					<div className="catalog-product-link">
						<LinkButton href={`/product/${product.product_id}`} >View</LinkButton>
					</div>
				</div>
			</CardContent>
		</Card>
		<br/>
	</>);
}