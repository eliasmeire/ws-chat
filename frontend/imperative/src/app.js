import $ from 'jquery';
import Handlebars from 'handlebars';
import debounce from 'lodash.debounce';

Handlebars.registerHelper('equal', function(val1, val2, options) {
  val1 === val2 ? options.fn(this) : options.inverse(this);
});

$(document).ready(() => {
  const template = Handlebars.compile(`
    <div class="wrapper">
        <ul class="chat">
          {{#each messages}}
            {{#if this.isMine}}
              <li class="chat__entry chat__entry--mine">
                <span class="chat__entry__message">{{this.message}}</span>
              </li>
            {{else}}
              <li class="chat__entry">
                <img
                  class="chat__entry__avatar"
                  src="https://api.adorable.io/avatars/32/{{this.sender}}.svg"
                  title="{{this.sender}}"
                  alt="{{this.sender}}"
                />
                <span class="chat__entry__message">{{this.message}}</span>
              </li>
            {{/if}}
          {{/each}}
        </ul>
        <div class="form__container">
          <form id="form" onsubmit="onsubmit">
            <div class="form__inputs">
              <input class="form__input" id="sender" type="text" value="{{me}}" placeholder="Your name" />
              <input class="form__input" id="message" type="text" value="{{lastMessage}}" placeholder="Type a message..." />
            </div>
            <div class="form__submit">
              <input class="button" type="submit" id="button__send" value="Send" />
            </div>
          </form>
        </div>
      </div>
  `);
  const messageWebsocket = new WebSocket('ws://localhost:8001');
  const messages = [];
  let lastMessage = '';

  const render = (messages = [], me = '', lastMessage) => {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      message.isMine = message.sender === me;
    }
    const data = { messages, me, lastMessage };
    const htmlString = template(data);
    $('#app').html(htmlString);
  };

  render(); // initial render

  onsubmit = (event) => {
    event.preventDefault();
    debounce(() => {
      const message = $('#message').val();
      const sender = $('#sender').val();

      if (message.trim().length > 0 && sender.trim().length > 0) {
        const newMessage = { message, sender };
        lastMessage = message;
        messageWebsocket.send(JSON.stringify(newMessage));
      }
    }, 200)();
  };

  messageWebsocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    messages.push(message);
    render(messages, $('#sender').val(), lastMessage);
  };
});
