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
    var i, self = this, col;

    for (i in this.options.columns) {
        (function (column) {

            // Define getters and setters for each attribute
            self.__defineGetter__(column, function () {
                return self.values[column];
            });
            self.__defineSetter__(column, function (value) {
                if (self.values[column] !== value) {
                    self.isDirty = true;
                }
                self.values[column] = value;
            });
        })(this.options.columns[i]);
    }

    return this;
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
        xhr = crud.create(this.options.url, this.values);
    } else if (this.isDirty) {
        xhr = crud.update(this.options.url+"/"+this.values[this.options.primaryKey], this.values);
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

ActiveRecord.config = {
    endpoint : "/activerecord.js/rest/",
    primaryKey : "id"
};

/**
 * Search over the models
 *
 * Possible arguments:
 *
 * - object, callback
 * - value, callback
 * - attribute, value, callback
 * @return {xhr}
 */
ActiveRecord.find = function () {
    var xhr;

    if (arguments.length === 2 && typeof arguments[0] !== "object") {
        xhr = this.__findById(arguments[0], arguments[1]);
    } else if (arguments.length === 3) {
        xhr = this.__findByAttribute(arguments[0], arguments[1], arguments[2]);
    }


    return xhr;
}

ActiveRecord.__findById = function (id, callback) {
    var xhr = crud.read(this.options.url+'/'+id), self = this;
    xhr.done(function (records) {
       _exec(callback, new self(records[0]));
    });
    return xhr;
}
ActiveRecord.__findByAttribute = function (attributeName, value, callback) {
    var xhr, params = {}, models = [], self = this, i;
    params[attributeName] = value;
    xhr = crud.read(this.options.url, params);
    xhr.done(function (records) {
        for(i in records) {
            models.push(new self(records[i]));
        }

        _exec(callback, models);
    });

    return xhr;
}
/**
 * Base method for creating new models definition and
 * extending the base ActiveRecord
 *
 * @return {ActiveRecord} the extended model
 */
ActiveRecord.create = function (modelName, protoConfig, staticConfig) {
    var i, option;
    var Model = function () {
        // Run the AR constructor (Setting default values)
        ActiveRecord.apply(this, arguments);

        if (protoConfig && typeof protoConfig !== "object") { return; }

        for (option in protoConfig) {
            this[option] = protoConfig[option];
        }
        this.init();
        if (arguments.length === 1 && typeof arguments[0] === "object") {
            this.values = arguments[0];
            if (arguments[0][this.options.primaryKey]) {
                this.isNew = false;
            }
        }
    };
    Model.prototype = new ActiveRecord();
    Model.prototype._super = ActiveRecord.prototype;

    Model.options = {};

    // First set the user overriden properties
    if (typeof staticConfig === "object") {
        for (option in staticConfig) {
            Model.options[option] = staticConfig[option];
        }
    }

    // For all missing properties apply defaults or calculate
    Model.options.modelName     = modelName;

    Model.options.endpoint      = Model.options.endpoint || ActiveRecord.config.endpoint;
    Model.options.primaryKey    = Model.options.primaryKey || ActiveRecord.config.primaryKey;

    Model.options.url           = Model.options.url || Model.options.endpoint + _plurilize(Model.options.modelName.toLowerCase());

    if (!Model.options.columns || Model.options.columns.length === 0) {
        Model.options.columns = [];
        crud.read(Model.options.url).done(function (records) {
            for (i in records[0]) {
                Model.options.columns.push(i);
            }
        });
    }

    Model.prototype.options = Model.options;
    Model.find = ActiveRecord.find;
    Model.__findById = ActiveRecord.__findById;
    Model.__findByAttribute = ActiveRecord.__findByAttribute;
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

function _exec() {
    var func, args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === "function") {
        func = args[0];
        args.splice(0,1);
        return func.apply(this, args);
    } else {
        return null;
    }
}