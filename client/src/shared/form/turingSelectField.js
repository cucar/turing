import React from 'react';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

/**
 * turing form field component
 */
function TuringSelectField({ id, label, validators, value, error, options, onChange }) {
	
	return (
		<FormControl style={{ width: '100%' }} error={!!error}>
			<InputLabel htmlFor={id}>{label}</InputLabel>
			<Select value={value ? value.toString() : ''} onChange={onChange} inputProps={{ name: id, id: id }}>
				{options.map(option => <MenuItem key={option.value.toString()} value={option.value.toString()}>{option.label}</MenuItem>)}
			</Select>
			<FormHelperText>{error}</FormHelperText>
		</FormControl>
	);
}

TuringSelectField.propTypes = {
	id: PropTypes.string, // will be populated from parent
	label: PropTypes.string.isRequired,
	validators: PropTypes.array,
	value: PropTypes.any, // will be populated from parent
	error: PropTypes.string, // will be populated from parent
	onChange: PropTypes.any // will be populated from parent
};

export default TuringSelectField;