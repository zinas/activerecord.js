define(["jquery"], function ($) {
  "use strict";

  /**
   * REST 2 CRUD
   *
   * Interface to connect to a standard rest API
   * @type {Object}
   */
  var rest2crud = {};

  /**
   * POST an object to the server for creation
   *
   * @param  {String} url    Url to send the request to
   * @param  {Object} params parameters to post along the request
   * @return {xhr}           xhr object, to bind callbacks
   */
  rest2crud.create = function (url, params) {
      params = params || {};
      return $.ajax({
          url: url,
          method: 'POST',
          dataType: 'json',
          data:params
      });
  };

  /**
   * GET some data from the server
   *
   * @param  {String} url    Url to send the request to
   * @param  {Object} params parameters to post along the request
   * @return {xhr}           xhr object, to bind callbacks
   */
  rest2crud.read = function (url, params) {
      params = params || {};
      return $.ajax({
          url: url,
          method: 'GET',
          dataType: 'json',
          data:params
      });
  };

  /**
   * PUT an object to the server for creation
   *
   * @param  {String} url    Url to send the request to
   * @param  {Object} params parameters to post along the request
   * @return {xhr}           xhr object, to bind callbacks
   */
  rest2crud.update = function (url, params) {
      params = params || {};
      return $.ajax({
          url: url,
          method: 'PUT',
          dataType: 'json',
          data:params
      });
  };

  /**
   * DELETE an object to the server for creation
   *
   * @param  {String} url    Url to send the request to
   * @param  {Object} params parameters to post along the request
   * @return {xhr}           xhr object, to bind callbacks
   */
  rest2crud.delete = function (url, params) {
      params = params || {};
      return $.ajax({
          url: url,
          method: 'DELETE',
          dataType: 'json',
          data:params
      });
  };

  return rest2crud;
});