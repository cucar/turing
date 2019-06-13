import React from 'react';
import ImageGallery from 'react-image-gallery';
import { useNavigation } from 'react-navi';

import './homeSlideShow.css';

/**
 * shows home page
 */
export default function SlideShow() {
	
	let navigator = useNavigation();
	
	let imageGalleryImages = [
		{ original: '/Images/images/slide1.jpg' },
		{ original: '/Images/images/slide2.jpg' },
		{ original: '/Images/images/slide3.jpg' },
		{ original: '/Images/images/slide4.jpg' }
	];
	
	return (
		<ImageGallery
			items={imageGalleryImages}
			showBullets={false}
			showFullscreenButton={false}
			showPlayButton={false}
			showIndex={false}
			showNav={false}
			showThumbnails={false}
			autoPlay={true}
			onClick={() => navigator.navigate('/catalog')}
		/>
	);
}