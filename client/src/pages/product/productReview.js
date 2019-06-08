import React from 'react';

import Rating from '../../shared/rating';
import './productReview.css';

/**
 * shows a product review
 */
export default function ProductReview({ review }) {
	return (
		<div className="product-review">
			<div className="product-review-info">
				<Rating rating={review.rating.toString()} />
				<div className="product-review-customer">{review.customer_name}</div>
				<div className="product-review-date">{(new Date(review.created_on)).toLocaleString()}</div>
			</div>
			<div className="product-review-text">
				{review.review}
			</div>
		</div>
	);
}