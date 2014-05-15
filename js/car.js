var Car = ActiveRecord.register("Car");

Car.extend({
  validations : {
    brand : ['required'],
    cost : [{
      name : "more",
      params : [10000]
    }, 'number']
  }
});

// var Animal = ActiveRecord.register("Animal",{}, {
//     url : "/activerecord.js/data/animals.json"
// });