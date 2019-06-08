import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Divider, List, ListItem, Paper, Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from '@material-ui/core';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';
import { useNavigation } from 'react-navi';

import './turingList.css';

import callApi from '../../utils/callApi';
import Select from '@material-ui/core/Select/Select';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';

/**
 * list component used to display records from the api page by page
 */
function TuringList({
						endpoint,
						defaultOrderBy,
						defaultOrderDirection = 'asc',
						allowSort = true,
						forcePageSize,
						defaultView,
						renderListItem,
						detailRoute,
						onApiResponseReceived,
						children
}) {
	
	// get navigation object - needed for redirecting to different screens from row click events
	let navigator = useNavigation();

	// get the list fields from children
	const listFields = children.map(child => child.props);
	
	// apiRequestSent is used for making sure that initial api call does not get repeated - since it needs to be updated synchronously, we can't make it state - using ref instead
	// similar for responseReceived - it is used for showing progress if api response takes too long
	const apiRequestSent = useRef(false);
	const responseReceived = useRef(false);
	
	// page data needs to be set together to make sure we don't trigger render more than once
	const [ pageData, setPageData ] = useState({
		page: 0,
		pageSize: (forcePageSize ? forcePageSize : 10),
		orderField: defaultOrderBy,
		orderDirection: defaultOrderDirection,
		totalRecords: 0,
		rows: [],
		showProgress: true
	});
	
	// shown options for page size in the list pagination drop down
	const pageSizeOptions = (forcePageSize ? [ forcePageSize ] : [ 10, 25, 100 ]);
	
	/**
	 * we have two modes of display: table and list item modes - this function determines which one we will use
	 */
	const isTableMode = () => {
		
		// if caller does not want us to use a particular mode at all times, do that
		if (defaultView) return (defaultView === 'table');
		
		// if the width of the window goes below a certain amount, switch to list item mode
		return (window.innerWidth > 900);
	};
	
	// we have two modes of display: table and list item modes - this state variable holds which one is in effect
	const [ tableMode, setTableMode ] = useState(isTableMode());
	
	/**
	 * event listener to update the view for responsive design
	 */
	useEffect(() => {
		const onWindowResize = () => setTableMode(isTableMode());
		window.addEventListener('resize', onWindowResize);
		return () => window.removeEventListener('resize', onWindowResize);
	});
	
	/**
	 * returns the list item rendering for list mode (non-table mode)
	 */
	const getListItem = (row) => {
		
		// if a custom render item logic is given, use that
		if (renderListItem) return renderListItem(row);
		
		// otherwise use the default rendering for list items
		return (
			<ListItem onClick={() => onRowClick(row)} className={detailRoute ? 'list-mobile-item-container list-table-detail' : 'list-mobile-item-container'}>
				{listFields.map(field => (
					<div key={field.id} className="list-mobile-item">
						<span className="list-mobile-label">{field.label}:</span>
						<span className="list-mobile-data">{row[field.id]}</span>
					</div>
				))}
			</ListItem>
		);
	};
	
	/**
	 * retrieves the data for a requested page
	 */
	const getPage = async (endpoint, page, pageSize, orderField, orderDirection, onApiResponseReceived) => {
		
		// call the api and get the page data back
		// if there was an error fetching the data, api response will be null - error will be shown via a dialog - not much we can do in that case
		const apiResponse = await callApi(endpoint, { page: page, limit: pageSize, order: orderField, direction: orderDirection });
		
		// if there are events to be done in the parent, call back the event hook
		if (onApiResponseReceived) onApiResponseReceived(apiResponse);
		
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
			await getPage(endpoint, 0, (forcePageSize ? forcePageSize : 10), defaultOrderBy, 'asc', onApiResponseReceived);
		})();
	}, [ apiRequestSent, defaultOrderBy, endpoint, forcePageSize, onApiResponseReceived ]);
	
	/**
	 * retrieves the data for a requested page - shows progress if it takes longer than 500 ms
	 */
	const getPageWithProgress = async (endpoint, page, pageSize, orderField, orderDirection, onApiResponseReceived) => {
		
		// start the timer to show the progress - if we get the response within 500 ms, we won't show progress - otherwise show it until response is received
		responseReceived.current = false;
		setTimeout(() => { if (!responseReceived.current) setPageData({...pageData, ...{ showProgress: true } }); }, 500);

		// now make the actual call - when the api response is received the progress will be automatically hidden
		await getPage(endpoint, page, pageSize, orderField, orderDirection, onApiResponseReceived);
		responseReceived.current = true;
	};
	
	/**
	 * list page change event handler - get the data for the requested page
	 */
	const onPageChange = async (event, newPage) => {
		await getPageWithProgress(endpoint, newPage, pageData.pageSize, pageData.orderField, pageData.orderDirection, onApiResponseReceived);
	};
	
	/**
	 * list page size change event handler - reset the page number to the first page and retrieve data with the new page size
	 */
	const onPageSizeChange = async (event) => {
		await getPageWithProgress(endpoint, 0, +event.target.value, pageData.orderField, pageData.orderDirection, onApiResponseReceived);
	};
	
	/**
	 * list sort request event handler for the table view - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onTableOrderChange = orderField => async () => {
		
		// switch direction if the same field is clicked multiple times
		const newOrderDirection = (pageData.orderField === orderField && pageData.orderDirection === 'desc' ? 'asc' : 'desc');
		
		// now get the data with the new sort field and direction
		await getPageWithProgress(endpoint, 0, pageData.pageSize, orderField, newOrderDirection, onApiResponseReceived);
	};
	
	/**
	 * list sort request event handler for the list item mode - reset the page number to the first page and retrieve data with the new sort field/direction
	 */
	const onListOrderChange = async (event) => {
		
		// new order comes from sort options dropdown where order field and direction are concatenated with a pipe - split them
		const orderParts = event.target.value.split('|');
		
		// now get the data with the new sort field and direction
		await getPageWithProgress(endpoint, 0, pageData.pageSize, orderParts[0], orderParts[1], onApiResponseReceived);
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

		{/* show progress until we receive the data from the api */}
		{pageData.showProgress && <LinearProgress />}
		
		{/* api data received - show it in the list */}
		{!pageData.showProgress && <Paper className="list-paper">
			<div className="list-div">

				{/* no records found in the api data - show that */}
				{pageData.totalRecords === 0 && <div className="list-no-records">No records found.</div>}
				
				{/* table mode - list using table components */}
				{pageData.totalRecords > 0 && tableMode && <Table className="list-table">
					
					<TableHead>
						<TableRow>
							{listFields.map(field => (
								<TableCell key={field.id} className="list-table-header" sortDirection={pageData.orderField === field.id ? pageData.orderDirection : false}>
									{allowSort && <TableSortLabel active={pageData.orderField === field.id} direction={pageData.orderDirection} onClick={onTableOrderChange(field.id)}>
										{field.label}
									</TableSortLabel>}
									{!allowSort && field.label}
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
					
					{pageData.totalRecords > pageData.pageSize && <TableFooter>
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
					</TableFooter>}
				
				</Table>}
				
				{/* list item mode - list using list components */}
				{pageData.totalRecords > 0 && !tableMode && <>
					
					{allowSort && <div className="list-mobile-sort">
						<span>Sort Order:</span> &nbsp;
						<Select value={`${pageData.orderField}|${pageData.orderDirection}`} onChange={onListOrderChange} inputProps={{ name: 'order', id: 'order' }}>
							{listFields.reduce((res, field) => res.concat([
								{ ...field, sort: `${field.id}|asc`, label: `${field.label} Ascending` },
								{ ...field, sort: `${field.id}|desc`, label: `${field.label} Descending` }
							]), []).map(field => (
								<MenuItem key={field.sort} value={field.sort}>{field.label}</MenuItem>
							))}
						</Select>
					</div>}
					{allowSort && <Divider />}

					<List>
						{pageData.rows.map((row, index) => (
							<div key={index} className="list-mobile-item-divider-wrap">
								{getListItem(row)}
								{index !== pageData.rows.length - 1 && <Divider/>}
							</div>
						))}
					</List>
					
					{pageData.totalRecords > pageData.pageSize && <Table className="pagination">
						<TableBody>
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
						</TableBody>
					</Table>}
				</>}
				
			</div>
		</Paper>}
	</>);
}

TuringList.propTypes = {
	children: PropTypes.node,
	endpoint: PropTypes.string.isRequired,
	defaultOrderBy: PropTypes.string.isRequired,
	defaultOrderDirection: PropTypes.string,
	defaultView: PropTypes.string,
	detailRoute: PropTypes.any,
	renderListItem: PropTypes.any,
	forcePageSize: PropTypes.number,
	onApiResponseReceived: PropTypes.any
};

export default TuringList;