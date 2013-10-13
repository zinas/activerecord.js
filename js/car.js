var Car = ActiveRecord.create("Car", {}, {
    url : ActiveRecord.config.endpoint + "cars.json"
});

var Animal = ActiveRecord.create("Animal",{}, {
    url : ActiveRecord.config.endpoint + "animals.json"
});