use turing;

select * from customer;

select * from category;
select * from department;

select * from orders;
select * from order_detail;
select * from shopping_cart;

select * from shipping where shipping_region_id = 2;
delete from review where review = 'test';
select * from product_attribute;
select a.name, av.*  
from product_attribute pa
join product p on p.product_id = pa.product_id
join attribute_value av on av.attribute_value_id = pa.attribute_value_id
join attribute a on a.attribute_id = av.attribute_id
where p.product_id = 1;

select * from tax;
select * from order_detail;
select * from orders;
select * from customer;
select * from shopping_cart;

select * from category where department_id = 1;
select * from product where display in (0, 1,2,3);
select product_id, name, substr(description, 1, 200) as description, price, discounted_price, thumbnail from product;
select attribute_value_id, value from attribute_value where attribute_id = 1;
select product_id, group_concat(category_id) from product_category group by product_id having count(*) > 1;

		select pa.product_id, count(*)
		from product_attribute pa
		join attribute_value av on av.attribute_value_id = pa.attribute_value_id
		join attribute a on av.attribute_id = a.attribute_id
        group by pa.product_id
        order by count(*) desc;
