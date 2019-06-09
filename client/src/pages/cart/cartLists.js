import React, { useCallback, useState } from 'react';
import _ from 'lodash';

import CartProducts from './cartProducts';

/**
 * shows products in the cart and the ones saved for later
 */
export default function CartLists({ cartProducts }) {

	// we initialize the products state from api response - this severs our tie to the api response - when we change the products data locally, it will not trigger
	// a re-render of the parent component, triggering another api call to the server - the reason we do this is because the initial cart data is retrieved via api call
	// but the subsequent changes all happen locally and we just notify the server. yes, there is a possibility of sync being broken but that's the price to pay for efficiency.
	// hopefully there are no bugs and we would not see a falling out of sync scenario - if that happens, it can be fixed with a simple refresh.
	const [ products, setProducts ] = useState(cartProducts);
	
	/**
	 * update cart product quantity event handler - need to use callback here to not cause re-render of children since it's passed as a prop
	 */
	const quantityUpdated = useCallback((productId, quantity) => {
		let newProducts = _.cloneDeep(products);
		const productIndex = products.findIndex(product => product.product_id === productId);
		newProducts[productIndex].quantity = quantity;
		newProducts[productIndex].subtotal = parseInt(quantity) * parseFloat(newProducts[productIndex].price);
		setProducts(newProducts);
	}, [ products ]);
	
	return (<>
		<CartProducts products={products.filter(product => product.buy_now)} savedForLater={false} onQtyUpdate={quantityUpdated} />
		<CartProducts products={products.filter(product => !product.buy_now)} savedForLater={true} onQtyUpdate={quantityUpdated} />
	</>);
}