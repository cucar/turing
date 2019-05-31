import PubSub from 'pubsub-js';

// the provider of this pubsub queue is the app main component - it shows the error message when it sees this in the queue
const showNotification = (message, type) => {
	console.log(message);
	PubSub.publish('Notification', { message: message, type: type });
	return '';
};

const showError = (message) => showNotification(message, 'error');
const showInfo = (message) => showNotification(message, 'info');
const showSuccess = (message) => showNotification(message, 'success');
const showWarning = (message) => showNotification(message, 'warning');

export { showError, showInfo, showSuccess, showWarning };