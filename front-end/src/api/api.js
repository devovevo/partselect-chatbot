import { v4 as uuidv4 } from "uuid";

const curUUID = uuidv4();

export const getAIMessage = async (userQuery) => {
  try {
    const request = await fetch(
      `http://localhost:5000/chat?q=${userQuery}&id=${curUUID}`
    );

    console.log(request);

    const response = await request.json();
    const message = {
      role: 'assistant',
      content: response.response,
    }

    console.log(message);

    return message;
  } catch (e) {
    console.error(e);
  }
};
