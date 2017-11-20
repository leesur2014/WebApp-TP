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

The connection will be disconnected immediately if authentication fails.

The endpoint has two values: `lounge` and `room`. The `lounge` endpoint allows the server
to push changes in the game center. While the `room` allows the server to push changes in
the room the user is in.

If the user is not in a room. The client should not connect to the `room` endpoint.
When a user exits a room, the socket.io connection to `room` should be disconnected.

### Lounge events

Below is the table of lounge events

Event name | Description
---------|---------------
`room_create` | A public room is created
`room_change` | The state of a public room has changed, e.g. a user entered the room, a round started, etc
`room_delete` | A public room is deleted

The data of all events has an `room_id` field containing the relevant room_id.
The client should GET `/api/room/{room_id}` if it needs more specific information.

### Room events

Event name | Description
------------|-------------
`user_enter` | A user entered this room
`user_exit` | A user exited this room
`user_change` | A user changed his/her ready state
`user_guess` | A user submitted a guess
`user_draw` | The painter updated his/her canvas
`round_start` | A round has started
`round_end` | A round has ended
`count_down` | Notification on time left in a round

#### `user_enter` and `user_exit`

Returned data has only one `user_id` field, containing the id of the involved user. The client
may GET `/api/user/id` for more information, such as nickname, observer state of that user.

#### `user_change`

Data has `user_id` and `ready` field.

#### `user_guess`

```json
{
  "user_id": 10,
  "correct": true
}
```

#### `user_draw`

This event instructs the client to GET `/api/round` to fetch
the latest drawing of the painter. Data has a `image` field containing the DataURI of the new image.


#### `round_start` and `round_end`

The data has only one `round_id` field, containing the id of the round in question.

When a round is underway, users (players and observers) can GET `/api/round` in order
to see the detail information of the current round. If there is no round in the room,
this call will return code -1.

When a round has ended, the client may GET `/api/round/{round_id}` to fetch the
score of players and the correct answer.


#### `count_down`

The event notifies the client how many seconds are left in this round. Data has a
seconds field which contains the number of seconds left in this round.

### References

* [Token-based Authentication with Socket.IO](https://auth0.com/blog/auth-with-socket-io/)
