## views

URL | Description
----|-------------
`/` | game center, login required
`/room/:id` | game room, accessible only if current user is in the room, redirect to game center otherwise
`/users/login` | login page
`/users/logout` | logout
`/users/callback` | Facebook OAuth2 callback

# HTTP API

URL | Description
----|-------------
`/api/rooms` | Get a list of public rooms
`/api/join` | Join a room
`/api/quit` | Quit a room
`/api/ready` | Set the user's ready bit
`/api/submit` | Submit the answer for a round
`/api/push` | Push the painter's drawing


# Websoket API


URL | Description
----|--------------
`/api/image` | Receive the painter's drawing
`/api/status` | Get the status of the game process
