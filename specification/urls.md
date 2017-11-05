# views

URL | Description
----|-------------
`/` | game center, login required
`/users/login` | login page
`/users/logout` | logout
`/users/callback` | Facebook OAuth2 callback

# HTTP API

Method | URL | Description
---|----|-------------
GET | `/api/lounge` | Get a list of public rooms
GET | `/api/room` | Get detailed info about current room
GET | `/api/user/{user_id}` | Get info about a user
POST | `/api/room` | Create a room
POST | `/api/enter` | Join a room
POST | `/api/exit` | Quit a room
POST | `/api/ready` | Set/clear the user's ready bit
POST | `/api/submit` | Submit the answer for a round
POST | `/api/draw` | Send the painter's drawing

All POST requests body is an URLencoded string.

All endpoints require login. Or a HTTP 401 response is returned.

All endpoints return a JSON object on HTTP 200 responses. If the `code` is 0, the request is successful. Otherwise the request failed. In the failure case, the error attribute is a string containing the reason. For example,

```json
{
  "code": -1,
  "error": "lalalala"
}
```

For brevity, all timestamps are omitted in examples.


## Examples

### Get the list of public rooms

```
GET /api/lounge
```

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "created_at": "2017-10-05T14:48:00.000Z",
      "user_count": 2,
      "player_count": 2,
      "round_id": null
    },
    {
      "id": 2,
      "created_at": "2017-10-05T14:48:00.000Z",
      "user_count": 2,
      "player_count": 2,
      "round_id": 5
    }
  ]
}
```

### Get detailed info about current room

```
GET /api/room
```

```json
{
  "code": 0,
  "data":
    {
      "id": 1,
      "created_at": "2017-10-05T14:48:00.000Z",
      "passcode": "xxxxx",
      "players": [1, 4, 5, 8],
      "observers": [2, 3],
      "round": null
    }
}
```

When there is a round in this room

```json
{
  "code": 0,
  "data":
    {
      "id": 1,
      "created_at": "2017-10-05T14:48:00.000Z",
      "passcode": "ssss",
      "players": [1, 4, 5, 8],
      "observers": [2, 3],
      "round": {
        "id": 10,
        "painter_id": 20,
        "started_at": "2017-10-05T14:48:00.000Z"
      }
    }
}
```


### Get info about a user

```
GET /api/user/100
```

```json
{
  "code": 0,
  "data":
    {
      "id": 1,
      "score_guess": 20,
      "score_draw": 20,
      "score_penalty": 0,
      "nickname": "Mike"
    }
}
```

### enter a room

field | optional | Description
-----|-----------|--------------
room_id | No | id of room to enter
passcode | Yes | user provided passcode
observer | yes | enter as observer?

Request example
```
POST /api/enter

room_id=10&passcode=233333&observer=false
```

successful response

```json
{
  "code": 0,
  "room_id": 222
}
```

failed response

```json
{
  "code": -1,
  "error": "room does not exist"
}
```


### exit current room

field | optional | Description
-----|-----------|--------------
force | No | whether to exit forcefully

Request example
```
POST /api/exit

force=false
```

successful responses
```json
{
  "code": 0
}
```


failed responses

```json
{
  "code": -1,
  "error": "user 3 is not in a room"
}
```


### set the user's ready state

field | optional | Description
-----|-----------|--------------
ready | No | ready or not

Request example
```
POST /api/ready

ready=true
```

successful response
```json
{
  "code": 0
}
```


failed response

```json
{
  "code": -1,
  "error": "user 3 is not in a room"
}
```



### submit a user's guess

field | optional | Description
-----|-----------|--------------
submission | No | guess word


Request example
```
POST /api/submit

submission=chicken
```

successful responses
```json
{
  "code": 0,
  "correct": true
}
```

```json
{
  "code": 0,
  "correct": false
}
```

failed response

```json
{
  "code": -1,
  "error": "user 3 is not in a room"
}
```

### submit a painter's drawing

field | optional | Description
-----|-----------|--------------
canvas | No | Data URLs encoded canvas, image should be in png format

Request example

```
POST /api/draw

canvas=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC
```

successful response

```json
{
  "code": 0,
}
```

failure response

```json
{
  "code": -1,
  "error": "user 1 is not the painter in round 10"
}
```


# Websoket API


URL | Description
----|--------------
`/ws/room/{room_id}` | Get notifications about events in the room
`/ws/lounge` | Get notifications about all public rooms (planned)

A client should connect to `/ws/room/{room_id}` after the user enters the room. The connection
is closed when a user leaves a room. The server sends events as JSON objects to the client.

The JSON object contains an `event` member and an optional `data` member. The `event` member is
a string containing the type of the event.

event type | desc    
-----------|---------
`user_enter` | a user entered this room
`user_exit` | a user left this room
`user_guess` | a user submitted a guess
`round_start` | a round started
`round_end` | a round ended
`image` | painter's drawing

## Examples

```json
{
  "event": "user_enter",
  "data": {
    "user_id": 120,
  }
}
```

```json
{
  "event": "user_exit",
  "data": {
    "user_id": 120,
  }
}
```


```json
{
  "event": "round_start",
  "data": {
    "round_id": 110,
  }
}
```

```json
{
  "event": "round_end",
  "data": {
    "round_id": 110,
  }
}
```


```json
{
  "event": "image",
  "data": {
    "round_id": 110,
  }
}
```


```json
{
  "event": "user_guess",
  "data": {
    "user_id": 120,
    "correct": false
  }
}
```
