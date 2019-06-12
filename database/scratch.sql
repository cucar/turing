use turing;

select * from shipping;

insert into review (customer_id, product_id, review, rating, created_on)
select c.customer_id, r.product_id, r.review, r.rating, now()
from review r 
join customer c on c.customer_id != 14;

select * from tax;


select p.product_id, p.name, if(length(p.description) <= 200, p.description, concat(left(p.description, 200), '...')) as description, p.price, p.discounted_price, 
       coalesce(nullif(p.discounted_price, 0), p.price) as effective_price, p.thumbnail, p.display
from product p
join product_category pc on p.product_id = pc.product_id
join category c on pc.category_id = c.category_id
order by product_id desc
limit 0, 10;

select * from product_category where product_id = 98;

select * from attribute;

select locate('|', value) from attribute_value;

select length(attributes) from (
select pa.product_id, group_concat(concat(a.name, '|', av.attribute_id, '|', pa.attribute_value_id, '|', pa.attribute_value_id)) as attributes
from product_attribute pa
join attribute_value av on av.attribute_value_id = pa.attribute_value_id
join attribute a on a.attribute_id = av.attribute_id
group by pa.product_id
) q;

-- departments layered navigation query
select 'Department' as attribute_name, d.name as attribute_value, count(distinct p.product_id) as attribute_frequency
from product p 
join product_category pc on pc.product_id = p.product_id 
join category c on c.category_id = pc.category_id 
join department d on c.department_id = d.department_id
where c.department_id = 1
group by d.name;

-- departments, categories, price and discount layered navigation query
select c.name as category, 
	max(d.name) as department, 
    count(*) as category_product_count, 
    min(coalesce(nullif(p.discounted_price, 0), p.price)) as min_price,
    max(coalesce(nullif(p.discounted_price, 0), p.price)) as max_price,
    sum(case when p.discounted_price > 0 then 1 else 0 end) as discounted_product_count
from product p 
join product_category pc on pc.product_id = p.product_id 
join category c on c.category_id = pc.category_id 
join department d on c.department_id = d.department_id
where c.department_id = 1
group by c.name;

-- select JSON_OBJECTAGG(concat(attribute_name, '|', attribute_value), attribute_frequency) from (
-- attributes layered navigation query
select a.name as attribute_name, av.value as attribute_value, count(distinct p.product_id) as attribute_frequency
from product p 
join product_category pc on pc.product_id = p.product_id 
join category c on c.category_id = pc.category_id 
join product_attribute pa on pa.product_id = p.product_id
join attribute_value av on av.attribute_value_id = pa.attribute_value_id
join attribute a on av.attribute_id = a.attribute_id
where c.department_id = 1
group by a.name, av.value;
-- ) q;

select * from orders;
update orders set auth_code = '',reference = '' where auth_code is null;

update orders set customer_id = 14;

select * from review;
insert into review set customer_id = 14, product_id = 7, review = 'Phasellus tincidunt, tortor sit amet convallis posuere, neque purus porttitor mi, non blandit turpis erat eu ipsum. Vestibulum vehicula, risus nec mattis volutpat, quam urna mattis magna, quis consectetur odio magna eu elit. Nunc vulputate, ex quis fermentum suscipit, enim purus dapibus libero, et auctor sapien sem dignissim dui. Sed placerat purus eget est rutrum, vitae faucibus nisi fringilla. Nam ultricies vehicula risus, nec tincidunt arcu dignissim id. Proin ullamcorper iaculis malesuada. Integer porttitor augue ac tellus rutrum feugiat. Nunc vehicula felis et elit lobortis dictum. Vivamus porttitor euismod pretium.',
rating = 7, created_on = now();                        
select * from customer;
update customer set credit_card = null where customer_id = 14;

select * from category;
select * from department;

select * from orders;
select * from tax;
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
select * from department;
select * from category;
select * from shopping_cart;

select * from attribute_value;

select * from product_attribute;

select * from category where department_id = 1;
select * from product where display in (0, 1,2,3);
select product_id, name, substr(description, 1, 200) as description, price, discounted_price, thumbnail from product;
select attribute_value_id, value from attribute_value where attribute_id = 2;
select product_id, group_concat(category_id) from product_category group by product_id having count(*) > 1;

		select pa.product_id, count(*)
		from product_attribute pa
		join attribute_value av on av.attribute_value_id = pa.attribute_value_id
		join attribute a on av.attribute_id = a.attribute_id
        group by pa.product_id
        order by count(*) desc;
