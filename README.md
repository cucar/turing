# Turing Challenge

This repo contains a sample app for Turing Challenge.

* Designs: Mock-ups regarding the desired UI/UX. 
* Database: The initial setup file + patches (if needed) for MySQL database used by the server.
* Server: Contains the API written with Node/Koa. 
* Client: Contains the client side written with React.

You can access the production at: https://turing.cagdasucar.com

## Architectural Decisions / Discussion Points

The notes in this section relate to the architectural decisions taken so far and explanations for them. Like in any other
application, there are more ways than one to accomplish something. From that perspective, these are discussion points and not 
meant to be taken like they are set in stone.

### Client Side (React)

Note that the React side is still in development. A few pages are developed for testing purposes. It's very difficult to 
test Stripe or Login with Facebook features without an accompanying test page. 

* Using Nginx. Could have used Apache as well but Nginx is faster.
* Using Material UI. Could have used other Material libraries but Material UI seems to be the most mature one.  
* Styling components done as inline and global CSS. Not using styled components or Material withStyles.
* Stripe inputs need to be injected as an iframe from Stripe so that the token can be generated without CORS problems. That 
presents a styling challenge. It's probably possible to set up a Material text field and specify the Stripe input after 
being injected dynamically but it was going to take too long. Instead, I just styled the input to look a bit more like 
Material text field but it's quite different under the hood. Labels don't work like Material. Errors are not shown in that 
style either.   
* Trying not to use class components. The new React hooks feature is very powerful and allows developers not to use class
components in many cases. It simplifies state management, no function binding issues and makes components simpler in many 
cases. It is possible to mix and match as needed but trying to be consistent with the use of functional components and did 
not need class components so far.
* Not using Redux/Thunk. Hooks make state management very easy. Chose not to use Redux or Thunks since they make state 
management more complicated. They are meant to make it easier but hooks are so much easier.
* Not using react-router and opting for Navi instead. Lazy loaded routes, hooks, suspense, route api calls are the main 
features that influenced that decision. I'm not entirely sure if react-router supports these features but Navi certainly 
makes it easier from a documentation perspective. The examples are more applicable and the documentation is more consistent.
React-router documentation is harder to navigate and it's not so easy to find examples with these features. Tested the lazy 
loading with Navi and I show progress if route load (webpack module load) takes too long. I use suspense so that we don't 
show the content until the module is loaded.            
* There is an API component and a central routine to call API. The question is how to display progress until the 
response is received. It's possible to use suspense for this but I chose not to. It's just easier to do with a simple
Material progress bar shown conditionally. 
* Not fetching API data for routes. Navi supports fetching data before routing to a new page. I chose not to use that and 
opted for fetching the data always in components. The reason is because we are going to need to fetch the data in components
at one time or another. Fetching data in routes would be another way on top of that. Just trying to simplify and unify the 
way we fetch data. It's better to have a single way to do it.
* Snackbar architecture uses pubsub-js module. Basically we have a snackbar component at the app level and app component
starts to listen on the notification queue of the pubsub-js module. Any component that wants to show notifications needs 
to write a new request to that pubsub-js queue. In order to make that easier I added a utils module called notifications. 
Any component can show notifications by using the functions from that module. API call function actually uses that 
automatically to show errors if there is an error response. I could have used observables for this as well (rxjs - used 
more in Angular) but it's way too big of a library for such a small task.

### Server Side (Koa)

* Not using Express. I like Koa better than express because it's easier to understand. It's more structured. Promises and 
async/await is better supported. Using an architecture that allows me to declare routes and handlers in controller classes. 
I think it makes it easier to read and develop. 
* Using pm2 in production and nodemon in development to run the server. 
* Using mocha and chai for tests. Did not need sinon until now but would be good to use that for some unit tests.
* Using webstorm as the IDE but should be fine with others like VSCode as well. I like Webstorm because it makes running 
tests super easy.
* Not using model classes to control access to data. There is a thin data access layer (DAO - mysql.js) but no model classes
above that. Controllers can directly access data. I don't feel model classes are necessary in many cases. That's a personal 
opinion. I know many developers disagree with that but I think it's just easier to access data directly via SQL from the 
controllers. 
* Not locking versions in package.json since we're still in development. That should be done for commercial applications 
before going live.
* Did not use yarn. Npm is fine for now since we're still in development but may switch to it to lock versions and 
make it more deterministic when we go live.
* All MySQL statements are parameterized and protected against SQL injection attacks. Some use of stored procedures but 
a good portion of them did not fit the required usage so opted to use direct SQL instead.  
* I feel the checkout logic requires some discussion. It feels like the API was designed such that any cart will be turned 
into an "unpaid" order automatically and then client side is supposed to make another call to "pay the order". If the card 
gets declined, there is supposed to be another page that would allow the customer to re-try with a different card? I 
don't like that design. I don't think the order should be created before the charge. We would need to call stripe first
and then create the order if the charge was successful. The problem is, we need to send the order ID to stripe for that 
call. So, what I ended up doing is, I create an order record without any details before making the stripe call. If the 
stripe call fails, I delete the order and return decline. If it succeeds, I add the order details and empty the cart. The 
payment page on the client side is setup to test that scenario.

### Devops (Jenkins)

This is still in development. Currently using Nginx and Koa on the server side. Initial deployment was manual. I will setup 
a Jenkins server si that deployment is easier but this is NOT the devops challenge by any means. There won't be any 
containers/Kubernetes and stuff for this. The only purpose is to speed up development.  

## Tests

* Stripe tests: they don't require the pages to be served via SSL from localhost but that's needed for production tests.
For now, you can do that by going to the payment page: https://turing.cagdasucar.com/payment - that page will login as a 
customer, add something to the cart, tokenize the card and call checkout API all at once.   
* Facebook tests: this is not easy to set up. You need to have the access token to test it and getting that is difficult. 
Here are the steps to run this test:
    * Register a test app in Facebook and get its ID. Update that ID in facebook.html file in customer API folder (in appId property).
    * Run node facebook-server.test.js in this folder to start up the local SSL server. Make sure there are no other web servers that would conflict with port 443.
    * Now go to https://localhost/facebook.html - you will get certificate warning. Ignore that and continue.
    * Login to facebook and authorize app. The test page should display the email and access token to be used in this test.
    * Create your user in customer table with that email.
    * Copy and paste the access token and email to this test and run it.

## Benchmarking

Using [wrk](https://github.com/wg/wrk) for performance tests. Here are some links about how to set it up:  

* https://github.com/wg/wrk/wiki/Installing-Wrk-on-Linux
* https://github.com/wg/wrk/wiki/Installing-wrk-on-Windows-10

The methodology is very similar to what's described here (Koa example): https://github.com/Unitech/pm2/issues/3613

Choosing http://turing.cagdasucar.com/api/products as the API test call. It accesses database, so it's a good average call.

The server the app is deployed to is a lowest powered Digital Ocean server (1 CPU, 1 GB mem) also hosting MySQL.
I tested it with pm2 running in cluster mode with 2-3 processes but the performance suffered when 
it's more than one process. That makes sense because we have only one CPU. 

Typical test results show around ~600 requests per second, which corresponds to 36K requests per 
minute. If we assume roughly 4 requests / minute for each user (including initial static web page 
serve request), we have capacity for ~9K users. Here is a typical run:   
 
    [root@server1 ~]# wrk -t 100 -c 100 http://turing.cagdasucar.com/api/products
    Running 10s test @ http://turing.cagdasucar.com/api/products
      100 threads and 100 connections
      Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency   157.95ms   30.09ms 330.77ms   78.26%
        Req/Sec     7.16      2.58    10.00     51.38%
      6321 requests in 10.10s, 8.70MB read
    Requests/sec:    625.82
    Transfer/sec:      0.86MB

## Challenge Questions

* Question: The current system can support 100,000 daily active users. How do you design a new system to support 1,000,000 daily active users? Describe your design clearly in the documentation so we can follow your steps. Implement backend code + database if possible.
* Answer: Well, clearly we could add more web servers to scale out a bit more and setup a load 
balancer in front of them. Hardware load balancer like F5 may be better. I'm not sure how the 
AWS/Digital Ocean load balancers perform. If the database is a bottleneck, it's possible to setup 
read replicas for MySQL to distribute the load. In that case, all updates would go through one 
MySQL instance and they would be replicated to the read instances. Read can be done from any of
the read replicas.    

***
 
* Question: A half of the daily active users comes from United States. How do you design a new system to handle this case? Describe your design clearly in the documentation so we can follow your steps. Implement backend code + database if possible.
* Answer: I'm not sure what the problem is. If the load balancer has a rule that directs requests
based on geography, that could be a problem. In that case it may be better to setup the load balancer
to not be based on geography or setup additional servers for US load balancer rule. 
