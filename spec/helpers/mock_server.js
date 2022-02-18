'use strict';
const express = require('express'),
  url = require('url'),
  bodyParser = require('body-parser'),
  _ = require('lodash');

const createMockServer = ({name, rootPath, environment, port}) => {
  let server;
  const serverName = name,
    savedEnvironment = {},

    mock = {},

    space = length =>
    '                                                                 '
    .substr(0, length),

    camelToDash = str => str
    .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
    .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`)
    .replace(/([a-z])([0-9])/g, ([letter, number]) => `${letter}-${number}`),

    toXml = ({name, value, includeDeclaration = false, indent = 0}) => {
      const xml = includeDeclaration ?
        '<?xml version="1.0" encoding="UTF-8"?>\n' :
        '';
      name = camelToDash(name);
      if (value === null || value === undefined) {
        return xml + space(indent) + '<' + name + ' nil="true"/>';
      } else if (typeof value === 'boolean') {
        return xml + space(indent) + '<' + name + ' type="boolean">' +
          value + '</' + name + '>';
      } else if (typeof value === 'number') {
        return xml + space(indent) + '<' + name + ' type="integer">' +
          value + '</' + name + '>';
      } else if (typeof value === 'string') {
        return xml + space(indent) + '<' + name + '>' +
          value + '</' + name + '>';
      } else if (_.isDate(value)) {
        return xml + space(indent) + '<' + name + ' type="datetime">' +
          value.toISOString().replace(/\.[0-9]{3}Z/, 'Z') + '</' + name + '>';
      } else if (_.isArray(value)) {
        if (value.length === 0) {
          return xml + space(indent) + '<' + name + ' type="array"/>';
        }
        return xml + space(indent) + '<' + name + ' type="array">\n' +
          value.map(
            item => toXml({
              name: name + '-item',
              value: item,
              indent: indent + 2
            })
          ).join('\n') + '\n' +
          space(indent) + '</' + name + '>';
      }
      if (_.isEmpty(value)) {
        return xml + space(indent) + '<' + name + '/>';
      }
      return xml + space(indent) + '<' + name + '>\n' +
        _.map(
          value,
          (item, key) => toXml({
            name: key,
            value: item,
            indent: indent + 2
          })
        ).join('\n') + '\n' +
        space(indent) + '</' + name + '>';

    },

    mockHandler = (name, method, path, responseName) => {
      mock[name] = jasmine.createSpy(name).and.returnValue({});
      mock.app[method](rootPath + path + '*', (req, res) => {
        // console.log('called', serverName, 'mock', name, path);

        const response = mock[name]({
          path: req.path,
          headers: req.headers,
          body: req.body
        });
        if (response.error) {
          res.status(response.error.statusCode || 500).send(response.error);
        } else if (req.headers.accept === 'application/xml') {
          res.setHeader('Content-Type', 'application/xml');
          res.send(toXml({
            name: responseName || name,
            includeDeclaration: true,
            value: response
          }));
        } else if (req.path.match(/html$/)) {
          if (response.headers) {
            res.set(response.headers).send(response.body);
          } else {
            res.send(response);
          }
        } else {
          res.json(response);
        }
      });
    },

    addDefaultHandler = () =>
    mock.app.all(
      '*',
      (req, res, next) => {
        console.log('no', serverName, 'handler for', req.method, req.url); // eslint-disable-line no-console
        next();
      }
    ),

    setEnvironment = mockUrl => {
      const urlParsed = url.parse(mockUrl);
      _.forEach(environment, (value, key) => {
        savedEnvironment[key] = process.env[key];
        if (value === '<mockUrl>') {
          process.env[key] = mockUrl;
        } else if (value === '<mockPort>') {
          process.env[key] = urlParsed.port;
        } else if (value === '<mockHostname>') {
          process.env[key] = urlParsed.hostname;
        } else if (value === '<mockHost>') {
          process.env[key] = urlParsed.host;
        } else {
          process.env[key] = value;
        }
      });
    },

    restoreEnvironment = () => _.forEach(
      environment,
      (value, key) => {
        process.env[key] = savedEnvironment[key];
      }
    ),
    start = done => {
      server = mock.app.listen(port || 0, () => {
        const mockPort = server.address().port,
          mockUrl = 'http://localhost:' + mockPort + rootPath;
        // console.log(serverName, 'listening at', mockUrl);
        setEnvironment(mockUrl);
        done();
      });
    },

    stop = done => {
      restoreEnvironment();
      server.close(() => done());
    };

  Object.assign(
    mock,
    {
      app: express(),
      mockHandler,
      addDefaultHandler,
      start,
      stop
    }
  );

  mock.app.use(bodyParser.urlencoded({
    extended: false
  }));
  mock.app.use(bodyParser.json());

  return mock;
};

const mockServer = () => {
  const environment = {
    SERVER_BASE_URL: '<mockUrl>',
    SERVER_HOSTNAME: '<mockHostname>',
    SERVER_HOST: '<mockHost>'
  };

  const server = createMockServer({
    name: 'server', rootPath: '', environment
  });
  server.mockHandler('postForm', 'post', '/');
  server.mockHandler('getPage', 'get', '/');

  server.addDefaultHandler();

  return server;
};

module.exports.mockServer = mockServer;
