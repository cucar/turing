import React, { useEffect, useRef, useState } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { useNavigation } from 'react-navi';
import TextField from '@material-ui/core/TextField/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Avatar from '@material-ui/core/Avatar';
import Search from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button/Button';
import PubSub from 'pubsub-js';

import { getSessionCustomer } from '../utils/session';
import LinkButton from '../shared/linkButton';
import './header.css';


export default function Header() {
	
	// get navigation object - needed for redirecting to different screens from my account menu click events
	let navigator = useNavigation();

	// search field value is stored in this ref
	const searchField = useRef(null);
	
	// since we show the customer avatar and different things based on logged in/logged out, customer is part of our state
	const [ customer, setCustomer ] = useState(getSessionCustomer());

	// my account avatar popper menu element
	const [ myAccountMenu, setMyAccountMenu ] = useState(null);
	
	/**
	 * make the call to search for products
	 */
	const searchProducts = async () => {
		navigator.navigate(`/catalog?search=${searchField.current.value}`);
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
	
	/**
	 * subscribe to the authentication queue - this is so that we can update the view to show that customer logged in
	 */
	useEffect(() => {
		PubSub.subscribe('Authentication', () => {
			console.log('authentication change received');
			setCustomer(getSessionCustomer());
		});
	});
	
	/**
	 * my account avatar popper click handler - flips between showing and hiding the popper
	 */
	const avatarClicked = (event) => {
		setMyAccountMenu(event.currentTarget);
	};
	
	/**
	 * event handler to close my account menu
	 */
	const closeMyAccountMenu = () => {
		setMyAccountMenu(null);
	};
	
	/**
	 * event handler to handle logout click on my account menu
	 */
	const logout = () => {
		setMyAccountMenu(null);
		navigator.navigate('/account/logout');
	};
	
	/**
	 * event handler to handle my account click on my account menu
	 */
	const myAccountClicked = () => {
		setMyAccountMenu(null);
		navigator.navigate('/account');
	};

	return (
		<Toolbar>
			<div className="header">
				
				<div className="logo">
					<img src="/Images/images/logo.png" alt="Logo" />
				</div>
				
				<div className="search">
					<TextField label="Search"
							   inputRef={searchField}
							   onKeyPress={searchKeyPressed}
							   InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={searchProducts}><Search /></IconButton>
										</InputAdornment>
									)
								}}
					/>
				</div>
				
				<div className="account">
				
					{!customer && <div className="login-register">
						<LinkButton href="/account/register">Sign Up</LinkButton>
						<br/>
						<LinkButton href="/account/login">Login</LinkButton>
					</div>}
				
					{!!customer && <div className="logout-myaccount">
						<Avatar onClick={avatarClicked}>{customer.name.split(' ').map(name => name.substr(0, 1).toUpperCase()).join('')}</Avatar>
						<Popover
							open={Boolean(myAccountMenu)}
							anchorEl={myAccountMenu}
							onClose={closeMyAccountMenu}
							placement="bottom-end"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
							<div className="logout-myaccount-menu">
								Logged In As: {customer.name} <br/><br/>
								<Button variant="contained" color="primary" onClick={logout}>Logout</Button>
								<br/>
								<Button variant="contained" color="primary" onClick={myAccountClicked}>My Account</Button>
							</div>
						</Popover>
					</div>}
				
				</div>
				
			</div>
		</Toolbar>
	);
}