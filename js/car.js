var Car = ActiveRecord.register("Car");

Car.extend({
  validations : {
    brand : ['required', "integer", 'number'],
    cost : [{
      test : "more",
      params : [10000]
    }]
  },
  messages : {
    required : function (property) {
      return "Required message from model '"+property+"'";
    }
  }
});