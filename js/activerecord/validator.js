define([], function () {
  "use strict";

  /**
   * Core validation engine, providing both validation functions and default error messages
   * @type {Object}
   */
  var Validator = {
    // Test if a value is null
    required : {
      test : function (value) {
        return (!value || typeof value === "undefined")?false:true;
      },
      error : function (property) {
        return 'Field "'+property+'" is mandatory.';
      }
    },

    // Test if a value is larger than a threshold
    more : {
      test : function (value, threshold) {
        return value>threshold?true:false;
      },
      error : function (property, threshold) {
        return 'Field "'+property+'" needs to be more than '+threshold+'.';
      }
    },

    // Test if a value is less than a threshold
    less : {
      test : function (value, threshold) {
        return value<threshold?true:false;
      },
      error : function (property, threshold) {
        return 'Field "'+property+'" needs to be less than '+threshold+'.';
      }
    },

    // Test if the value is an integer (based on format, "5" is still considered an integer)
    integer : {
      test : function (value) {
        return /^\s*(\+|-)?\d+\s*$/.test(value);
      },
      error : function (property) {
        return 'Field "'+property+'" must be an integer.';
      }
    },

    // Test if the value is a number (based on format, "5.0" is still considered a number)
    number : {
      test : function (value) {
        return /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/.test(value);
      },
      error : function (property) {
        return 'Field "'+property+'" must be a number.';
      }
    },

    // Test if the value is a valid email format
    email : {
      test : function (property) {
        return 'Field "'+property+'" must be an email.';
      },
      error : function (property) {
        return 'Field "'+property+'" must be an email.';
      }
    },

    // Test against any regular expression
    expression : {
      test : function (value, expr) {
        var re = new RegExp(expr);
        return re.test(value);
      },
      error : function (property) {
        return 'Field "'+property+'" is invalid.';
      }
    }
  };

  return Validator;
});