import React, { useEffect, useRef, useState } from 'react';
import { Paper, Table, TableBody, TableHead, TableRow, TableCell, TableFooter, TablePagination } from '@material-ui/core';

import './orders.css';
import LinkButton from '../../shared/linkButton';

//************************************************** api emulation start **********************************************************************
function createData(name, calories, fat) {
	return { name, calories, fat };
}

const rows = [
	createData('Cupcake', 305, 3.7),
	createData('Donut', 452, 25.0),
	createData('Eclair', 262, 16.0),
	createData('Frozen yoghurt', 159, 6.0),
	createData('Gingerbread', 356, 16.0),
	createData('Honeycomb', 408, 3.2),
	createData('Ice cream sandwich', 237, 9.0),
	createData('Jelly Bean', 375, 0.0),
	createData('KitKat', 518, 26.0),
	createData('Lollipop', 392, 0.2),
	createData('Marshmallow', 318, 0),
	createData('Nougat', 360, 19.0),
	createData('Oreo', 437, 18.0),
	createData('2Cupcake', 305, 3.7),
	createData('2Donut', 452, 25.0),
	createData('2Eclair', 262, 16.0),
	createData('2Frozen yoghurt', 159, 6.0),
	createData('2Gingerbread', 356, 16.0),
	createData('2Honeycomb', 408, 3.2),
	createData('2Ice cream sandwich', 237, 9.0),
	createData('2Jelly Bean', 375, 0.0),
	createData('2KitKat', 518, 26.0),
	createData('2Lollipop', 392, 0.2),
	createData('2Marshmallow', 318, 0),
	createData('2Nougat', 360, 19.0),
	createData('2Oreo', 437, 18.0),
].sort((a, b) => (a.calories < b.calories ? -1 : 1));

function getPage(page, pageSize) {
	return {
		page: page,
		pageSize: pageSize,
		totalRecords: rows.length,
		rows: rows.slice(page * pageSize, page * pageSize + pageSize)
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
	const [ pageData, setPageData ] = useState({ page: 0, pageSize: 10, totalRecords: 0, rows: [] });
	
	// this data should be extracted from children of the list component
	const listFields = [
		{ id: 'desert', label: 'Dessert (100g serving)' },
		{ id: 'calories', label: 'Calories' },
		{ id: 'fat', label: 'Fat&nbsp;(g)' },
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
		setPageData(getPage(newPage, pageData.pageSize));
	};
	
	/**
	 * list page size change event handler - reset the page number to the first page and retrieve data with the new page size
	 */
	const onPageSizeChange = (event) => {
		setPageData(getPage(0, parseInt(event.target.value)));
	};

	return (<>
		<h1>My Orders</h1>
		
		<Paper className="list-paper">
			<div className="list-div">
				<Table className="list-table">
					<TableHead>
						<TableRow>
							{listFields.map(field => (<TableCell key={field.id} className="list-table-header">{field.label}</TableCell>))}
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