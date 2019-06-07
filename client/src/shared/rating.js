import React, { useState } from 'react';

import Star from '@material-ui/icons/Star';
import StarHalf from '@material-ui/icons/StarHalf';

import './rating.css';

/**
 * shows product rating in stars
 */
export default function Rating({ rating }) {
	
	const [ starsRating ] = useState(rating || '5');
	
	return (
		<div className="rating">
			{Array(Math.floor(starsRating)).fill(0).map((zero, index) => <Star className="gold-star" key={index} />)}
			{Math.ceil(starsRating) > Math.floor(starsRating) && <StarHalf className="gold-star" />}
			{Math.ceil(starsRating) < 5 && Array(5 - Math.ceil(starsRating)).fill(0).map((zero, index) => <Star className="disabled-star" key={index} />)}
		</div>
	);
}