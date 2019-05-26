describe('Order Webhook Test Harness', function() {
	
	it('should test an order webhook', async function() {
		const response = await callApi('orders/stripe/webhooks', {
			id: 'evt_1EeAUFCKoWJWVnlpWxfmW0z8',
			object: 'event',
			api_version: '2019-03-14',
			created: 1558831519,
			data: {
				object: {
					id: 'ch_1EeAUFCKoWJWVnlpZLPKuSEc',
					object: 'charge',
					amount: 1499,
					amount_refunded: 0,
					application: null,
					application_fee: null,
					application_fee_amount: null,
					balance_transaction: 'txn_1EeAUFCKoWJWVnlpv4gnG5a1',
					billing_details: {
						address: {
							city: null,
							country: null,
							line1: null,
							line2: null,
							postal_code: '42424',
							state: null
						},
						email: null,
						name: 'Cagdas Ucar',
						phone: null
					},
					captured: true,
					created: 1558831519,
					currency: 'usd',
					customer: null,
					description: 'Customer Turing Order',
					destination: null,
					dispute: null,
					failure_code: null,
					failure_message: null,
					fraud_details: {},
					invoice: null,
					livemode: false,
					metadata: { order_id: 24 },
					on_behalf_of: null,
					order: null,
					outcome: {
						network_status: 'approved_by_network',
						reason: null,
						risk_level: 'normal',
						risk_score: 39,
						seller_message: 'Payment complete.',
						type: 'authorized'
					},
					paid: true,
					payment_intent: null,
					payment_method: 'card_1EeAUECKoWJWVnlpDmaJ5ck1',
					payment_method_details: {
						card: {
							brand: 'visa',
							checks: {
								address_line1_check: null,
								address_postal_code_check: 'pass',
								cvc_check: 'pass'
							},
							country: 'US',
							description: 'Visa Classic',
							exp_month: 4,
							exp_year: 2024,
							fingerprint: '2FOGCzhXoI1ssvlk',
							funding: 'credit',
							last4: '4242',
							three_d_secure: null,
							wallet: null
						},
						type: 'card'
					},
					receipt_email: null,
					receipt_number: null,
					receipt_url: 'https://pay.stripe.com/receipts/acct_1EbTIFCKoWJWVnlp/ch_1EeAUFCKoWJWVnlpZLPKuSEc/rcpt_F8RMBrbBAU6e2P1VGfOi4hLoeHKEhzW',
					refunded: false,
					refunds: {
						object: 'list',
						data: [],
						has_more: false,
						total_count: 0,
						url: '/v1/charges/ch_1EeAUFCKoWJWVnlpZLPKuSEc/refunds'
					},
					review: null,
					shipping: null,
					source: {
						id: 'card_1EeAUECKoWJWVnlpDmaJ5ck1',
						object: 'card',
						address_city: null,
						address_country: null,
						address_line1: null,
						address_line1_check: null,
						address_line2: null,
						address_state: null,
						address_zip: '42424',
						address_zip_check: 'pass',
						brand: 'Visa',
						country: 'US',
						customer: null,
						cvc_check: 'pass',
						dynamic_last4: null,
						exp_month: 4,
						exp_year: 2024,
						fingerprint: '2FOGCzhXoI1ssvlk',
						funding: 'credit',
						last4: '4242',
						metadata: {},
						name: 'Cagdas Ucar',
						tokenization_method: null
					},
					source_transfer: null,
					statement_descriptor: null,
					status: 'succeeded',
					transfer_data: null,
					transfer_group: null
				}
			},
			livemode: false,
			pending_webhooks: 0,
			request: {
				id: 'req_lV2qJfmtypIFE6',
				idempotency_key: null
			},
			type: 'charge.succeeded'
		}, 'POST');
		console.log(response);
	});

});
