// 'use strict';

const path = require('path');
const url = require('url');
// let __filename;
// let __dirname;

let env = process.env.NODE_ENV || 'production';
console.log(__filename, __dirname);
// console.log(process.env.REACT_APP_API_URL_PRODUCTION);

if ((env = 'development')) {
  const envPath = path.join(__dirname, '..');
  console.log('envPath', envPath);
  require('dotenv').config({ path: `${envPath}/.env.${env}` });
}
// } else {
//   __filename = url.fileURLToPath(import.meta.url);
//   __dirname = path.dirname(fileURLToPath(__filename));
// }

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const expressWs = require('express-ws')(app);

const opentok = require('./opentok/opentok');
const transcribe = require('./aws/transcribe');
const comprehend = require('./aws/comprehend');

app.use(cors());

app.use(bodyParser.json());

let sessions = [];

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  );
  next();
});

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.get('/session/:room', async (req, res) => {
  try {
    const { room: roomName } = req.params;
    // const localId = userId++;
    const role = req.query.role !== undefined ? req.query.role : 'test';
    if (sessions[roomName]) {
      const data = opentok.generateToken(sessions[roomName].session, role);
      app.set('roomName-' + sessions[roomName].session, roomName);
      res.json({
        sessionId: sessions[roomName].session,
        token: data.token,
        apiKey: data.apiKey,
        // userId: localId,
      });
    } else {
      const data = await opentok.getCredentials(null, role);
      sessions[roomName] = {
        session: data.sessionId,
        users: [],
        connectionCount: 0,
      };
      app.set('roomName-' + sessions[roomName].session, roomName);
      res.json({
        sessionId: data.sessionId,
        token: data.token,
        apiKey: data.apiKey,
        // userId: localId,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});

app.post('/startStreaming', async (req, res) => {
  try {
    console.log('someone wants to stream');
    const { streamId, sessionId, specialty } = req.body;
    const roomName = app.get('roomName-' + sessionId);
    console.log(roomName, specialty, streamId, sessionId);

    await transcribe.start_transcription(
      {
        roomName,
        sessionId,
        streamId,
        specialty,
      },
      comprehend.print_result
    );

    const response = await opentok.startStreamer(streamId, sessionId);
    res.send(response);
  } catch (e) {
    console.log(e);
  }
});

app.ws('/socket', async (ws, req) => {
  console.log('someone connected');

  var fromStreamId = null;
  ws.on('message', (msg) => {
    try {
      if (typeof msg === 'string') {
        let config = JSON.parse(msg);
        console.log(config);
        fromStreamId = config.from;
      } else {
        transcribe.aws_socket_send(msg, fromStreamId);
      }
    } catch (err) {
      ws.removeAllListeners('message');
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('[' + '] Websocket closed');
  });
});

// // if (env === 'production') {
// console.log('Setting Up express.static for production env');
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  // res.sendFile(path.resolve('./build/index.html'));
});
// }

app.listen(process.env.NERU_APP_PORT, () =>
  console.log(`listening on port ${process.env.NERU_APP_PORT}!`)
);
