Recommended API usage
========================

This document provides the back-end developer's recommendation on API usage.

### Log In

Visit `/users/login` directly.

### Log out

Visit `/users/logout` directly.


### Game Center (Lounge)

The front-end JavaScript code performs:

1. GET `/api/me`. Redirect the user to the login URL if code 401 is returned.
Otherwise, save the user's token in a global variable or the browser's local storage
for later use. Display the user's score.

2. GET `/api/lounge`. And the render the public room list.

3. GET `/api/room`. If the return code is -1, do nothing. Otherwise, notify
the user that he/she is in a room.

4. Establish a socket.io connection to the `/lounge` path with the user's token.

If a `room_create` event is received, then GET `/api/room/{room_id}`
for the state of that room. And then add that room to the public room list.

If a `room_change` event is received, then GET `/api/room/{room_id}`
for the state of that room. And then update the corresponding entry in the room list.

If a `room_create` event is received, then remove the corresponding
entry of the room from the public room list.


### Room Creation

The front-end does an async POST to `/api/room` with the user's choice of
the passcode (empty value for creating a public room). If return code is 0,
redirect the user to the game room page. Otherwise, display
the error message.


### Entering an Existing Room

Do an async POST to `/api/enter` with `room_id`, `observer` and `passcode` as form
data. If return code is 0, redirect the user to the game room page. Otherwise, display
the error message.
