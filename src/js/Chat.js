import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
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
          <div class="form__hint hidden" id="error-hint">Этот ник уже занят!</div>
        </div>
        <div class="modal__footer">
          <button class="modal__ok" id="continue-btn">Продолжить</button>
        </div>
      </div>
    </div>
  `;
  }

  bindToDOM() {
    this.modal = this.container.querySelector('.modal__form');
    this.nicknameInput = this.container.querySelector('#nickname');
    this.continueBtn = this.container.querySelector('#continue-btn');
    this.errorHint = this.container.querySelector('#error-hint');
  }

  registerEvents() {
    this.continueBtn.addEventListener('click', () => this.onEnterChatHandler());
  }

  subscribeOnEvents() { }

  onEnterChatHandler() { }

  sendMessage() { }

  renderMessage() { }
}
