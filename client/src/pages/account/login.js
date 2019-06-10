import React from 'react';
import { useNavigation } from 'react-navi';
import { Card, CardContent, Button } from '@material-ui/core';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import TuringForm, { Validators } from '../../shared/form/turingForm';
import TuringTextField from '../../shared/form/turingTextField';
import TuringPasswordField from '../../shared/form/turingPasswordField';
import TuringFormSubmitButton from '../../shared/form/turingFormSubmitButton';
import LinkButton from '../../shared/linkButton';
import { showSuccess } from '../../utils/notifications';
import { saveSession } from '../../utils/session';
import callApi from '../../utils/callApi';
import './login.css';

/**
 * login screen
 */
export default function Login() {

	// the app id may need to be modified later - this is a test facebook app
	const facebookAppId = 2229156180500829;
	
	// get navigation object
	let navigator = useNavigation();
	
	/**
	 * facebook response event handler
	 */
	const customerLoggedInToFacebook = async (facebookResponse) => {
		
		// if there is no access token, not logged in to our app in Facebook - ignore
		// debug: console.log('facebook response', facebookResponse);
		if (!facebookResponse || !facebookResponse.accessToken) return;
		
		// now make the call to our server and verify the token and generate login session if it's a valid customer
		const apiResponse = await callApi('customers/facebook', { access_token: facebookResponse.accessToken }, 'POST');
		// debug: console.log('api response', apiResponse);
		if (!apiResponse) return; // if there was an error, it will be displayed with a dialog and the response will be null
		
		// looks like login with Facebook was successful - continue like the regular login
		await customerLoggedIn(apiResponse);
	};

	/**
	 * post login event handler
	 */
	const customerLoggedIn = async (response) => {
		
		showSuccess('Login successful.');
		
		// save customer info to local storage along with session token so that it can be called for authorization requiring API calls in the future
		saveSession(response);
		
		// redirect to my account page
		navigator.navigate('/account');
	};
	
	return (
		<Card>
			<CardContent className="login">
				<h1>Login</h1>
				
				<TuringForm endpoint="customers/login" method="POST" onApiResponseReceived={customerLoggedIn}>
					<TuringTextField key="email" label="Email" validators={[ Validators.required, Validators.email ]} />
					<TuringPasswordField key="password" label="Password" validators={[ Validators.required, Validators.password ]} />
					<br/>
					<TuringFormSubmitButton className="login-button" key="login" label="Login" />
				</TuringForm>
				
				<div className="facebook-login-text">
					If you already registered with our site before, you can also login with Facebook:
				</div>
				
				<FacebookLogin appId={facebookAppId} fields="name,email" callback={customerLoggedInToFacebook} isMobile={false} version="3.3" render={renderProps => (
					<Button className="facebook-login-button" variant="contained" color="primary" onClick={renderProps.onClick}>Login With Facebook</Button>
				)} />
				
				<div className="signup-text">
					If you do not have an account yet, get an account by signing up:
				</div>
				
				<LinkButton className="register-button" href="/account/register">Sign Up</LinkButton>
			
			</CardContent>
		</Card>
	);
}