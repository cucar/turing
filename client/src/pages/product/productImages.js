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
	
	/**
	 * image gallery height is dynamic by default - our image heights are different, so it causes fluctuations of height when you go to next image
	 * we remedy that here by tapping into on image load function of the gallery and determining the image with the max height and setting the gallery height to that
	 */
	let maxImageHeight = 0;
	const onImageLoad = (event) => {
		
		// at the initial image load, there is nothing to do - just set the first image height and move on - the gallery height is already the first image height
		if (maxImageHeight === 0) { maxImageHeight = event.target.height; return; }

		// if we come across an image that was greater than anything we saw before, record it and set the gallery height to new high
		if (event.target.height > maxImageHeight) {
			maxImageHeight = event.target.height;
			document.getElementsByClassName('image-gallery-slide-wrapper')[0].style.height = maxImageHeight + 'px';
		}
	};
	
	return (
		<ImageGallery
			items={imageGalleryImages}
			showBullets={false}
			showFullscreenButton={false}
			showPlayButton={false}
			showIndex={false}
			showNav={false}
			onImageLoad={onImageLoad}
		/>
	);
}