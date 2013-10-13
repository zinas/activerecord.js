(function (global, $) {

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


////////////////////////////////////////// CRUD SECTION
var _crud = {};

/**
 * Request some data from the server
 *
 * @return {xhr} XHR object, so that you can attach callbacks
 */
_crud.read = function (url, params) {
    params = params || {};
    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        params:params
    });
};


////////////////////////////////////////// STATIC METHODS

ActiveRecord.config = {
    endpoint : "/activerecord.js/data/",
    primaryKey : "id"
};

/**
 * Search over the models
 *
 * Possible arguments:
 *
 * - object, callback
 * - value, callback
 * - column, value, callback
 * @return {xhr}
 */
ActiveRecord.find = function () {
    var
        i, url, xhr,
        params = [],
        models = [],
        self = this,
        args = arguments;
    if (args.length === 3) {
        url = this.options.url;
        params[args[0]] = args[1];
    }

    xhr = _crud.read(url, params);
    xhr.done(function (records) {
        for(i in records) {
            models.push(new self(records[i]));
        }

        args[2](models);
    })
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

        if (typeof protoConfig !== "object") { return; }

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

    Model.options.url           = Model.options.url || Model.options.endpoint + _plurilize(Model.options.modelName.toLowerCase()) + "/";

    if (!Model.options.columns || Model.options.columns.length === 0) {
        Model.options.columns = [];
        _crud.read(Model.options.url).done(function (records) {
            for (i in records[0]) {
                Model.options.columns.push(i);
            }
        });
    }

    Model.prototype.options = Model.options;
    Model.find = ActiveRecord.find;
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

global.ActiveRecord = ActiveRecord;
})(window, jQuery);