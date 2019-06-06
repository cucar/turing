import React from 'react';

import './productRating.css';

/**
 * shows product rating in stars
 */
export default function ProductRating({ rating }) {
	return (
		<div className="product-rating">
			<h1>Avg Rating: {rating || '5'}</h1>
		</div>
	);
}