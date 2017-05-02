import { Observable } from 'rxjs';
import { html } from 'snabbdom-jsx';

export function App ({ DOM }) {
  const messageWebsocket$ = Observable.webSocket("ws://localhost:8001");
  const messages$ = messageWebsocket$
    .scan((acc, m) => [...acc, m], []);

  const formSubmit$ = DOM.select("#form").events("submit");
  const senderInput$ = DOM.select("#sender").events("input").map(e => e.target.value);
  const messageInput$ = DOM.select("#message").events("input").map(e => e.target.value);
  const formMessage$ = Observable.combineLatest(senderInput$, messageInput$)
    .map(([sender, message]) => ({ sender, message }));

  const sendMessage$ = formSubmit$
    .debounceTime(200)
    .withLatestFrom(formMessage$)
    .map(([event, message]) => message);
  
  sendMessage$
    .map(message => JSON.stringify(message))
    .subscribe(message => messageWebsocket$.next(message));

  const vtree$ = messages$.startWith([])
    .withLatestFrom(senderInput$.startWith(""))
    .map(([messages, me]) =>
      <div className="wrapper">
        <ul className="chat">
          { messages &&
            messages.map(m => 
              <li className={`chat__entry ${me === m.sender && "chat__entry--mine"}`}>
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
          <form id="form" action="" onsubmit={e => e.preventDefault()}>
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

  return {
    DOM: vtree$
  };
}
