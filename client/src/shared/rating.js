import React from 'react';
import PropTypes from 'prop-types';

import Star from '@material-ui/icons/Star';
import StarHalf from '@material-ui/icons/StarHalf';

import './rating.css';

/**
 * shows product rating in stars
 */
function Rating({ rating, onChange }) {

	// show pointer on stars if they are editable
	const editableClass = onChange ? 'rating-editable' : '';
	
	// if this is supposed to be editable, we should get integer ratings
	if (onChange && Math.ceil(parseFloat(rating)) > Math.floor(parseFloat(rating))) throw new Error('Rating component must have integer ratings when editable.');
	
	/**
	 * event handler for updating rating from a click
	 */
	const onClick = newRating => () => {
		if (onChange) onChange({ target: { value: newRating.toString() }});
	};
	
	return (
		<div className="rating">
			
			{/* full stars - showing current rating */}
			{Array(Math.floor(parseFloat(rating))).fill(0).map((zero, index) =>
				<Star className={`gold-star ${editableClass}`} key={index} onClick={onClick(index + 1)} />
			)}
			
			{/* half star - only used for view mode - if editable this should not be displayed */}
			{Math.ceil(parseFloat(rating)) > Math.floor(parseFloat(rating)) &&
				<StarHalf className={`gold-star ${editableClass}`} />
			}
			
			{/* empty stars - waiting to be completed */}
			{Math.ceil(parseFloat(rating)) < 5 && Array(5 - Math.ceil(parseFloat(rating))).fill(0).map((zero, index) =>
				<Star className={`disabled-star ${editableClass}`} key={index} onClick={onClick(Math.ceil(parseFloat(rating)) + index + 1)}/>
			)}
		</div>
	);
}

Rating.propTypes = {
	rating: PropTypes.string.isRequired,
	onChange: PropTypes.any
};

export default Rating;