var Validator = {
  required : function (value) {
    console.log("required", value);
    return (!value || typeof value === "undefined")?false:true;
  },

  more : function (value, threshold) {
    console.log("more", value, threshold);
    return value>threshold?true:false;
  },

  less : function (value, threshold) {
    console.log("less", value, threshold);
    return value<threshold?true:false;
  }
};