import React from 'react';
import LinkButton from '../../shared/linkButton';
import { Card, CardContent } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

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
							<Typography variant="h4">{product.name}</Typography>
						</div>
						<div className="catalog-product-text">
							{product.description}
						</div>
					</div>
					<div className="catalog-product-price">
						<div>
							<Typography variant="h6">${product.price}</Typography>
							<br/>
							${product.discounted_price}
						</div>
					</div>
					<div className="catalog-product-link">
						<LinkButton href={`/products/${product.product_id}`} >View</LinkButton>
					</div>
				</div>
			</CardContent>
		</Card>
		<br/>
	</>);
}