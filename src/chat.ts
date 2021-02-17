// チャット
export default (socket: SocketIOClient.Socket, isEN: boolean) => {
    const chatForm = document.getElementById('chat-form') as HTMLFormElement;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const chatSendButton = document.getElementById('chat-send-icon');
    chatForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        if (chatInput.value) {
            socket.emit('chat message', chatInput.value);
            chatInput.value = '';
        }
    });

    chatSendButton.onclick = () => {
        if (chatInput.value) {
            socket.emit('chat message', chatInput.value);
            chatInput.value = '';
        }
    };

    const ul = document.getElementById('chat-messages');
    const chat = document.getElementById('chat');
    const chatCircle = document.getElementById('chat-new');
    socket.on('chat message', 
            /**
             * チャット受信の処理
             * @param msg 入力されたメッセージ
             * @param isPlayer 入力した人が対戦者か
             * @param name 入力した人の名前
             */
            (msg: string, isPlayer: boolean, name: string) => {
        const item = document.createElement('li');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'chat-name';
        nameSpan.innerText = name;

        if (isPlayer) {
            const icon = document.createElement('img');
            icon.className = 'chat-player-icon';
            icon.src = '../static/svg/ghost-solid.svg';
            icon.alt = 'player-icon';
            icon.title = isEN ? 'Player' : '対戦者';
            nameSpan.appendChild(icon);
        }

        item.appendChild(nameSpan);

        const msgSpan = document.createElement('span');
        msgSpan.innerText = msg;
        item.appendChild(msgSpan);

        ul.appendChild(item);
        ul.scrollTop = ul.scrollHeight;

        if (chat.className === 'closed') chatCircle.className = '';
    });

    // チャットタブのスライド
    const chatBtn = document.getElementById('chat-btn');
    chatBtn.onclick = () => {
        chatCircle.className = 'hidden';
        chat.classList.toggle('closed');
    }
}