import React, { useState } from 'react';

import Star from '@material-ui/icons/Star';
import StarHalf from '@material-ui/icons/StarHalf';

import './productRating.css';

/**
 * shows product rating in stars
 */
export default function ProductRating({ rating }) {
	
	const [ starsRating ] = useState(rating || '5');
	
	return (
		<div className="product-rating">
			{Array(Math.floor(starsRating)).fill(0).map((zero, index) => <Star key={index} />)}
			{Math.ceil(starsRating) > Math.floor(starsRating) && <StarHalf />}
		</div>
	);
}