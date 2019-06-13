import React from 'react';
import { Card, CardContent } from '@material-ui/core';

import { Api } from '../../shared/api';
import HomeSlideShow from './homeSlideShow';
import HomeCategories from './homeCategories';
import FeaturedProduct from './featuredProduct';
import './home.css';

/**
 * shows home page
 */
export default function Home() {
	
	return (<>
		
		<Card>
			<CardContent className="home-slideshow-container">
				<div className="home-slideshow">
					<HomeSlideShow />
				</div>
				<div className="home-categories">
					<HomeCategories />
				</div>
			</CardContent>
		</Card>
		
		<div className="home-featured-products">
			<Api endpoint="products/featured" render={products => products.map(product => <FeaturedProduct key={product.product_id} product={product} />)} />
		</div>
		
	</>);
}