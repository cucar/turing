alter table orders drop tax_id;
alter table orders add tax_amount decimal(11,2) default 0;