import React, { useState, useEffect } from 'react';
import { Card, CardContent, Checkbox, FormControlLabel, TextField, InputAdornment, IconButton } from '@material-ui/core';
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
	
	// search field value is stored in this ref
	const [ searchTerm, setSearchTerm ] = useState(filters.search ? filters.search : '');
	
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
	 * make the call to search for products
	 */
	const searchProducts = async () => {
		navigator.navigate(`catalog?${queryString.stringify({...filters, ...{ page: 0, search: searchTerm } })}`);
	};
	
	/**
	 * search text field key press event - if enter is pressed, make the same call as search button click
	 */
	const searchKeyPressed = async (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			await searchProducts();
		}
	};
	
	return (<>
		<Card>
			<CardContent>
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
					
				</div>
			</CardContent>
		</Card>
		<br/>
	</>);
}