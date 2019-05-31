import React from 'react';
import { useNavigation } from 'react-navi';

import { Api } from '../../shared/api';
import TuringForm, { Validators } from '../../shared/turingForm';
import TuringTextField from '../../shared/turingTextField';
import { showSuccess } from '../../utils/notifications';
import Button from '@material-ui/core/Button/Button';
import { getSessionCustomer, updateSessionCustomer } from '../../utils/session';
import TuringSelectField from '../../shared/turingSelectField';
import LinkButton from '../../shared/linkButton';

/**
 * address update screen
 */
export default function UpdateAddress() {
	
	let customer = getSessionCustomer();
	let navigator = useNavigation();
	
	/**
	 * post update event handler
	 */
	const customerUpdated = async (response, fieldValues) => {
		showSuccess('Update successful.');
		updateSessionCustomer(fieldValues);
		navigator.navigate('/account');
	};
	
	/**
	 * after retrieving the shipping regions from API, this routine formats it so that it can be used in the shipping region drop down
	 */
	const getShippingOptions = apiResponse => {
		if (!apiResponse) return [];
		return apiResponse.map(option => { return { label: option.shipping_region, value: option.shipping_region_id }; });
	};
	
	return (<>
		<h1>Update Address</h1>
		<Api endpoint="shipping/regions">
			<TuringForm endpoint="customers/address" method="PUT" onApiResponseReceived={customerUpdated}>
				<TuringTextField key="address_1" label="Address Line 1" validators={[ Validators.required ]} value={customer.address_1} />
				<TuringTextField key="address_2" label="Address Line 2" validators={[]} value={customer.address_2} />
				<TuringTextField key="city" label="City" validators={[ Validators.required ]} value={customer.city} />
				<TuringTextField key="region" label="State / Region" validators={[ Validators.required ]} value={customer.region} />
				<TuringTextField key="postal_code" label="Postal Code" validators={[ Validators.required, Validators.zip ]} value={customer.postal_code} />
				<TuringTextField key="country" label="Country" validators={[ Validators.required, Validators.country ]} value={customer.country} />
				<TuringSelectField key="shipping_region_id" label="Shipping Region" value={customer.shipping_region_id} apiOptions={getShippingOptions} />
				<br/>
				<Button key="update" variant="contained" color="primary">Update</Button>
				<LinkButton key="cancel" href="/account">Cancel</LinkButton>
			</TuringForm>
		</Api>
	</>);
}