import React from 'react';
import { mount, route } from 'navi';
import { useNavigation } from 'react-navi';
import { Card, CardContent, Table, TableBody, TablePagination, TableRow, Typography } from '@material-ui/core';

import { Api } from '../../shared/api';
import CatalogProduct from './catalogProduct';
import DepartmentHeader from './departmentHeader';
import CategoryHeader from './categoryHeader';
import CatalogFilters from './catalogFilters';
import LinkButton from '../../shared/linkButton';

import './catalog.css';

const queryString = require('querystring');

export default mount({
	'/': route(req => ({ title: 'Turing Catalog Page', view: <Catalog filters={req.params} /> }))
});

/**
 * shows the products in catalog
 */
function Catalog({ filters }) {
	
	// get navigation object - needed for updating view for changes in filters
	let navigator = useNavigation();
	
	// shown options for page size in the pagination drop down
	const pageSizeOptions = [ 10, 25, 100 ];
	
	// when ever we're re-rendering, scroll to top
	window.scrollTo(0, 0);

	/**
	 * get category or department description and show it if needed
	 */
	const getCatalogHeader = () => {
		
		// if only one department is selected in department ids with no category in the filters, it's department page - show department name and description here
		if (filters.hasOwnProperty('department_ids') && !filters.department_ids.includes(',') && !filters.category_ids) return (<DepartmentHeader departmentId={filters.department_ids} />);

		// if only one category is selected in category ids in the filters, it's category page - show category name and description here*/
		if (filters.hasOwnProperty('category_ids') && !filters.category_ids.includes(',')) return (<CategoryHeader categoryId={filters.category_ids} />);

		// in other cases it's all products list with some kind of custom filtering - we will show them in layered navigation
		return '';
	};
	
	/**
	 * list page change event handler - redirect to the new page with new route params
	 */
	const onPageChange = async (event, newPage) => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: newPage } })}`);
	};
	
	/**
	 * list page size change event handler - reset the page number to the first page and retrieve data with the new page size
	 */
	const onPageSizeChange = async (event) => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, limit: +event.target.value } })}`);
	};
	
	return (<>
		
		{/* if we're displaying a particular department or category, show info about it */}
		{getCatalogHeader()}
		
		{/* make the api call to get the products and display them - we pass the route parameters (query string) as-is to the api */}
		<Api endpoint="products" args={filters} render={products => (<>
			
			{/* show the layered navigation here along with the applied filters */}
			<CatalogFilters products={products} filters={filters} />
			
			{/* no products found in result set view */}
			{products.count === 0 &&
				<Card>
					<CardContent>
						<Typography variant="body1">Could not find any products that match the search criteria.</Typography>
						<br/>
						<LinkButton href="/catalog">View All Products</LinkButton>
					</CardContent>
				</Card>
			}
			
			{/* products list */}
			{products.rows.map(product => (<CatalogProduct key={product.product_id} product={product}/>))}

			{/* pagination and sort controls */}
			<Card>
				<CardContent>
					<Table className="pagination">
						<TableBody>
							<TableRow>
								<TablePagination
								rowsPerPageOptions={pageSizeOptions}
								count={products.count}
								rowsPerPage={filters.limit ? parseInt(filters.limit) : 10}
								page={parseInt(filters.page) || 0}
								SelectProps={{ native: true }}
								onChangePage={onPageChange}
								onChangeRowsPerPage={onPageSizeChange}
								/>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</>)}/>
	</>);
}