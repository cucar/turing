import React, { useEffect, Suspense } from 'react';
import { mount, route, lazy } from 'navi';
import { Router, View } from 'react-navi';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import './App.css';
import Layout from './shared/layout'
import Header from './header/header';
import Nav from './nav/nav';
import Footer from './footer/footer';
import Home from './pages/home';

function App() {
	
	const routes = mount({
		'/': 		route({ title: 'Turing Home Page', view: <Home /> }),
		'/catalog': lazy(() => import('./pages/catalog')),
		'/product': lazy(() => import('./pages/product')),
		'/cart': lazy(() => import('./pages/cart')),
		'/shipping': lazy(() => import('./pages/shipping')),
		'/review': lazy(() => import('./pages/review')),
		'/payment': lazy(() => import('./pages/payment')),
		'/checkout': lazy(() => import('./pages/checkout')),
		'/account': lazy(() => import('./pages/account')),
		'/order': lazy(() => import('./pages/order'))
	});
	
	const theme = createMuiTheme({
		palette: {
			type: 'dark',
			primary1Color: '#03a9f4',
			primary2Color: '#0277bd',
			primary3Color: '#01579b',
			accent1Color: '#ff7043',
			accent2Color: '#f4511e',
			accent3Color: '#bf360c',
			alternateTextColor: 'rgba(0, 0, 0, 0.68)',
			canvasColor: '#37474f'
		}
	});
	
	// testing data fetch from server
	useEffect(() => {(async function() {
		console.log(await (await fetch('/api/products')).json());
	})()});

	return (
		<MuiThemeProvider theme={theme}>
			<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
				<CssBaseline />
				<div style={{flex: 1}}>
					<Router routes={routes}>
						<Layout>
							<Suspense fallback={null}>
								<Header />
								<Nav />
								<div style={{ padding: 20 }}><View /></div>
							</Suspense>
						</Layout>
					</Router>
				</div>
				<Footer />
			</div>
		</MuiThemeProvider>
	);
}

export default withStyles({ root: { flexGrow: 1 } })(App);
