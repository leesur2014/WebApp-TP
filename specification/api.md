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
GET | `/api/me` | Get current user's info
POST | `/api/me` | change my nickname
GET | `/api/lounge` | Get a list of public rooms
GET | `/api/room` | Get detailed info about current room
GET | `/api/room/{room_id}` | Get detailed info about a public room
GET | `/api/user/{user_id}` | Get info about a user
GET | `/api/round` | Get detailed info about current round
GET | `/api/round/{round_id}` | Get result of a past round
POST | `/api/room` | Create a room
POST | `/api/enter` | Join a room
POST | `/api/exit` | Quit a room
POST | `/api/ready` | Set/clear the user's ready bit
POST | `/api/guess` | Submit the answer for a round
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


## Examples

### Get my info

```
GET /api/me
```

```json
{
    "id": 4,
    "fb_id": "482587648807570",
    "nickname": "adsasdsad",
    "score_draw": 0,
    "score_guess": 0,
    "score_penalty": 0,
    "joined_at": "2017-11-06T03:07:27.708Z",
    "online": false,
    "room_id": 15,
    "ready": false,
    "observer": false
}
```


### change my nickname

field | optional | Description
-----|-----------|--------------
nickname | No | new nickname

```
POST /api/me

nickname=whatever
```

```json
{
    "code": 0,
    "data": {
        "id": 4,
        "fb_id": "482587648807570",
        "nickname": "whatever",
        "score_draw": 0,
        "score_guess": 0,
        "score_penalty": 0,
        "joined_at": "2017-11-06T03:07:27.708Z",
        "online": false,
        "room_id": 15,
        "ready": false,
        "observer": false
    }
}
```

### create a room

field | optional | Description
-----|-----------|--------------
passcode | Yes | passcode for that room, if not exist, the room is public

```
POST /api/room
```

```json
{
    "code": 0,
    "data": {
        "id": 3,
        "passcode": "          ",
        "created_at": "2017-11-06T07:29:09.304Z",
        "deleted_at": null
    }
}
```



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

### Get stats of a public room

This endpoint if useful for incremental updates in the client's list of public rooms.
```
GET /api/room/10
```


```JSON
{
  "code": 0,
  "data": {
    "id": 2,
    "created_at": "2017-11-18T23:19:39.873Z",
    "user_count": 3,
    "player_count": 3,
    "round_id": null
  }
}
```

### Get detailed info about current room

```
GET /api/room
```

```json
{
  "code": 0,
  "data": {
    "id": 2,
    "passcode": " ",
    "created_at": "2017-11-18T23:19:39.873Z",
    "deleted_at": null,
    "users": [
        {
      "id": 4,
      "nickname": "Test User 3",
      "observer": false,
      "ready": false
      },
        {
      "id": 1,
      "nickname": "xxxxxxxxx",
      "observer": false,
      "ready": false
      },
        {
      "id": 2,
      "nickname": "xxxxxxxxxxxxx",
      "observer": false,
      "ready": false
      }
    ],
    "round_id": null
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
      "id": 100,
      "score_guess": 20,
      "score_draw": 20,
      "nickname": "Mike"
    }
}
```


### Get info about a round

```
GET /api/round/100
```

```json
{
  "code": 0,
  "data": {
    "id": 8,
    "painter_id": 2,
    "painter_score": 2,
    "room_id": 2,
    "started_at": "2017-11-19T00:42:24.516Z",
    "ended_at": "2017-11-19T00:46:52.803Z",
    "answer": "keyboard",
    "image": null,
    "image_timestamp": null,
    "users": [
        {
      "user_id": 1,
      "score": 0
      },
        {
      "user_id": 4,
      "score": 0
      }
    ]
  }
}
```

### Get the latest image of a round

```
GET /api/round/image
```

```json
{
  "code": 0,
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAU..."
}
```


### enter a room

field | optional | Description
-----|-----------|--------------
room_id | No | id of room to enter
passcode | No | user provided passcode for this room, use an empty string for public rooms
observer | No | enter as observer?

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
force | No | whether to exit forcefully, i.e. during a round

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
POST /api/guess

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
image | No | Data URLs encoded canvas, image should be in png format

Request example

```
POST /api/draw

image=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC
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
