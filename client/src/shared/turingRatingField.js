import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, FormHelperText } from '@material-ui/core';

import Rating from './rating';
import './turingRatingField.css';

/**
 * turing form field component
 */
function TuringRatingField({ id, label, validators, value, error, onChange }) {
	return (
		<FormControl className="rating-control" id={id} error={!!error}>
			<label className="rating-label">{label}:</label>
			<Rating className="rating-field" rating={value || '0'} onChange={onChange} />
			<FormHelperText className="rating-error">{error}</FormHelperText>
		</FormControl>
	);
}

TuringRatingField.propTypes = {
	id: PropTypes.string, // will be populated from parent
	label: PropTypes.string.isRequired,
	validators: PropTypes.array,
	value: PropTypes.string, // will be populated from parent
	error: PropTypes.string, // will be populated from parent
	onChange: PropTypes.any // will be populated from parent
};

export default TuringRatingField;