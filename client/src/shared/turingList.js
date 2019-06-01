import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Paper, Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from '@material-ui/core';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';
import { useNavigation } from 'react-navi';

import './turingList.css';

import callApi from '../utils/callApi';

/**
 * list component used to display records from the api page by page
 */
function TuringList({ endpoint, defaultOrderBy, detailRoute, children }) {
	
	// get navigation object - needed for redirecting to different screens from row click events
	let navigator = useNavigation();

	// get the list fields from children
	const listFields = children.map(child => child.props);
	
	// apiRequestSent is used for making sure that initial api call does not get repeated - since it needs to be updated synchronously, we can't make it state - using ref instead
	// similar for responseReceived - it is used for showing progress if api response takes too long
	const apiRequestSent = useRef(false);
	const responseReceived = useRef(false);
	
	// page data needs to be set together to make sure we don't trigger render more than once
	const [ pageData, setPageData ] = useState({ page: 0, pageSize: 10, orderField: defaultOrderBy, orderDirection: 'asc', totalRecords: 0, rows: [], showProgress: true });
	
	// shown options for page size in the list pagination drop down
	const pageSizeOptions = [ 10, 25, 100 ];
	
	/**
	 * retrieves the data for a requested page
	 */
	const getPage = async (endpoint, page, pageSize, orderField, orderDirection) => {
		
		// call the api and get the page data back
		// if there was an error fetching the data, api response will be null - error will be shown via a dialog - not much we can do in that case
		const apiResponse = await callApi(endpoint, { page: page, limit: pageSize, order: orderField, direction: orderDirection });
		
		// page data is successfully retrieved from the api - update state and trigger render
		setPageData({
			page: page,
			pageSize: pageSize,
			orderField: orderField,
			orderDirection: orderDirection,
			totalRecords: apiResponse.count,
			rows: apiResponse.rows,
			showProgress: false
		});
	};
	
	/**
	 * make initial api call and display the data
	 */
	useEffect(() => {
		
		// if initial api call was made in previous renders, no need to do anything - return - otherwise, set it true since we're about to make that call
		if (apiRequestSent.current) return;
		apiRequestSent.current = true;
		
		// get the initial page data from API and display it - this is called only on initial render, so progress is already shown initially and we stop it here once we get the api response
		(async () => {
			await getPage(endpoint, 0, 10, defaultOrderBy, 'asc');
		})();
	}, [ apiRequestSent, defaultOrderBy, endpoint ]);
	
	/**
	 * retrieves the data for a requested page - shows progress if it takes longer than 500 ms
	 */
	const getPageWithProgress = async (endpoint, page, pageSize, orderField, orderDirection) => {
		
		// start the timer to show the progress - if we get the response within 500 ms, we won't show progress - otherwise show it until response is received
		responseReceived.current = false;
		setTimeout(() => { if (!responseReceived.current) setPageData({...pageData, ...{ showProgress: true } }); }, 500);

		// now make the actual call - when the api response is received the progress will be automatically hidden
		await getPage(endpoint, page, pageSize, orderField, orderDirection);
		responseReceived.current = true;
	};
	
	/**
	 * list page change event handler - get the data for the requested page
	 */
	const onPageChange = async (event, newPage) => {
		await getPageWithProgress(endpoint, newPage, pageData.pageSize, pageData.orderField, pageData.orderDirection);
	};
	
	/**
	 * list page size change event handler - reset the page number to the first page and retrieve data with the new page size
	 */
	const onPageSizeChange = async (event) => {
		await getPageWithProgress(endpoint, 0, +event.target.value, pageData.orderField, pageData.orderDirection);
	};
	
	/**
	 * list sort request event handler - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onOrderChange = orderField => async () => {
		
		// switch direction if the same field is clicked multiple times
		const newOrderDirection = (pageData.orderField === orderField && pageData.orderDirection === 'desc' ? 'asc' : 'desc');
		
		// now get the data with the new sort field and direction
		await getPageWithProgress(endpoint, 0, pageData.pageSize, orderField, newOrderDirection);
	};
	
	/**
	 * row click event handler - only if a detail route has been given
	 */
	const onRowClick = useCallback((row) => {
		
		// if no detail route function is given, nothing to do - ignore
		if (!detailRoute) return;
		
		// run the detail route function and get the route we should go to - then redirect to it
		navigator.navigate(detailRoute(row));
	}, [ detailRoute, navigator ]);
	
	return (<>
		
		{pageData.showProgress && <LinearProgress />}
	
		{!pageData.showProgress && <Paper className="list-paper">
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
							<TableRow key={index} onClick={() => onRowClick(row)} className={detailRoute ? 'list-table-detail' : ''}>
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
		</Paper>}
	</>);
}

TuringList.propTypes = {
	children: PropTypes.node,
	endpoint: PropTypes.string.isRequired,
	defaultOrderBy: PropTypes.string.isRequired,
	detailRoute: PropTypes.any
};

export default TuringList;