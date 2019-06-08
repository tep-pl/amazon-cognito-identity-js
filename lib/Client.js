'use strict';

exports.__esModule = true;


const url = require('url');
var https = require('https');
var rr = require('request-promise');

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

  function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        path: match[5]
    }
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

    rr('http://www.google.com');

    var headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.' + operation,
      'X-Amz-User-Agent': this.userAgent
    };
    
    var locationDetails = getLocation(this.endpoint);
    var options = {
      protocol: locationDetails.protocol,
      hostname: locationDetails.hostname,
      port: locationDetails.port,
      path: locationDetails.path,
      headers: headers,
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache'
    };

    var response = void 0;

    new Promise(function(resolve, reject) {
      var req = https.request(options, function(resp) {
        response = resp;
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', function(chunk) {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', function() {
          resolve(JSON.parse(data));
        });

      });
      
      req.on('error', function(err) {
        reject(err);
      });

      req.write(JSON.stringify(params));
      req.end();
    }).then(function (data) {
      // return parsed body stream
      if (response.statusCode === 200) return callback(null, data);

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
      if (response && response.headers && response.headers.get('x-amzn-errortype')) {
        try {
          var code = response.headers.get('x-amzn-errortype').split(':')[0];
          var error = {
            code: code,
            name: code,
            statusCode: response.status,
            message: response.status ? response.status.toString() : null
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