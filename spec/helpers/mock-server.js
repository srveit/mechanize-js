'use strict';
const express = require('express'),
  url = require('url'),
  bodyParser = require('body-parser'),
  {isDate} = require('util').types;

const createMockServer = ({name, rootPath, environment, port}) => {
  let server;
  const serverName = name,
    mockHandlers = [],
    mockServer = {},
    savedEnvironment = {},

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
      } else if (isDate(value)) {
        return xml + space(indent) + '<' + name + ' type="datetime">' +
          value.toISOString().replace(/\.[0-9]{3}Z/, 'Z') + '</' + name + '>';
      } else if (Array.isArray(value)) {
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
      if (Object.keys(value).length === 0) {
        return xml + space(indent) + '<' + name + '/>';
      }
      return xml + space(indent) + '<' + name + '>\n' +
        Object.entries(value).map(([key, item]) => toXml({
          name: key,
          value: item,
          indent: indent + 2
        }).join('\n') + '\n' + space(indent) + '</' + name + '>');
    },

    mockHandler = ({name, method = 'get', path, responseName}) => {
      mockServer[name] = jest.fn();
      mockHandlers.push(mockServer[name]);
      mockServer.app[method](rootPath + path + '*', (req, res) => {
        const response = mockServer[name]({
          path: req.path,
          headers: req.headers,
          body: req.body,
          query: req.query
        });
        if (response && response.error) {
          res.status(response.error.statusCode || 500).send(response.error);
        } else if (req.headers.accept === 'application/xml') {
          res.setHeader('Content-Type', 'application/xml');
          res.send(toXml({
            name: responseName || name,
            includeDeclaration: true,
            value: response
          }));
        } else if (req.path.match(/(xml|html?)$/)) {
          if (response && response.headers) {
            res.set(response.headers).send(response.body);
          } else {
            res.send(response);
          }
        } else {
          res.json(response);
        }
      });
    },

    addDefaultHandler = () => mockServer.app.all(
      '*',
      (req, res, next) => {
        console.log('no', serverName, 'handler for', req.method, req.url); // eslint-disable-line no-console
        next();
      }
    ),

    setEnvironment = mockUrl => {
      const urlParsed = url.parse(mockUrl);
      Object.entries(environment).map(([key, value]) => {
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

      restoreEnvironment = () => Object.entries(environment)
        .map(([key, value]) => {
        process.env[key] = savedEnvironment[key];
      }),

    start = () => new Promise((resolve, reject) => {
      server = mockServer.app.listen(port || 0, (err) => {
        if (err) {
          reject(err);
        } else {
          const mockPort = server.address().port,
            mockUrl = 'http://localhost:' + mockPort + rootPath;
          // console.log(serverName, 'listening at', mockUrl);
          setEnvironment(mockUrl);
          resolve(true);
        }
      });
    }),

    stop = () => new Promise(resolve => {
      restoreEnvironment();
      server.close(() => resolve(true));
    }),

    clearMocks = () => {
      for (const mockHandler of mockHandlers) {
        mockHandler.mockClear();
      }
    };

  Object.assign(
    mockServer,
    {
      addDefaultHandler,
      app: express(),
      clearMocks,
      env: () => process.env,
      mockHandler,
      start,
      stop
    }
  );

  mockServer.app.use(bodyParser.urlencoded({
    extended: false
  }));
  mockServer.app.use(bodyParser.json());

  return mockServer;
};

const mockServer = (handlers = []) => {
  const environment = {
    SERVER_BASE_URL: '<mockUrl>',
    SERVER_HOST: '<mockHost>',
    SERVER_HOSTNAME: '<mockHostname>',
    SERVER_PORT: '<mockPort>'
  };

  const server = createMockServer({
    name: 'server',
    rootPath: '',
    environment
  });

  for (const handler of handlers) {
    server.mockHandler(handler);
  }

  server.addDefaultHandler();

  return server;
};

exports.mockServer = mockServer;
