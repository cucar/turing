import React from 'react';
import PropTypes from 'prop-types';
import LinkButton from '../linkButton';

/**
 * turing form button component
 */
function TuringFormCancelButton({ id, label, href }) {
	return (
		<LinkButton key={id} href={href}>{label}</LinkButton>
	);
}

TuringFormCancelButton.propTypes = {
	id: PropTypes.string, // will be populated from parent
	label: PropTypes.string.isRequired,
	href: PropTypes.string.isRequired
};

export default TuringFormCancelButton;