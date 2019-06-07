import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import PubSub from 'pubsub-js';

/**
 * global notification display - everywhere else in the application publishes their snackbar requests and
 * we fulfill them here by making the snackbar with that particular message visible for a short while.
 */
export default function Notification(props) {

	// state variables used to control the displayed information in snackbar
	const [ notificationDisplay, setNotificationDisplay ] = useState(false);
	const [ notificationMessage, setNotificationMessage ] = useState('');
	const [ notificationType, setNotificationType ] = useState('');
	
	/**
	 * subscribe to the notifications queue - this is going to be populated by the notification module in utils when any other module calls showError, showSuccess, etc.
	 */
	useEffect(() => {
		
		PubSub.subscribe('Notification', (msg, notification) => {
			
			// show the snackbar with the requested information by setting state variables
			setNotificationType(notification.type);
			setNotificationMessage(notification.message);
			setNotificationDisplay(true);
		});
		
		return () => PubSub.unsubscribe('Notification');
	}, [ props ]);
	
	/**
	 * returns the background color based on notification type
	 */
	function getNotificationColor(notificationType) {
		switch (notificationType) {
			case 'success': return green[600];
			case 'error': return red[600];
			case 'warning': return amber[600];
			case 'info': return blue[600];
			default: return red[600];
		}
	}
	
	/**
	 * close button event handler
	 */
	function hideNotification(event, reason) {
		
		// ignore the click away events - we only allow closing by explicitly clicking the close icon
		if (reason === 'clickaway') return;
		
		// close the snackbar by setting state variables
		setNotificationDisplay(false);
		setNotificationMessage('');
		setNotificationType('');
	}
	
	return (
		<Snackbar
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			open={notificationDisplay}
			autoHideDuration={5000}
			onClose={hideNotification}
		>
			<SnackbarContent
				style={{ background: getNotificationColor(notificationType), color: grey[50] }}
				message={
					<span id="notification-snackbar" style={{ display: 'flex', alignItems: 'center', fontSize: 18 }}>
						{notificationType === 'success' && <CheckCircleIcon />}
						{notificationType === 'error' && <ErrorIcon />}
						{notificationType === 'warning' && <WarningIcon />}
						{notificationType === 'info' && <InfoIcon />}
						&nbsp;
						{notificationMessage}
					</span>
				}
				action={[
					<IconButton
						key="close"
						aria-label="Close"
						color="inherit"
						onClick={hideNotification}
					>
						<CloseIcon />
					</IconButton>
				]}
			/>
		</Snackbar>
	);
}