# Selex_Mall
The Selex mall system is a web-based micro management system designed to manage shops and employees in a mall setting
The administrator can add,view,update,and delete shops and employees using system’s user-friendly admin interface.It uses a client-server architecture in which REST API calls are used to connect the frontend and backend.
HTML,CSS,and Javascript are used to create the interface,Node.js (Express) is used to develop the backend.All of the data is stored in a JSON file,which enables the system to function without an external database.Railway,which offers simple hosting and automatic builds, is used to deploy the full application.

code reference :
For the frontend : index.html ( i did the code myself)
HTML,CSS i did myself and for javascript  when iam doing the code i stucked in a error ,so i just ask help from my friend whi os expert in javascript.

for backend (server.js) i took help from chatgpt and i edited that code for my requirements and here iam providing the link for chat.

https://chatgpt.com/share/6939cb22-c40c-800a-832c-beb1c07b208d

IN server.js code line from 1 to 8 : 
Removed fs.promises + fsSync; using only fs with synchronous methods (readFileSync, writeFileSync).
Storage / DB Path from code line 16-29
Converted from async to sync (readFileSync/writeFileSync) code line 31-58
Added error logging with log().
directly performs CRUD inside route handlers.
Simplified logging: no timestamps or body code line 62 to 67
Removed /frontend route logic,Just serve public folder.code line 70
Endpoint names also changed: /shops → /api/shops, /workers → /api/employees.code line 116 to 129
module.exports = app added for testing. 279-294












