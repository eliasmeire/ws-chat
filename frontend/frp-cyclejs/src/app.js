import { Observable, Subject } from 'rxjs';
import { html } from 'snabbdom-jsx';

export function App (sources) {
  const messageWebsocket$ = Observable.webSocket("ws://localhost:8081");
  const messages$ = messageWebsocket$
    .scan((acc, m) => [...acc, m], [])
    .startWith([]);

  const formSubmit$ = sources.DOM.select("#form").events("submit");
  const senderInputChanged$ = sources.DOM.select("#sender").events("input");
  const messageInputChanged$ = sources.DOM.select("#message").events("input");
  const formMessage$ = Observable.combineLatest(senderInputChanged$, messageInputChanged$)
    .map(([senderEvent, messageEvent]) => ({
      sender: senderEvent.target.value,
      message: messageEvent.target.value
    }));

  const sendMessage$ = formSubmit$
    .debounceTime(200)
    .withLatestFrom(formMessage$)
    .map(([event, message]) => message);
  
  sendMessage$.subscribe(message => messageWebsocket$.next(JSON.stringify(message)));

  const vtree$ = messages$
    .withLatestFrom(senderInputChanged$.map(e => e.target.value).startWith(""))
    .map(([messages, me]) =>
      <div className="wrapper">
        { messages && messages.length > 0 &&
          <ul className="chat">
            {
              messages.map(m => 
                <li className={`chat__entry ${me === m.sender && "chat__entry--mine"}`}>
                  <img
                    className="chat__entry__avatar"
                    src={`https://api.adorable.io/avatars/128/${m.sender}.png`}
                    title={m.sender}
                    alt={m.sender}
                  />
                  <span className="chat__entry__message">{m.message}</span>
                </li>
              )
            }
          </ul>
        }
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
