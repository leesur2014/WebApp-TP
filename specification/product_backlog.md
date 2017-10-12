## List of functionalities and Description of actions

### Login/logout via Facebook

1. A user can log in through Facebook via OAuth2.
2. Whenever a user accesses our home page, a button
"continue with Facebook" would redirect them to login
with their Facebook accounts.
3. After a user logs in, he/she will see a game center
page which displays all public game rooms.
4. A user may log out at any time. But if a user quits during a game,
his/her points will be deducted.

### Game Center

1. The game center displays a list of public game rooms.
1. A user may join any publicly listed game room by clicking on it.
2. A user may join a private room by entering a code.
3. A user could create room. If he chooses to create a private room, this user will get a room invitation code.

### Drawing Room

1. A room consists of one to six players.
2. The minimal unit of a game is a round.
3. A game round starts when the following condition is satisfied:
  1. There are more than two players in the room
  2. All players are ready
4. At the beginning of a round, the server designates a player as the painter and other players as guessers.
The server presents the painter a word. Then the painter draws on the board. The painter should complete
his/her drawing within a predefined time. Meanwhile, the guessers may type their guesses into a input box.
The server will notify a guesser if his/her guess is correct or not.
4. A game round ends in two cases.
  1. more than half of the guesser have come up with the correct answer
  2. a predefined time out occurs
  3. the painter quits the game
5. When the round ends. All guessers who submitted the correct answer will get some points.
If nobody guessed right, the painter's points will be deducted.


### Scoreboard

1. The users with highest overall scores are displayed
2. A 'Best guesser' list (users with highest 'guessing' scores)
3. A 'Best Painter' list (users with highest 'painting' scores)


## Primary Responsibilities assignment

| Modules | Responsible team members|
|---|---|
| Views: Log in/ Log out (via Facebook) | Xuhui Wang |
| Scoreboard | Peipei Li|
| Game Center | Hancheng Zhong |
| Drawing Room Logic (with highest cohesion) | Hancheng Zhong, Xuhui Wang, Peipei Li|
