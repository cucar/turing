import React from 'react';
import { Card, CardContent, CardActions } from '@material-ui/core';

import LinkButton from '../../shared/linkButton';
import { Api } from '../../shared/api';
import ProductRating from './productRating';
import ProductImages from './productImages';
import TuringSelectField from '../../shared/turingSelectField';
import TuringForm, { Validators } from '../../shared/turingForm';
import Button from '@material-ui/core/Button/Button';

import './productDetail.css';

/**
 * shows product details
 */
export default function ProductDetail({ productId }) {
	
	/**
	 * event handler for adding a product to cart - call pub-sub event called "CartUpdate" so that the shopping cart in nav menu can be updated with new product count
	 */
	const onAddToCart = () => {
		console.log('added product to cart');
	};
	
	return (
		<Api endpoint={`products/${productId}`} render={product => (
			<Card>
				<CardContent>
					<div className="product-detail">

						<ProductImages images={product.images}/>

						<div className="product-info">
							
							<div className="product-category">
								<h3>Category</h3>
								{JSON.stringify(product.category)}
							</div>
							
							<ProductRating rating={product.avg_rating} />
							
							<h1>{product.name}</h1>
							<p>{product.description}</p>
							
							<div className="product-price">
								<span className="product-effective-price">${parseFloat(product.discounted_price) > 0 ? product.discounted_price : product.price}</span>
								{parseFloat(product.discounted_price) > 0 && <span className="product-discounted-from">${product.price}</span>}
							</div>
						</div>
					</div>
				</CardContent>
				<CardActions>
					<TuringForm endpoint="shoppingcart/add" method="POST" onApiResponseReceived={onAddToCart}>
						{product.attributes.map(attribute => (
							<TuringSelectField key={attribute.attribute_id} label={attribute.attribute_name} options={attribute.values} validators={[ Validators.required ]} />
						))}
						<Button key="add-cart" variant="contained" color="primary">Add To Cart</Button>
						<LinkButton key="continue-shop" href="/catalog">Continue Shopping</LinkButton>
					</TuringForm>
				</CardActions>
			</Card>
		)}/>
	);
}