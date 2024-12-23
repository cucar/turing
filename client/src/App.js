import React, { Suspense } from 'react';
import { mount, route, lazy } from 'navi';
import { Router, View } from 'react-navi';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import './App.css';
import Header from './header/header';
import Nav from './nav/nav';
import Footer from './footer/footer';
import Notification from './footer/notification';
import Home from './pages/home/home';
import RouteLoader from './shared/routeLoader';

function App() {
	
	const routes = mount({
		'/': route({ title: 'Turing Home Page', view: <Home /> }),
		'/catalog': lazy(() => import('./pages/catalog/catalog')),
		'/product': lazy(() => import('./pages/product/product')),
		'/cart': lazy(() => import('./pages/cart/cart')),
		'/checkout': lazy(() => import('./pages/checkout/checkout')),
		'/account': lazy(() => import('./pages/account/account'))
	});
	
	const theme = createMuiTheme({
		palette: {
			type: 'light',
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

	return (
		<MuiThemeProvider theme={theme}>
			<div className="content">
			
				<CssBaseline />
				
				<Router routes={routes}>
					<Header />
					<Nav />
					<div className="page">
						<RouteLoader>
							<Suspense fallback={null}>
								<View />
							</Suspense>
						</RouteLoader>
					</div>
				</Router>
				
				<Footer />
				
				<Notification />
			</div>
		</MuiThemeProvider>
	);
}

export default App;