var Car = ActiveRecord.register("Car");

Car.extend({
  validations : {
    brand : ['required'],
    cost : [{
      name : "more",
      params : [10000]
    }]
  },
  messages : {
    required : function (property) {
      return "Required message from model '"+property+"'";
    }
  }
});