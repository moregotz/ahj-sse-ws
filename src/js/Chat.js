import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.currentUser = null;
  }

  init() {
    this.renderModal();
    this.bindToDOM();
    this.registerEvents();
  }

  renderModal() {
    this.container.innerHTML = `
      <div class="modal__form active">
        <div class="modal__background"></div>
        <div class="modal__content">
          <div class="modal__header">Выберите псевдоним</div>
          <div class="modal__body">
            <div class="form__group">
              <input type="text" class="form__input" id="nickname" placeholder="Введите ник" />
            </div>
            <div class="form__hint hidden" id="error-hint"></div>
          </div>
          <div class="modal__footer">
            <button class="modal__ok" id="continue-btn">Продолжить</button>
          </div>
        </div>
      </div>
    `;
  }

  renderChat() {
    this.container.innerHTML = `
      <div class="chat__container">
        <div class="chat__userlist" id="userlist"></div>
        <div class="chat__area">
          <div class="chat__messages-container" id="messages-container"></div>
          <div class="chat__messages-input">
            <div class="form__group">
              <input type="text" class="form__input" id="message-input" placeholder="Нажмите, чтобы начать печатать сообщение!" />
              <button class="send-btn hidden" id="send-btn">➤</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.messagesContainer = this.container.querySelector('#messages-container');
    this.messageInput = this.container.querySelector('#message-input');
    this.userlist = this.container.querySelector('#userlist');
    this.sendBtn = this.container.querySelector('#send-btn');

    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener('input', () => {
      this.toggleSendButton();
    });

    this.sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });
  }

  bindToDOM() {
    this.modal = this.container.querySelector('.modal__form');
    this.nicknameInput = this.container.querySelector('#nickname');
    this.continueBtn = this.container.querySelector('#continue-btn');
    this.errorHint = this.container.querySelector('#error-hint');
  }

  registerEvents() {
    this.continueBtn.addEventListener('click', () => this.onEnterChatHandler());

    window.addEventListener('beforeunload', () => {
      if (this.currentUser) {
        this.api.exit(this.currentUser);
      }
    });
  }

  async onEnterChatHandler() {
    const name = this.nicknameInput.value.trim();
    if (!name) return;

    try {
      const result = await this.api.create(name);
      this.currentUser = result.user;
      this.modal.classList.remove('active');
      this.renderChat();
      this.connectWebSocket();
    } catch (error) {
      this.errorHint.classList.remove('hidden');
      this.errorHint.textContent = error.message;
    }
  }

  connectWebSocket() {
    this.api.connect().then(() => {
      console.log('WebSocket подключен');
      this.api.onMessage((data) => {
        this.handleServerMessage(data);
      });
    }).catch((error) => {
      console.error('Ошибка подключения WebSocket:', error);
    });
  }

  handleServerMessage(data) {
    if (Array.isArray(data)) {
      this.renderUserList(data);
    } else if (data.type === 'send') {
      this.renderMessage(data);
    }
  }

  renderUserList(users) {
    if (!this.userlist) return;

    this.userlist.innerHTML = '';
    users.forEach(user => {
      const userElement = document.createElement('div');
      const isYourself = user.id === this.currentUser.id;

      userElement.className = `chat__user ${isYourself ? 'chat__user-yourself' : ''}`;
      userElement.textContent = isYourself ? `${user.name} (Вы)` : user.name;

      this.userlist.appendChild(userElement);
    });
  }

  toggleSendButton() {
    const text = this.messageInput.value.trim();
    if (text.length > 0) {
      this.sendBtn.classList.remove('hidden');
    } else {
      this.sendBtn.classList.add('hidden');
    }
  }

  sendMessage() {
    const text = this.messageInput.value.trim();
    if (!text) return;

    this.api.send(text, this.currentUser);
    this.messageInput.value = '';
    this.toggleSendButton();
  }

  renderMessage(data) {
    if (!this.messagesContainer) return;

    const messageContainer = document.createElement('div');
    const isYourself = data.user.id === this.currentUser.id;

    messageContainer.className = `message__container ${isYourself ? 'message__container-yourself' : 'message__container-interlocutor'
      }`;

    const header = document.createElement('div');
    header.className = 'message__header';
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    header.textContent = `${isYourself ? 'Вы' : data.user.name}, ${time}`;

    const body = document.createElement('div');
    body.textContent = data.message;

    messageContainer.appendChild(header);
    messageContainer.appendChild(body);
    this.messagesContainer.appendChild(messageContainer);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}