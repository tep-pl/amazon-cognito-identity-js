'use strict';

exports.__esModule = true;


var rp = require('request-promise');

var _UserAgent = require('./UserAgent');

var _UserAgent2 = _interopRequireDefault(_UserAgent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @class */
var Client = function () {
  /**
   * Constructs a new AWS Cognito Identity Provider client object
   * @param {string} region AWS region
   * @param {string} endpoint endpoint
   */
  function Client(region, endpoint) {
    _classCallCheck(this, Client);

    this.endpoint = endpoint || 'https://cognito-idp.' + region + '.amazonaws.com/';
    this.userAgent = _UserAgent2.default.prototype.userAgent || 'aws-amplify/0.1.x js';
  }

  /**
   * Makes an unauthenticated request on AWS Cognito Identity Provider API
   * using fetch
   * @param {string} operation API operation
   * @param {object} params Input parameters
   * @param {function} callback Callback called when a response is returned
   * @returns {void}
  */
  Client.prototype.request = function request(operation, params, callback) {
    rp({
      uri: this.endpoint,
      resolveWithFullResponse: true,
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      json: true,
      body: params,
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.' + operation,
        'X-Amz-User-Agent': this.userAgent
      }
    }).then(function (resp) {
      var data = resp.body;
      // return parsed body stream
      if (resp.statusCode === 200) return callback(null, data);

      // Taken from aws-sdk-js/lib/protocol/json.js
      // eslint-disable-next-line no-underscore-dangle
      var code = (data.__type || data.code).split('#').pop();
      var error = {
        code: code,
        name: code,
        message: data.message || data.Message || null
      };
      return callback(error);
    }).catch(function (err) {
      // first check if we have a service error
      var response = err.response;
      if (response && response.headers && response.headers['x-amzn-errortype']) {
        try {
          var code = response.headers['x-amzn-errortype'].split(':')[0];
          var error = {
            code: code,
            name: code,
            statusCode: response.statusCode,
            message: response.headers['x-amzn-errormessage']
          };
          return callback(error);
        } catch (ex) {
          return callback(err);
        }
        // otherwise check if error is Network error
      } else if (err instanceof Error && err.message === 'Network error') {
        var _error = {
          code: 'NetworkError',
          name: err.name,
          message: err.message
        };
        return callback(_error);
      } else {
        return callback(err);
      }
    });
  };

  return Client;
}();

exports.default = Client;