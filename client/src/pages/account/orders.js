import React, { useEffect, useRef, useState } from 'react';
import { Paper, Table, TableBody, TableHead, TableRow, TableCell, TableFooter, TablePagination, TableSortLabel } from '@material-ui/core';

import './orders.css';
import LinkButton from '../../shared/linkButton';

//************************************************** api emulation start **********************************************************************
function createData(name, calories, fat, carbs, protein) {
	return { name, calories, fat, carbs, protein };
}

const rows = [
	createData('Cupcake', 305, 3.7, 67, 4.3),
	createData('Donut', 452, 25.0, 51, 4.9),
	createData('Eclair', 262, 16.0, 24, 6.0),
	createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
	createData('Gingerbread', 356, 16.0, 49, 3.9),
	createData('Honeycomb', 408, 3.2, 87, 6.5),
	createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
	createData('Jelly Bean', 375, 0.0, 94, 0.0),
	createData('KitKat', 518, 26.0, 65, 7.0),
	createData('Lollipop', 392, 0.2, 98, 0.0),
	createData('Marshmallow', 318, 0, 81, 2.0),
	createData('Nougat', 360, 19.0, 9, 37.0),
	createData('Oreo', 437, 18.0, 63, 4.0),
];

function desc(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) return -1;
	if (b[orderBy] > a[orderBy]) return 1;
	return 0;
}

function stableSort(array, cmp) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
	return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

function getPage(page, pageSize, orderField, orderDirection) {
	return {
		page: page,
		pageSize: pageSize,
		totalRecords: rows.length,
		rows: stableSort(rows, getSorting(orderDirection, orderField)).slice(page * pageSize, page * pageSize + pageSize),
		orderField: orderField,
		orderDirection: orderDirection
	}
}
//************************************************** api emulation end **********************************************************************

/**
 * orders list screen
 */
export default function Orders() {
	
	// apiRequestSent is used for making sure that initial api call does not get repeated - since it needs to be updated synchronously, we can't make it state - using ref instead
	const apiRequestSent = useRef(false);
	
	// page data needs to be set together to make sure we don't trigger render more than once
	// default order field here should be initialized from given props for the list (defaultOrderBy)
	const [ pageData, setPageData ] = useState({ page: 0, pageSize: 10, orderField: '', orderDirection: 'asc', totalRecords: 0, rows: [] });
	
	// this data should be extracted from children of the list component
	const listFields = [
		{ id: 'name', label: 'Dessert (100g serving)' },
		{ id: 'calories', label: 'Calories' },
		{ id: 'fat', label: 'Fat (g)' },
		{ id: 'carbs', label: 'Carbs (g)' },
		{ id: 'protein', label: 'Protein (g)' }
	];

	// this should be a local property of the list component
	const pageSizeOptions = [ 10, 25, 100 ];
	
	/**
	 * make initial api call and display the data - this should be part of the list component
 	 */
	useEffect(() => {

		// if initial api call was made in previous renders, no need to do anything - return - otherwise, set it true since we're about to make that call
		if (apiRequestSent.current) return;
		apiRequestSent.current = true;
		
		// get the initial page data from API and display it - show progress if the response takes more than 200 ms
		setPageData(getPage(0, 10));
	}, [ apiRequestSent ]);
	
	/**
	 * list page change event handler - get the data for the requested page
	 */
	const onPageChange = (event, newPage) => {
		setPageData(getPage(newPage, pageData.pageSize, pageData.orderField, pageData.orderDirection));
	};
	
	/**
	 * list page size change event handler - reset the page number to the first page and retrieve data with the new page size
	 */
	const onPageSizeChange = (event) => {
		setPageData(getPage(0, +event.target.value, pageData.orderField, pageData.orderDirection));
	};
	
	/**
	 * list sort request event handler - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onOrderChange = orderField => () => {
		
		// switch direction if the same field is clicked multiple times
		const newOrderDirection = (pageData.orderField === orderField && pageData.orderDirection === 'desc' ? 'asc' : 'desc');

		// now get the data with the new sort field and direction
		setPageData(getPage(0, pageData.pageSize, orderField, newOrderDirection));
	};
	
	return (<>
		<h1>My Orders</h1>
		
		<Paper className="list-paper">
			<div className="list-div">
				<Table className="list-table">
					
					<TableHead>
						<TableRow>
							{listFields.map(field => (
								<TableCell key={field.id} className="list-table-header" sortDirection={pageData.orderField === field.id ? pageData.orderDirection : false}>
									<TableSortLabel active={pageData.orderField === field.id} direction={pageData.orderDirection} onClick={onOrderChange(field.id)}>
										{field.label}
									</TableSortLabel>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					
					<TableBody>
						{pageData.rows.map((row, index) => (
							<TableRow key={index}>
								{listFields.map(field => (<TableCell key={field.id} className="list-table-cell">{row[field.id]}</TableCell>))}
							</TableRow>
						))}
					</TableBody>
					
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={pageSizeOptions}
								colSpan={listFields.length}
								count={rows.length}
								rowsPerPage={pageData.pageSize}
								page={pageData.page}
								SelectProps={{ native: true }}
								onChangePage={onPageChange}
								onChangeRowsPerPage={onPageSizeChange}
							/>
						</TableRow>
					</TableFooter>
					
				</Table>
			</div>
		</Paper>
		
		<br/>
		
		<LinkButton href="/account">Get Back to My Account</LinkButton>
	</>);
}