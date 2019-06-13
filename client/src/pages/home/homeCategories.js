import React from 'react';
import { Link } from 'react-navi';

import { Api } from '../../shared/api';
import './homeCategories.css';

/**
 * shows home page
 */
export default function HomeCategories() {
	
	return (
		<Api endpoint="categories/all" render={categories => (<>
			<h1 className="home-categories-header">Categories</h1>
			<div className="home-category-links">
				{categories.map(category =>
					<div className="home-category-link">
						<Link href={`/catalog?category_ids=${category.category_id}`}>{category.name}</Link>
					</div>
				)}
			</div>
		</>)} />
	);
}