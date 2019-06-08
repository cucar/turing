import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button/Button';

/**
 * turing form button component
 */
function TuringFormSubmitButton({ id, label, onClick }) {
	return (
		<Button key={id}
				variant="contained"
				color="primary"
				onClick={onClick}>
			{label}
		</Button>
	);
}

TuringFormSubmitButton.propTypes = {
	id: PropTypes.string, // will be populated from parent
	label: PropTypes.string.isRequired,
	onClick: PropTypes.any // will be populated from parent
};

export default TuringFormSubmitButton;