import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './header/header';

function App() {

	return (
		<div className="app">
			<Header />
			<div className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>Testing</p>
			</div>
		</div>
	);
}

export default App;
