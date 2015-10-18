'use strict';

let request = require('superagent');

let _parse = (uri) => {
  let parts = uri.split('/');
  let parsed = [];
  parts.forEach(part => {
    if (part[0] === ':') {
      parsed.push({
        param: true,
        name: part.substr(1)
      });
    } else {
      parsed.push({
        resource: part
      });
    }
  });
  return parsed;
};

let Service = class {

  constructor(endpoint, methods, serviceConf) {

    this.parsedEndpoint = _parse(endpoint);
    this.serviceConf = serviceConf;

    for (let name in methods) {
      if (methods.hasOwnProperty(name)) {
        this[name] = this.req.bind(this, methods[name]);
      }
    }
  }

  req(conf, params = {}, body = {}) {
    let endpoint = this.parsedEndpoint.map(part => {
      if (part.param) {
        if (!params.hasOwnProperty(part.name)) {
          if (conf.params && conf.params.hasOwnProperty(part.name)) {
            return '' + conf.params[part.name];
          }
          return '';
        }
        return '' + params[part.name];
      } else {
        return part.resource;
      }
    });
    endpoint = this.serviceConf.url + endpoint.filter(part => part.length).join('/');
    for (let prop in body) {
      if (body.hasOwnProperty(prop) && ~this.serviceConf.exclude.indexOf(prop)) {
        delete body[prop];
      }
    }
    return new Promise((resolve, reject) => {
      let reqMethod = conf.method.toLowerCase() || 'get';
      let payload = reqMethod !== 'get' ? body : null;
      let query = reqMethod === 'get' ? body : null;
      request[reqMethod](endpoint)
        .set('Accept', 'application/json')
        .query(query)
        .send(payload)
        .end((err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res.body || JSON.parse(res.text));
        });
    });
  }

};

let Base = class {

  constructor(options = {}) {
    options.host = options.host || 'http://localhost';
    options.prefix = options.prefix || '/';
    options.exclude = options.exclude || [];
    this.serviceConf = {
      url: options.host + options.prefix,
      exclude: options.exclude
    };
  }

  service(endpoint, methods) {
    return new Service(endpoint, methods, this.serviceConf);
  }

};

module.exports = Base;
