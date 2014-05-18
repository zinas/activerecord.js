require.config({
  baseUrl: "js",
  paths: {
      // activerecord related modules
      "activerecord" : "activerecord/model",
      "rest2crud" : "activerecord/rest2crud",
      "validator" : "activerecord/validator",

      // vendor modules
      "jquery" : "vendor/jquery",

      // models
      "car" : "models/car"
  },
  waitSeconds: 15
});

require(["car"], function (Car) {
  Car.find(2).done(function (car) {
    console.log("found car", car.brand);
  });
})