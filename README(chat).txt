SKILLSWAP — LEARNING CHAT PROTOTYPE
====================================

FILES
- index.html: UI and forms
- style.css: responsive styling
- script.js: demo interactions and browser storage

RUN
1. Extract this ZIP and keep all files together.
2. Open index.html in a modern browser.
3. Use the demo email sign-in flow.
4. Create a skill / send a learning request.
5. The skill owner accepts the request from Dashboard > Incoming requests.
6. Both requester and skill owner can use Open chat, then send learning-related messages.

CHAT FEATURES
- Learning chat is unlocked only after a request is Accepted.
- Accepted requests appear under Dashboard > Learning chats.
- Conversation list shows the other participant, skill and message count.
- Messages are associated with the request and displayed as chat bubbles.
- Messages are stored in this browser's localStorage.
- Basic validation discourages sharing phone numbers, email addresses, links or private location details.

IMPORTANT LIMITATIONS
This is a frontend lab/demo. It is NOT a real-time multi-user messaging service. Messages only exist in this browser's localStorage and are not delivered across devices or to another person's browser. Demo sign-in does not verify email ownership. For a real product, implement verified authentication, a backend API/database, authorization checking that only the accepted requester and skill owner can read/write a thread, rate limiting, moderation/reporting, secure transport and privacy/security testing. Do not use real sensitive information in this prototype.
