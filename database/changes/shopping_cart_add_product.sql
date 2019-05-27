DROP PROCEDURE shopping_cart_add_product;

-- Change DELIMITER to $$
DELIMITER $$

-- this SP needed to be fixed - there is a bug in the original code - item_id is auto increment int - not UUID
CREATE PROCEDURE shopping_cart_add_product(IN inCartId CHAR(32), IN inProductId INT, IN inAttributes VARCHAR(1000))
BEGIN
  DECLARE productQuantity INT;

  -- Obtain current shopping cart quantity for the product
  SELECT quantity
  FROM   shopping_cart
  WHERE  cart_id = inCartId
         AND product_id = inProductId
         AND attributes = inAttributes
  INTO   productQuantity;

  -- Create new shopping cart record, or increase quantity of existing record
  IF productQuantity IS NULL THEN
    INSERT INTO shopping_cart(cart_id, product_id, attributes,
                              quantity, added_on)
           VALUES (inCartId, inProductId, inAttributes, 1, NOW());
  ELSE
    UPDATE shopping_cart
    SET    quantity = quantity + 1, buy_now = true
    WHERE  cart_id = inCartId
           AND product_id = inProductId
           AND attributes = inAttributes;
  END IF;
END$$

-- Change back DELIMITER to ;
DELIMITER ;
