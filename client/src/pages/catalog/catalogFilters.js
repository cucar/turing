import React, { useState, useEffect } from 'react';
import { Card, CardContent, Checkbox, FormControlLabel, TextField, InputAdornment, IconButton, Select, MenuItem } from '@material-ui/core';
import Search from '@material-ui/icons/Search';
import { useNavigation } from 'react-navi';

import './catalogFilters.css';

const queryString = require('querystring');

/**
 * shows catalog filters
 */
export default function CatalogFilters({ products, filters }) {
	
	// get navigation object - needed for updating view for changes in filters
	let navigator = useNavigation();
	
	const [ searchTerm, setSearchTerm ] = useState(filters.search ? filters.search : '');
	const [ minPrice, setMinPrice ] = useState(filters.min_price ? filters.min_price : '');
	const [ maxPrice, setMaxPrice ] = useState(filters.max_price ? filters.max_price : '');
	
	/**
	 * when global search is triggered, we end up getting re-rendered - update state in such a case
	 */
	useEffect(() => {
		setSearchTerm(filters.search ? filters.search : '');
	}, [ filters.search ]);
	
	/**
	 * department filter change - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onDepartmentFilter = (departmentId) => () => {
		let departmentIds = (filters.department_ids ? filters.department_ids.split(',') : []);
		if (departmentIds.includes(departmentId.toString())) departmentIds = departmentIds.filter(d => d !== departmentId.toString());
		else departmentIds.push(departmentId);
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, department_ids: departmentIds.join(',') } })}`);
	};
	
	/**
	 * category filter change - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onCategoryFilter = (categoryId) => () => {
		let categoryIds = (filters.category_ids ? filters.category_ids.split(',') : []);
		if (categoryIds.includes(categoryId.toString())) categoryIds = categoryIds.filter(c => c !== categoryId.toString());
		else categoryIds.push(categoryId);
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, category_ids: categoryIds.join(',') } })}`);
	};
	
	/**
	 * attribute filter change - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onAttributeFilter = (attributeValueId) => () => {
		let attributeValueIds = (filters.attribute_value_ids ? filters.attribute_value_ids.split(',') : []);
		if (attributeValueIds.includes(attributeValueId.toString())) attributeValueIds = attributeValueIds.filter(a => a !== attributeValueId.toString());
		else attributeValueIds.push(attributeValueId);
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, attribute_value_ids: attributeValueIds.join(',') } })}`);
	};
	
	/**
	 * discount filter change - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onDiscountFilter = () => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, discounted: (filters.discounted === '1' ? '0' : '1') } })}`);
	};
	
	/**
	 * price filter change - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onMinPriceFilter = () => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, min_price: minPrice } })}`);
	};
	
	/**
	 * min price text field key press event - if enter is pressed, make the same call as search button click
	 */
	const minPriceKeyPressed = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			onMinPriceFilter();
		}
	};
	
	/**
	 * price filter change - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onMaxPriceFilter = () => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, max_price: maxPrice } })}`);
	};
	
	/**
	 * max price text field key press event - if enter is pressed, make the same call as search button click
	 */
	const maxPriceKeyPressed = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			onMaxPriceFilter();
		}
	};
	
	/**
	 * make the call to search for products
	 */
	const searchProducts = () => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, search: searchTerm } })}`);
	};
	
	/**
	 * search text field key press event - if enter is pressed, make the same call as search button click
	 */
	const searchKeyPressed = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			searchProducts();
		}
	};
	
	/**
	 * list sort request event handler - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onOrderChange = (event) => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, order: event.target.value } })}`);
	};
	
	return (<>
		<Card>
			<CardContent>
				
				{/* even though not necessarily a filter, sort option probably fits here the best */}
				<div className="sort">
					<span>Sort Order:</span> &nbsp;
					<Select value={filters.order || 'product_id_desc'} onChange={onOrderChange} inputProps={{ name: 'order', id: 'order' }}>
						<MenuItem value="product_id_desc">Newest</MenuItem>
						<MenuItem value="product_id_asc">Oldest</MenuItem>
						<MenuItem value="effective_price_asc">Lowest Price</MenuItem>
						<MenuItem value="effective_price_desc">Highest Price</MenuItem>
					</Select>
				</div>
				<br/>

				<div className="catalog-filters">

					{/* search filter */}
					<div className="catalog-filter">
						<TextField
							label="Search"
							value={searchTerm}
							onChange={event => setSearchTerm(event.target.value)}
							onKeyPress={searchKeyPressed}
							InputProps={{ endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={searchProducts}>
										<Search />
									</IconButton>
								</InputAdornment>
							)}}
						/>
					</div>
					
					{/* minium price filter - we should use react-number-format library here sometime in the future */}
					<div className="catalog-filter">
						<TextField
							label="Min Price"
							type="number"
							value={minPrice}
							onChange={event => setMinPrice(event.target.value)}
							onKeyPress={minPriceKeyPressed}
							InputProps={{ endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={onMinPriceFilter}>
											<Search />
										</IconButton>
									</InputAdornment>
								)}}
						/>
					</div>
					
					{/* maximum price filter - we should use react-number-format library here sometime in the future */}
					<div className="catalog-filter">
						<TextField
							label="Max Price"
							type="number"
							value={maxPrice}
							onChange={event => setMaxPrice(event.target.value)}
							onKeyPress={maxPriceKeyPressed}
							InputProps={{ endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={onMaxPriceFilter}>
											<Search />
										</IconButton>
									</InputAdornment>
								)}}
						/>
					</div>

					{/* department filter */}
					<div className="catalog-filter">
						<span className="catalog-filter-header">Departments:</span>
						<div className="catalog-filter-checkboxes">
							{products.departments.map(department => (
								<FormControlLabel
									key={department.department_id}
									className="catalog-filter-checkbox"
									control={
										<Checkbox
											checked={filters.department_ids ? filters.department_ids.split(',').includes(department.department_id.toString()) : false}
											onChange={onDepartmentFilter(department.department_id)}
											color="primary"
										/>
									}
									label={department.department_name}
								/>
							))}
						</div>
					</div>
					
					{/* category filter */}
					<div className="catalog-filter">
						<span className="catalog-filter-header">Categories:</span>
						<div className="catalog-filter-checkboxes">
							{products.categories.map(category => (
								<FormControlLabel
									key={category.category_id}
									className="catalog-filter-checkbox"
									control={
										<Checkbox
											checked={filters.category_ids ? filters.category_ids.split(',').includes(category.category_id.toString()) : false}
											onChange={onCategoryFilter(category.category_id)}
											color="primary"
										/>
									}
									label={category.category_name}
								/>
							))}
						</div>
					</div>
					
					{/* attribute filters */}
					{products.attributes.map(attribute => (
						<div className="catalog-filter" key={attribute.attribute_id}>
							<span className="catalog-filter-header">{attribute.attribute_name}:</span>
							<div className="catalog-filter-checkboxes">
								{attribute.values.map(attributeValue => (
									<FormControlLabel
										key={attributeValue.attribute_value_id}
										className="catalog-filter-checkbox"
										control={
											<Checkbox
												checked={filters.attribute_value_ids ? filters.attribute_value_ids.split(',').includes(attributeValue.attribute_value_id.toString()) : false}
												onChange={onAttributeFilter(attributeValue.attribute_value_id)}
												color="primary"
											/>
										}
										label={attributeValue.attribute_value}
									/>
								))}
							</div>
						</div>
					))}
					
					{/* discount filter */}
					<div className="catalog-filter">
						<span className="catalog-filter-header">Discounted:</span>
						<div className="catalog-filter-checkboxes">
							<FormControlLabel
								className="catalog-filter-checkbox"
								control={
									<Checkbox
										checked={filters.discounted === '1'}
										onChange={onDiscountFilter}
										color="primary"
									/>
								}
								label="Discounted"
							/>
						</div>
					</div>
					
				</div>
			</CardContent>
		</Card>
		<br/>
	</>);
}