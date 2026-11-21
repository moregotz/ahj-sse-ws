import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {
    constructor() {
        super();
        this.URL = 'http://localhost:3000';
    }

    create(name) {
        return createRequest({
            url: this.URL + '/new-user',
            method: 'POST',
            responseType: 'json',
            body: { name },
        });
    }

    connect() {
        const wsUrl = this.URL.replace('http', 'ws') + '/ws';
        this.socket = new WebSocket(wsUrl);

        return new Promise((resolve, reject) => {
            this.socket.onopen = () => resolve();
            this.socket.onerror = (error) => reject(error);
        });
    }

    send(message, user) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'send',
                message,
                user
            }));
        }
    }

    exit(user) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'exit',
                user
            }));
        }
    }

    onMessage(callback) {
        if (this.socket) {
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                callback(data);
            };
        }
    }
}
