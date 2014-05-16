> **Attention** this is under *heavy* development. Final structure and API are subject to change.

<em>For detailed documentation and examples about this project, please visit the <a href="https://github.com/zinas/activerecord.js/wiki">WIKI</a></em>
###### Quick Links
- <a href="https://github.com/zinas/activerecord.js/wiki/API-Concept">API Concept</a> to take a look on how this library will be used.
- <a href="https://github.com/zinas/activerecord.js/wiki/Simple-REST-API">REST API</a> documentation to understand how the dummy REST API that is included in the project works.
- <a href="https://github.com/zinas/activerecord.js/issues">Issues</a> to get a feeling on where this library is heading to.

activerecord.js
===============
activerecord.js is an <a href="http://en.wikipedia.org/wiki/Active_record_pattern" target="_blank">active record</a> 
implementation for javascript. Quoting wikipedia:
>Active record is an approach to accessing data in a database. A database table or view is wrapped into a class. Thus, an object instance is tied to a single row in the table. After creation of an object, a new row is added to the table upon save. Any object loaded gets its information from the database. When an object is updated the corresponding row in the table is also updated. The wrapper class implements accessor methods or properties for each column in the table or view.

There are a lot of active record libraries out there. However, none feels the same as using the equivelant in Rails,
or in PHP Frameworks like Yii (which makes some sense, because working on the client side with data is a whole different
story).

### Why this library?
Of course, the first question is, why this library? Well, there is no reason. I just wanted to create a fun pet project
for me and went ahead and created this lib. However, it does have a few points that differentiate from the others and
can be appealing to you.

#### Rapid development &amp; Dev friendly 
This is the prime requirement for the library. The developer should worry as less as possible about configuration, setting up
syntax etc. He should be able to just use Models and develop fast.

#### Convention over configuration
You don't need to configure anything. The library makes the assumptions for you. Name your object "Car" and the REST endpoint
will automatically be &lt;base-url&gt;/cars. Automatically your primary key will be a property named "id". And other little
details to make your life easier

#### Extend everything
Even though everything works by convention, you have the power to configure everything, based on your needs. The library
doesn't hard enforce anything.

#### Simple, versatile, human friendly API
You don't need to remember <em>find</em>, <em>findByPK</em>, <em>findByAttribute</em> etc. There is only one <em>find</em>
function and does intelligent guess based on attributes. Both <em>(new Car(5)).destroy()</em> and <em>Car.destroy(5)</em> 
work. You don't need to remember a complex API, because just trying what comes natural usually works.
