## PartSelect Chatbot

Here is a chat agent that I implemented for the Instalily case study, where I was tasked with creating a chat agent with the following guidelines:
* The agent's primary function is to provide product information and assist with customer transactions
* It should remain focused on this specific use case
* Must use the DeepSeek LLM
* Should be able to answer the following question:
    1. How can I install part number PS11752778?
	2. Is this part compatible with my WDT780SAEM1 model?
	3. The ice maker on my Whirlpool fridge is not working. How can I fix it?

## How to Use

Go to the `./back-end` and `./front-end` directories and run `npm install` to install of the necessary packages. Then, to activate the back end server execute `./back-end/server.js`, and to activate the front end navigate to the corresponding directory and run `npm start`.