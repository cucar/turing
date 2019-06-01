import React, { useEffect, useRef, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from '@material-ui/core';
import PropTypes from 'prop-types';

import callApi from '../utils/callApi';

import './turingList.css';

/**
 * list component used to display records from the api page by page
 */
function TuringList({ endpoint, listFields, defaultOrderBy }) {
	
	// apiRequestSent is used for making sure that initial api call does not get repeated - since it needs to be updated synchronously, we can't make it state - using ref instead
	const apiRequestSent = useRef(false);
	
	// page data needs to be set together to make sure we don't trigger render more than once
	const [ pageData, setPageData ] = useState({ page: 0, pageSize: 10, orderField: defaultOrderBy, orderDirection: 'asc', totalRecords: 0, rows: [] });
	
	// shown options for page size in the list pagination drop down
	const pageSizeOptions = [ 10, 25, 100 ];
	
	/**
	 * retrieves the data for a requested page
	 */
	const getPage = async (endpoint, page, pageSize, orderField, orderDirection) => {
		
		// call the api and get the page data back
		const apiResponse = await callApi(endpoint, { page: page, limit: pageSize, order: orderField, direction: orderDirection });
		
		// if there was an error fetching the data, api response will be null - error will be shown via a dialog - not much we can do in that case - keep current state
		if (!apiResponse) return;
		
		// page data is successfully retrieved from the api - update state and trigger render
		return {
			page: page,
			pageSize: pageSize,
			orderField: orderField,
			orderDirection: orderDirection,
			totalRecords: apiResponse.count,
			rows: apiResponse.rows
		};
	};
	
	/**
	 * make initial api call and display the data
	 */
	useEffect(() => {
		
		// if initial api call was made in previous renders, no need to do anything - return - otherwise, set it true since we're about to make that call
		if (apiRequestSent.current) return;
		apiRequestSent.current = true;
		
		// get the initial page data from API and display it - show progress if the response takes more than 200 ms
		(async () => {
			setPageData(await getPage(endpoint, 0, 10, defaultOrderBy, 'asc'));
		})();
	}, [ apiRequestSent, defaultOrderBy, endpoint ]);
	
	/**
	 * list page change event handler - get the data for the requested page
	 */
	const onPageChange = async (event, newPage) => {
		setPageData(await getPage(endpoint, newPage, pageData.pageSize, pageData.orderField, pageData.orderDirection));
	};
	
	/**
	 * list page size change event handler - reset the page number to the first page and retrieve data with the new page size
	 */
	const onPageSizeChange = async (event) => {
		setPageData(await getPage(endpoint, 0, +event.target.value, pageData.orderField, pageData.orderDirection));
	};
	
	/**
	 * list sort request event handler - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onOrderChange = orderField => async () => {
		
		// switch direction if the same field is clicked multiple times
		const newOrderDirection = (pageData.orderField === orderField && pageData.orderDirection === 'desc' ? 'asc' : 'desc');
		
		// now get the data with the new sort field and direction
		setPageData(await getPage(endpoint, 0, pageData.pageSize, orderField, newOrderDirection));
	};
	
	return (
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
								count={pageData.totalRecords}
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
	);
}

TuringList.propTypes = {
	children: PropTypes.node,
	endpoint: PropTypes.string.isRequired,
	defaultOrderBy: PropTypes.string.isRequired,
	listFields: PropTypes.array.isRequired
};

export default TuringList;