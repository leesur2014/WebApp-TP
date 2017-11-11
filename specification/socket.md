# Socket.IO API

we use socket.io for two purposes. One is to notify users when rooms are created,
deleted, or a room's state changes so that user can see the changes in the game center
, or lounge, page without refreshing the page. The second purpose is to notify users
about changes in their rooms.

### User authentication

The server-side socket.io implementation cannot access express sessions. Although
there are node packages which enables accessing express sessions in socket.io, I
do not favor this approach.

Instead, user authentication in socket.io is done with a query parameter containing
an access token. Users are assigned random tokens at the time they log in. The
client(i.e. front-end) can get this token at the `/api/me` endpoint.

The client should connect to the server's socket io endpoint in the following way

```js
const socket = io("https://guessmydrawing.fun/{endpoint}?token=xxxxxxx");
```

The connection will be disconnected immediately if the authentication fails.

The endpoint has two values: `lounge` and `room`. The `lounge` endpoint allows the server
to push changes in the game center. While the `room` allows the server to push changes in
the room the current user is in.

If the user is not in a room. The client should not connect to the `room` endpoint.
When a user exits a room, the socket.io connection should also be disconnected.

### Lounge events

Below is the table of lounge events

Event name | Description
---------|---------------
`room_create` | A public room is created
`room_change` | The state of a public room has changed, e.g. a user entered the room, a round started, etc
`room_delete` | A public room is deleted

The data of the first two events has the following structure

```json
{
  "id": 111,
  "created_at": "2017-11-06T03:07:27.708Z",
  "user_count": 3,
  "player_count": 2
}
```

The data of `room_delete` event has only the `id` field.


### Room events

Event name | Description
------------|-------------
`user_enter` | A user entered this room
`user_exit` | A user exited this room
`user_guess` | A user submitted a guess
`user_draw` | The painter updated his/her canvas
`round_start` | A round has started
`round_end` | A round has ended

#### `user_enter` and `user_exit`

The data has only one `id` field, containing the id of the involved user. The client
may GET `/api/user/id` for more information, such as nickname, observer state of that user.

#### `user_guess`

```json
{
  "id": 10,
  "correct": true
}
```

#### `user_draw`

This event instructs the client to GET `/api/image/round_id` in order to display
the latest drawing of the painter. No data is associated with this event.


#### `round_start` and `round_end`

The data has only one `id` field, containing the id of the round in question.
The client may GET `/api/round/id` for more information on the round.


### References

* [Token-based Authentication with Socket.IO](https://auth0.com/blog/auth-with-socket-io/)
