var crud = rest2crud;

/**
 * Base constructor for the ActiveRecord
 *
 * Use this only to set default properties.
 * Initialization should happen in init()
 */
function ActiveRecord() {
    this.values             = {};
    this.isNew              = true; // Whether it is a new record, or an existing one
    this.isDirty            = false; // Whether the values have changed since the last save
}

/**
 * Initialization function
 *
 * @return {promise}
 */
ActiveRecord.prototype.init = function () {
    this._setup();
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

ActiveRecord.prototype.defineGetterSetter = function (column) {
    this.__defineGetter__(column, function () {
        return this.values[column];
    });
    this.__defineSetter__(column, function (value) {
        if (this.values[column] !== value) {
            this.isDirty = true;
        }
        this.values[column] = value;
    });
}

ActiveRecord.prototype.save = function () {
    if (!this.isNew && !this.isDirty) {
        return;
    }

    var xhr, self = this;
    if (this.beforeSave === "function") {
        this.beforeSave();
    }

    // TODO validate

    if (this.isNew) {
        xhr = crud.create(this.config.url, this.values);
    } else if (this.isDirty) {
        xhr = crud.update(this.config.url+"/"+this.values[this.config.primaryKey], this.values);
    }

    this.isNew = false;
    this.isDirty = false;

    if (this.afterSave === "function") {
        xhr.done(function (response) {
                this.afterSave();
        });
    }

    return xhr;
}


////////////////////////////////////////// STATIC METHODS & PROPERTIES

ActiveRecord.functions = {};

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
 * - value
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
    }

    return xhr;
}

ActiveRecord.functions.__findById = function (id) {
    var xhr = crud.read(this.config.url+'/'+id), self = this;
    return xhr.then(function (records) {
        return new self(records[0]);
    });
}

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

ActiveRecord.functions.extend = function (proto) {
    var i, option;
    for (option in proto) {
        this.prototype[option] = proto[option];
    }

    return this;
};

/**
 * Base method for creating new models definition and
 * extending the base ActiveRecord
 *
 * @return {ActiveRecord} the extended model
 */
ActiveRecord.register = function (modelName, config) {
    var option, i;

    var Model = function () {
        // Run the AR constructor (Setting default values)
        ActiveRecord.apply(this, arguments);

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