import React from 'react';
import { Card, CardContent } from '@material-ui/core';

import HomeSlideShow from './homeSlideShow';
import HomeCategories from './homeCategories';
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
			<Card>
				<CardContent className="home-featured-product">
					Featured Product 1
				</CardContent>
			</Card>
			<Card>
				<CardContent className="home-featured-product">
					Featured Product 2
				</CardContent>
			</Card>
		</div>
		
	</>);
}