import { Observable } from 'rxjs/Observable';
import { html } from 'snabbdom-jsx';
import 'rxjs/add/observable/dom/webSocket';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/startWith';

export function App ({ DOM, ws }) {
  const messages$ = ws.scan((acc, m) => [...acc, m], []);

  const formSubmit$ = DOM.select('#form').events('submit').do(e => e.preventDefault());
  const senderInput$ = DOM.select('#sender').events('input').map(e => e.target.value);
  const messageInput$ = DOM.select('#message').events('input').map(e => e.target.value);
  const formMessage$ = Observable.combineLatest(senderInput$, messageInput$)
    .map(([sender, message]) => ({ sender, message }));

  const sendMessage$ = formSubmit$
    .debounceTime(200)
    .withLatestFrom(formMessage$, (event, message) => JSON.stringify(message));

  const vtree$ = Observable
    .combineLatest(messages$.startWith([]) ,senderInput$.startWith(''))
    .map(([messages, me]) =>
      <div className="wrapper">
        <ul className="chat">
          { messages &&
            messages.map(m =>
              <li className={`chat__entry ${me === m.sender && 'chat__entry--mine'}`}>
                <img
                  className="chat__entry__avatar"
                  src={`https://api.adorable.io/avatars/32/${m.sender}.svg`}
                  title={m.sender}
                  alt={m.sender}
                />
                <span className="chat__entry__message">{m.message}</span>
              </li>
            )
          }
        </ul>
        <div className="form__container">
          <form id="form" action="">
            <div className="form__inputs">
              <input className="form__input" id="sender" type="text" placeholder="Your name"/>
              <input className="form__input" id="message" type="text" placeholder="Type a message..." />
            </div>
            <div className="form__submit">
              <input className="button" type="submit" id="button__send" value="Send" />
            </div>
          </form>
        </div>
      </div>
    );

  return { DOM: vtree$, ws: sendMessage$ };
}
