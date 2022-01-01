import { handleChatSend } from './actions';
import { handleToggleChatList } from './lib/gameEventHandlers';

export const addChatEventListener = () => {
  const chatForm = document.getElementById('chat-form') as HTMLFormElement;
  const chatSendButton = document.getElementById('chat-send-icon');
  chatForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    sendMessage();
  });

  chatSendButton.onclick = () => {
    sendMessage();
  };

  // Slide in/out chat list.
  const chatBtn = document.getElementById('chat-btn');
  chatBtn.onclick = handleToggleChatList;
};

const sendMessage = () => {
  const chatInput = document.getElementById('chat-input') as HTMLInputElement;
  const message = chatInput.value;
  if (message) {
    handleChatSend(message);
    chatInput.value = '';
  }
};
