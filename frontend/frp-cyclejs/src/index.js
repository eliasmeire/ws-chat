import { run } from '@cycle/rxjs-run';
import { makeDOMDriver } from '@cycle/dom';
import { makeWebSocketDriver } from 'cycle-ws-driver';
import { App } from './app';

const drivers = {
  DOM: makeDOMDriver('#app'),
  ws: makeWebSocketDriver('ws://localhost:8001')
};

run(App, drivers);
