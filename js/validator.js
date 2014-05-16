var Validator = {
  functions : {
    required : function (value) {
      return (!value || typeof value === "undefined")?false:true;
    },

    more : function (value, threshold) {
      return value>threshold?true:false;
    },

    less : function (value, threshold) {
      return value<threshold?true:false;
    }
  },

  messages : {
    required : function (property) {
      return 'Field "'+property+'" is mandatory.';
    },
    more : function (property, threshold) {
      return 'Field "'+property+'" needs to be more than '+threshold+'.';
    },
    less : function (property, threshold) {
      return 'Field "'+property+'" needs to be less than '+threshold+'.';
    }
  }
};