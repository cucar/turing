import React from 'react';

import ProductRating from './productRating';
import './productReview.css';

/**
 * shows a product review
 */
export default function ProductReview({ review }) {
	return (
		<div className="product-review">
			<div className="product-review-info">
				<ProductRating rating={review.rating} />
				{review.customer_name}<br/>
				{review.created_on}
			</div>
			<div className="product-review-text">
				{review.review}
			</div>
		</div>
	);
}