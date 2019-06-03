import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import './footer.css';

export default function Footer() {
	return (
		<div className="footer">
			<AppBar color="primary" position="static">
				<Toolbar>
					<div className="dev-text">
						<div className="dev-text">
							Turing Challenge Test Store Developed By: <a href="https://cagdasucar.com" target="_new">Cagdas Ucar</a>
						</div>
					</div>
				</Toolbar>
			</AppBar>
		</div>
	);
}