import axios from 'axios';

const API_URL = 'http://localhost:8085/api/chat';

class ChatService {
  sendMessage(message) {
    return axios.get(API_URL, {
      params: {
        message: message
      }
    });
  }
}

export default new ChatService();
