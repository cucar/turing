import React from 'react';

import './productImages.css';

/**
 * shows product images
 */
export default function ProductImages({ images }) {
	return (
		<div className="product-images">
			<h2>Images</h2>
			{JSON.stringify(images)}
		</div>
	);
}