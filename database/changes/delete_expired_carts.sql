DROP EVENT IF EXISTS delete_old_carts;

-- delete carts that are older than a day
CREATE EVENT delete_old_carts ON SCHEDULE EVERY 1 HOUR COMMENT 'delete old carts' DO CALL shopping_cart_delete_old_carts(1);
