import React from 'react';
import { Card, CardContent, Breadcrumbs } from '@material-ui/core';
import { Link, useNavigation } from 'react-navi';
import Button from '@material-ui/core/Button/Button';
import PubSub from 'pubsub-js';

import LinkButton from '../../shared/linkButton';
import Rating from '../../shared/rating';
import ProductImages from './productImages';
import TuringSelectField from '../../shared/turingSelectField';
import TuringForm, { Validators } from '../../shared/turingForm';
import { Api } from '../../shared/api';
import { showSuccess } from '../../utils/notifications';
import { getSessionCartId, saveSessionCartId, saveSessionCartProductCount } from '../../utils/session';

import './productDetail.css';

/**
 * shows product details
 */
export default function ProductDetail({ productId }) {
	
	let navigator = useNavigation();
	
	/**
	 * returns the api parameters to be sent for adding product to cart - a little transformation is needed from the field values
	 */
	const getAddToCartParams = (fieldValues) => {
		return {
			cart_id: getSessionCartId(), // if there was no previous cart in session, this call will start a new cart on the server and we'll save that response in session
			product_id: productId,
			attributes: Object.values(fieldValues).join(', ') // combine the attribute values (labels) in a single comma separated string (should be normalized in the future)
		};
	};
	
	/**
	 * event handler for adding a product to cart - call pub-sub event called "CartUpdate" so that the shopping cart in nav menu can be updated with new product count
	 */
	const onAddToCart = (response) => {
		
		// save cart ID in session for subsequent calls
		saveSessionCartId(response.cart_id);
		saveSessionCartProductCount(response.product_count);
		
		// make a call to the mini cart to update the product count
		PubSub.publish('CartUpdate', response.product_count);
		
		// show success notification and redirect to cart page
		showSuccess('Product successfully added to cart.');
		navigator.navigate('/cart');
	};
	
	return (
		<Api endpoint={`products/${productId}`} render={product => (
			<Card>
				<CardContent>
					<div className="product-detail">
						
						<div className="product-images">
							<ProductImages images={product.images}/>
						</div>

						<div className="product-info">
							
							<div className="product-category">
								<Breadcrumbs separator="›">
									<Link color="inherit" href="/">Home</Link>
									<Link color="inherit" href="/catalog">Products</Link>
									<Link color="inherit" href={`/catalog?category_ids=${product.category.category_id}`}>{product.category.category_name}</Link>
								</Breadcrumbs>
							</div>
							
							<Rating rating={product.avg_rating || '5'} />
							
							<h1 className="product-title">{product.name}</h1>
							<p>{product.description}</p>
							
							<div className="product-price">
								<span className="product-effective-price">${parseFloat(product.discounted_price) > 0 ? product.discounted_price : product.price}</span>
								{parseFloat(product.discounted_price) > 0 && <span className="product-discounted-from">${product.price}</span>}
							</div>
							
							<div className="product-add-to-cart">
								<TuringForm endpoint="shoppingcart/add" method="POST" getApiParams={getAddToCartParams} onApiResponseReceived={onAddToCart}>
									{product.attributes.map(attribute => (
										<TuringSelectField key={`attribute_${attribute.attribute_id}`} label={attribute.attribute_name} options={attribute.values} validators={[ Validators.required ]} />
									))}
									<Button key="add-cart" variant="contained" color="primary">Add To Cart</Button>
									<LinkButton key="continue-shop" href={`/catalog?category_ids=${product.category.category_id}`}>Continue Shopping</LinkButton>
								</TuringForm>
							</div>
							
						</div>
					</div>
				</CardContent>
			</Card>
		)}/>
	);
}