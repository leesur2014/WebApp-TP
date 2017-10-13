## List of functionalities and Description of actions

### Login/logout via Facebook

1. There is a "Log in with Facebook" button on the login page.
Users can log in with their Facebook accounts via OAuth2.
2. The user is prompted to choose a nickname the first time he/she logs in.
3. After logging in, a user is redirected to a game center page.
4. A user may log out at any time. But if a user quits during a game,
he will be penalized.

### Game Center

1. The game center displays a list of public game rooms.
1. A user may join any public game room by clicking on it.
2. A user may join a private room by entering an invitation code.
3. Users may create public/private rooms. For private rooms, an invitation code
is generated for that room by the server.

### Drawing Room

1. A room can accommodate one to six players.
2. There are two types of users in a room, observers and players.
    * Players can participate in the game as painters or guessers
    * Observers can only watch the game
3. A User can choose his/her role when entering a game room. However, a user is
restricted to be an observer if he/she is entering a room that satisfies one
of the following conditions:
    * There are six players in the room.
    * A round is active.
4. The minimal unit of a game is a round.
5. A round starts when all of the following conditions are met:
    * There are greater than or equal to two players in the room
    * All players are ready
6. At the beginning of a round, the server designates a player as the painter and other players as guessers.
The server presents the painter a word. Then the painter draws on the board. The painter should complete
his/her drawing within a predefined time `T_draw`. Meanwhile, the guessers may type their guesses into a input box.
The server will notify a guesser if his/her guess is correct or not.
7. A game round ends if any of these conditions are true:
    1. more than half of the guesser have come up with the correct answer
    2. a predefined time out `T_round` occurs
    3. the painter quits the game
8. When a round ends. All guessers who submitted the correct answer receive `GF(x)` points.
The painter will receive `PF(x)` points. Variable `x` is the # of guessers with correct answers.
Both `GF(x)` and `PF(x)` are configurable.

### Scoreboard

There are three ranking lists on the scoreboard page.

1. Users with highest overall scores
2. A 'Best Guesser' list (users with highest 'guessing' scores)
3. A 'Best Painter' list (users with highest 'painting' scores)


## Primary Responsibilities Assignment

| Modules | Responsible team members|
|---|---|
| Log in/out (via Facebook) | Xuhui Wang |
| Scoreboard | Peipei Li|
| Game Center | Hancheng Zhong |
| Drawing Game Implementation | Hancheng Zhong, Xuhui Wang, Peipei Li|
