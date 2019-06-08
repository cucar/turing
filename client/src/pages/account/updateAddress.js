import React from 'react';
import { useNavigation } from 'react-navi';
import { Card, CardContent } from '@material-ui/core';

import { Api } from '../../shared/api';
import TuringForm, { Validators } from '../../shared/form/turingForm';
import TuringTextField from '../../shared/form/turingTextField';
import TuringSelectField from '../../shared/form/turingSelectField';
import TuringFormSubmitButton from '../../shared/form/turingFormSubmitButton';
import TuringFormCancelButton from '../../shared/form/turingFormCancelButton';
import { showSuccess } from '../../utils/notifications';
import { getSessionCustomer, updateSessionCustomer } from '../../utils/session';

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
	
	return (
		<Card>
			<CardContent>
				<h1>Update Address</h1>
				<Api endpoint="shipping/regions" render={shippingRegions => (
					<TuringForm endpoint="customers/address" method="PUT" onApiResponseReceived={customerUpdated}>
						<TuringTextField key="address_1" label="Address Line 1" validators={[ Validators.required ]} value={customer.address_1} />
						<TuringTextField key="address_2" label="Address Line 2" validators={[]} value={customer.address_2} />
						<TuringTextField key="city" label="City" validators={[ Validators.required ]} value={customer.city} />
						<TuringTextField key="region" label="State / Region" validators={[ Validators.required ]} value={customer.region} />
						<TuringTextField key="postal_code" label="Postal Code" validators={[ Validators.required, Validators.zip ]} value={customer.postal_code} />
						<TuringTextField key="country" label="Country" validators={[ Validators.required, Validators.country ]} value={customer.country} />
						<TuringSelectField key="shipping_region_id" label="Shipping Region" value={customer.shipping_region_id} options={getShippingOptions(shippingRegions)} />
						<br/>
						<TuringFormSubmitButton key="update" label="Update" />
						<TuringFormCancelButton key="cancel" href="/account" label="Cancel" />
					</TuringForm>
				)}/>
			</CardContent>
		</Card>
	);
}