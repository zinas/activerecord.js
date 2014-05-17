var crud = rest2crud;

/**
 * Base constructor for the ActiveRecord
 *
 * Use this only to set default properties.
 * Initialization should happen in init()
 */
function ActiveRecord() {
    this.values             = {}; // this will hold the values of the instanced AR
    this.isNew              = true; // Whether it is a new record, or an existing one
    this.isDirty            = false; // Whether the values have changed since the last save
    this.errors             = {}; // Errors from the validation process
    this.valid              = true; // Validation passed
}

ActiveRecord.prototype.validations = {};
ActiveRecord.prototype.messages = {};

/**
 * Initialization function
 *
 * @return {Model}
 */
ActiveRecord.prototype.init = function () {
    return this._setup();
}

/**
 * Initial setup of the model
 *
 * - create getters and setters
 *
 * @return {Model}
 */
ActiveRecord.prototype._setup = function () {
    var i;

    // Define getters and setters for each attribute
    for (i in this.config.columns) {
        this.defineGetterSetter(this.config.columns[i]);
    }

    return this;
}

/**
 * Registers the getter and setter for a given column name
 *
 * @param  {String} prop A property in the active record
 * @return null
 */
ActiveRecord.prototype.defineGetterSetter = function (prop) {
    this.__defineGetter__(prop, function () {
        return this.values[prop];
    });
    this.__defineSetter__(prop, function (value) {
        if (this.values[prop] !== value) {
            this.isDirty = true;
        }
        this.values[prop] = value;
    });
}

/**
 * Saves the current instance.
 *
 * @return {Promise}
 */
ActiveRecord.prototype.save = function () {
    if (!this.isNew && !this.isDirty) {
        console.warn("You are trying to save() but there are no modifications in the values");
    }

    var xhr, self = this;
    if (this.beforeSave === "function") {
        this.beforeSave();
    }

    if (!this.validate()) {
      throw "Validations failed";
    }

    if (this.isNew) {
        xhr = crud.create(this.config.url, this.values);
    } else if (this.isDirty) {
        xhr = crud.update(this.config.url+"/"+this.values[this.config.primaryKey], this.values);
    }

    this.isNew = false;
    this.isDirty = false;
    this.errors = {};
    this.valid = true;

    // we don't need an after save event. The developer can simple do: AR.save().done()

    return xhr;
}

ActiveRecord.prototype.validate = function () {
  var property, validation, i, vFun, results = {}, self = this, valid = true, valResult;

  for (property in this.validations) {
    results[property] = this.validations[property].map(function (validation) {
      valResult = self.checkValidation(property, validation);
      valid = valid && valResult.valid;
      return valResult;
    });
  }

  this.errors = results;
  this.valid = valid;

  return valid;
}

/**
 * Check a property against a specific validation
 *
 * @param  {string} property   a property of the AR
 * @param  {string} validation a validation function from the Validator
 * @return {object}            an object containing the result or the validation and the message
 */
ActiveRecord.prototype.checkValidation = function (property, validation) {
  var func, params = [], obj = {}, message;

  if (typeof validation === "object") {
    func = validation.name;
  } else if (typeof validation === "string") {
    func = validation;
  } else {
    throw "Unknown type of validation: '"+func+"'";
  }

  if (typeof Validator.functions[func] === "function") {
    obj.valid = Validator.functions[func].apply(this, params.concat(this.values[property], validation.params));
    if (obj.valid === false) {
      message = typeof this.messages[func] === "function" ? this.messages[func] : Validator.messages[func];
      obj.message = message.apply(this, params.concat(property, validation.params));
    }

    return obj;
  } else {
    console.warn("No validation '"+func+"' defined");
  }
}

/**
 * Deletes a record
 *
 * @return {Promise}
 */
ActiveRecord.prototype.remove = function () {
    if (!this.values[this.config.primaryKey]) {
        throw "you are trying to delete and non-instanced object";
    }

    var xhr, self = this;
    if (this.beforeRemove === "function") {
        this.beforeRemove();
    }

    return crud.delete(this.config.url+"/"+this.values[this.config.primaryKey]);
}


////////////////////////////////////////// STATIC METHODS & PROPERTIES

/**
 * Object to hold all the public static methods
 * @type {Object}
 */
ActiveRecord.functions = {};

/**
 * "constants" that act as defaults
 * @type {Object}
 */
ActiveRecord.defaults = {
    ENDPOINT : "/activerecord.js/rest/",
    PRIMARY_KEY : "id"
};

/**
 * Search over the models
 *
 * Possible arguments:
 *
 * - object
 * - value (just providing a value, assumes the PK)
 * - attribute, value
 * @return {xhr}
 */
ActiveRecord.functions.find = function () {
    var xhr;

    if (arguments.length === 1 && typeof arguments[0] !== "object") {
        xhr = this.__findById(arguments[0]);
    } else if (arguments.length === 2) {
        xhr = this.__findByAttribute(arguments[0], arguments[1]);
    } else if (arguments.length === 1 && typeof arguments[0] === "object") {
        // TODO pass parameters as an object
    } else {
        throw "Wrong number of parameters in find() function";
    }

    return xhr;
}

/**
 * Private function for searching by id
 * @param  {mixed} id the primary key value
 * @return {Promise} A promise with the AR passed as param
 */
ActiveRecord.functions.__findById = function (id) {
    var xhr = crud.read(this.config.url+'/'+id), self = this;
    return xhr.then(function (records) {
        return new self(records[0]);
    });
}

/**
 * Private function for search by attribute
 *
 * @param  {String} attributeName The name of the attribute to search by
 * @param  {mixed} value         The value to search for
 * @return {Promise}
 */
ActiveRecord.functions.__findByAttribute = function (attributeName, value) {
    var xhr, params = {}, self = this, i;
    params[attributeName] = value;
    xhr = crud.read(this.config.url, params);

    return xhr.then(function (records) {
        var models = [];

        for(i in records) {
            models.push(new self(records[i]));
        }

       return models;
    });
}

/**
 * Static method for updating
 *
 * Possible params
 * - value + object = PK to update + new values
 * - value + value + value = PK to update + attribute to change + new value
 *
 * @return {Promise}
 */
ActiveRecord.functions.update = function () {
    var params = {};
    if (arguments.length === 2 && typeof arguments[0] !== "object") {
        return crud.update(this.config.url+"/"+arguments[0], arguments[1]);
    } else if (arguments.length === 3 && typeof arguments[0] !== "object") {
        params[arguments[1]] = arguments[2];
        return crud.update(this.config.url+"/"+arguments[0], params);
    } else {
        throw "Wrong number of parameters in update() function";
    }
}

/**
 * Static method for deleting
 *
 * Possible params
 * - value = PK to update
 *
 * TODO:
 * - attribute + value = delete by attribute
 *
 * @return {Promise}
 */
ActiveRecord.functions.remove = function () {
    var params = {};
    if (arguments.length === 1 && typeof arguments[0] !== "object") {
        return crud.delete(this.config.url+"/"+arguments[0]);
    } else {
        throw "Wrong number of parameters in remove() function";
    }
}

/**
 * Base method for creating new models definition and
 * extending the base ActiveRecord
 *
 * @return {ActiveRecord} the extended model
 */
ActiveRecord.register = function (modelName, config) {
    var option, i;

    /**
     * The basic concept is: we use the ActiveRecord object as our infrastructure and then
     * we create the Model object based on that
     */
    var Model = function () {
        // Run the AR constructor (Setting default values)
        //ActiveRecord.apply(this, arguments);

        this.init();
        if (arguments.length === 1 && typeof arguments[0] === "object") {
            this.values = arguments[0];
            if (arguments[0][this.config.primaryKey]) {
                this.isNew = false;
            }
        }
    };

    Model.config = {};

    // First set the user overriden properties
    if (typeof config === "object") {
        for (option in config) {
            Model.config[option] = config[option];
        }
    }

    // For all missing properties apply defaults or calculate
    Model.config.modelName     = modelName;
    Model.config.endpoint      = Model.config.endpoint || ActiveRecord.defaults.ENDPOINT;
    Model.config.primaryKey    = Model.config.primaryKey || ActiveRecord.defaults.PRIMARY_KEY;
    Model.config.url           = Model.config.url || Model.config.endpoint + _plurilize(Model.config.modelName.toLowerCase());

    if (!Model.config.columns || Model.config.columns.length === 0) {
        Model.config.columns = [];
        crud.read(Model.config.url).done(function (records) {
            for (i in records[0]) {
                Model.config.columns.push(i);
            }
        });
    }

    for (i in ActiveRecord.functions) {
        Model[i] = ActiveRecord.functions[i];
    }

    Model.prototype = new ActiveRecord();
    Model.prototype._super = ActiveRecord.prototype;
    Model.prototype.config = Model.config;

    Model.extend = function (proto) {
        var i, option;

        Model.prototype.foo = function () {};

        for (option in proto) {
            Model.prototype[option] = proto[option];
        }

        return this;
    };

    return Model;
};

////////////////////////////////////////// PRIVATE UTILITIES

/**
 * Convert a word to plural
 *
 * TODO: implement this
 *
 * @param  {String} str word to be converted
 * @return {String}     word in plural
 */
function _plurilize(str) {
    return str+"s";
}