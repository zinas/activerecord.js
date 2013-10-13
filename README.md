activerecord.js
===============

An ActiveRecord implementation for Javascript.

> **Attention** this is under *heavy* development. Final structure and API are subject to change.

## Intro
The point of this implementation if to be as dev friendly as possible, both for defining the models and using them. 
The principle of "convention over configuration" has been applied vastly. A lot of ideas are based on the Yii PHP Framework,
with which I have sufficient experience.

## Goals
Although there are no hard-defined requirements, activerecord.js aims for an easy to use API. Instead of requirements, here
is a rough sketch of the API I aim for.

By default, everything will be based on a hypothetical REST API, but in the future, this should be customizable to attach to any kind of backend/API.

### Model definition
##### Simple Scenario
```javascript
var Car = ActiveRecord.create("Car");
```
This will automatically connect the Car model to a url of &lt;baseUrl&gt;/cars.

##### Overriding "live" and "static" methods
```javascript
var Animal = ActiveRecord.create("Animal", {
  save : function () {
    // override the save() function of the live object
  },
  roar : function () {
    // adds a new model functions
  }
}, {
  url : "/apis/rest/zoo" // this will override the static property url
})
```

### Adding a new record
```javascript
var car = new Car();
car.brand = "Seat";
car.model = "Ibiza";
car.save();

// OR

var car = new Car();
car.values = {
   brand : "Seat",
   model : "Ibiza"
};
car.save();

// OR

var car = new Car({
   brand : "Seat",
   model : "Ibiza"
});
car.save();
```

### Fetching records
```javascript
Car.find(5, function (car) {
   // Gets the car with id 5
   console.log(car.brand);
});

// OR

Car.find('brand', 'Seat', function (cars) {
   // cars will be an array of instantiated Car models
});

Car.find({
   // Exact properties TBD
   conditions : {brand:'Seat'},
   limit : 10,
   groupBy : 'year'
}, function (cars) {
   // cars will be an array of instantiated Car models
});
```

### Updating and Deleting
```javascript
Car.find('brand', 'Seat', function (cars) {
   var i;
   for (i=0; i<cars.length; i++) {
      if (car[i].year < '1995') { car.destroy(); }
      if (car[i].model === 'Ibiza') {
         car.price += 1000;
         car.save();
      }
   }
});
```

### Relations
> Work in progress

Models will support relations, but the exact API is TBD. The relations that will be supported are:
- has one
- has many
- belongs to
