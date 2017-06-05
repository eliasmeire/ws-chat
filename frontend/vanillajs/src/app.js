const senderEl = document.getElementById('sender');
const messageEl = document.getElementById('message');
const messageListEl = document.getElementById('chat');
const formEl = document.getElementById('form');
const messageWebsocket = new WebSocket('ws://localhost:8001');
const messages = [];
let me = '';

const debounce = (func, wait) => {
    let timeout;
    return () => {
        let context = this, args = arguments;
        const later = () => {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const createSenderAvatar = (sender) => {
    const avatarImg = document.createElement('img');
    avatarImg.classList.add('chat__entry__avatar');
    avatarImg.src = 'https://api.adorable.io/avatars/32/${sender}.svg';
    avatarImg.title = sender;
    avatarImg.alt = sender;
    return avatarImg;
};


const createMessageSpan = (message) => {
    const messageSpan = document.createElement('span');
    messageSpan.classList.add('chat__entry__message');
    const messageText = document.createTextNode(message);
    messageSpan.appendChild(messageText);
    return messageSpan;
};

const createMessage = (message) => {
    const messageLi = document.createElement('li');
    const currentSender = senderEl.value;
    const isMine = currentSender === message.sender;
    const classes = isMine ? ['chat__entry', 'chat__entry--mine'] : ['chat__entry'];
    messageLi.classList.add(...classes);

    if (!isMine) {
        const avatarImg = createSenderAvatar(message.sender);
        messageLi.appendChild(avatarImg);
    }
    const messageSpan = createMessageSpan(message.message);
    messageLi.appendChild(messageSpan);
    return messageLi;
};

const addMessage = (message) => {
    const messageLi = createMessage(message);
    messageListEl.appendChild(messageLi);
};

const onSubmitDebounced = debounce((event) => {
    const message = messageEl.value;
    const sender = senderEl.value;

    if (message.trim().length > 0 && sender.trim().length > 0) {
        const newMessage = { message, sender };
        messageWebsocket.send(JSON.stringify(newMessage));
    }
}, 200);

formEl.addEventListener('submit', onSubmitDebounced);
formEl.addEventListener('submit', (event) => {
    event.preventDefault();
});

senderEl.addEventListener('input', (event) => {
    const newSender = event.target.value; const notMyMessagesIndexes = [];
    const myMessagesIndexes = [];

    if (newSender.trim() !== me) {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (message.sender === me) {
                const messageLi = messageListEl.childNodes.item(i);
                messageLi.classList.remove('chat__entry--mine');
                messageLi.insertBefore(createSenderAvatar(message.sender), messageLi.firstChild);
            } else if (message.sender === newSender) {
                const messageLi = messageListEl.childNodes.item(i);
                messageLi.classList.add('chat__entry--mine');
                messageLi.removeChild(messageLi.firstChild);
            }
        }
    }
    me = newSender.trim();
});

messageWebsocket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    messages.push(message);
    addMessage(message);
});