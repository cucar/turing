import React from 'react';
import { useNavigation } from 'react-navi';

import { showSuccess } from '../../utils/notifications';
import { deleteSession } from '../../utils/session';

/**
 * logout screen
 */
export default function Logout() {
	
	deleteSession();
	
	showSuccess('Logout successful.');

	useNavigation().navigate('/');
	
	return (<h1>Logging Out...</h1>);
}