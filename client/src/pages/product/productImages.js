import React from 'react';
import ImageGallery from 'react-image-gallery';

import './productImages.css';

/**
 * shows product images
 */
export default function ProductImages({ images }) {
	
	// format the image gallery image prop
	let imageGalleryImages = images.map(image => ({
		original: `/Images/product_images/${image}`,
		thumbnail: `/Images/product_images/${image}`
	}));
	
	return (
		<ImageGallery
			items={imageGalleryImages}
			showBullets={false}
			showFullscreenButton={false}
			showPlayButton={false}
			showIndex={false}
			showNav={false}
		/>
	);
}