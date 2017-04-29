import { Observable, Subject } from 'rxjs';
import { html } from 'snabbdom-jsx';

export function App (sources) {
  const id = Math.round(Math.random() * 1000000000);
  const message$ = Observable.webSocket("ws://localhost:8081").scan((acc, m) => [...acc, m], []);
  const counterActions$ = Observable.merge(
    sources.DOM.select("#button__inc").events("click").mapTo(10),
    sources.DOM.select("#button__dec").events("click").mapTo(-10),
  )
    .scan((acc, el) => acc + el)
    .startWith(0)
  
  sources.DOM.select("#button__send").events("click")
    .debounceTime(200)
    .flatMapTo(sources.DOM.select("#message").elements().map(els => els[0].value).take(1))
    .subscribe(m => message$.next(JSON.stringify({m, s: id})));

  const reset$ = sources.DOM.select("#button__reset").events("click").mapTo(0);
  const start$ = Observable.of(0).merge(reset$);
  const vtree$ = start$
    .switchMapTo(
      Observable.interval(1000)
        .combineLatest(counterActions$)
    )
    .map(([count, countActions]) => count + countActions)
    .combineLatest(message$.startWith([]))
    .map(([count, messages]) =>
      <div>
        <div>{count}</div>
        <button id="button__inc">Up 10</button>
        <button id="button__dec">Down 10</button>
        <button id="button__reset">Reset</button>
        <input id="message" type="text" />
        <button id="button__send">Send</button>
        { messages && messages.map(m => 
            <p>{m.s}: {m.m}</p>
          )
        }
      </div>
    );

  const sinks = {
    DOM: vtree$
  };

  return sinks;
}
