Sprint 1 Backlog
==================

#### Current Product Owner: Hancheng Zhong
#### Next Product Owner: Xuhui Wang

Features
------------------

1. Users can log in with their Facebook accounts.
2. A User will be prompted for a nickname the first time he/she logs in.
3. Users will be redirected to the game center page after logging in.
4. The game center displays a list of public game rooms. For each request, only render part of the game center, render more content if users scroll all the way down to the bottom of the page.
5. Users may create public/private rooms. For private rooms, an invitation code
is generated for that room by the server.
6. A user may join any public game room by clicking on it in the game center page.
7. A user may join a private room by entering an invitation code in the game center page.

Tasks
--------------------------------------


Related Feature No. | Title | Est. Hours | Assignment
-------------------|--------|------------|----------------
All | Define URLs for synchronous views | 1 | Hancheng
All | Read express.js docs | 3 | Hancheng
All | Implement routes in express.js | 2 | Hancheng
All | Analysis authentication requirements for each URL | 1 | Hancheng
All | Read docs of node-postgres | 2 | Hancheng
All | Re/Define database structures | 2 | Hancheng
All | Test database queries | 2 | Hancheng
All | Comprehensive code review on database queries | 5 | Xuhui
All | Deployment on cloud | 4 | Xuhui
1 | Read Facebook OAuth2 API docs | 3 | Xuhui
1 | Read passport.js docs | 2 | Xuhui
1 | Create OAuth2 client ID and key on FB | 1 | Xuhui
1,2,3 | Implement OAuth2 callback view | 3 | Xuhui
1 | Test OAuth2 functionality | 2 | Xuhui
4 | Design HTML/CSS for the game center view | 4 | Peipei
4 | Read React.js API docs | 4 | Peipei
4 | Implement game center partial rendering | 6 | Peipei
5,6,7 | Define JSON endpoints for retrieving game room list, creating/joining/leaving game rooms | 1 | Hancheng
4 | Write JS code to retrieve game room list incrementally and update HTML | 2 | Peipei
4 | Write backend code to handle game room list requests | 2 | Hancheng
5 | Write JS code to let user create game rooms | 1 | Peipei
5 | Write backend code to handle room creation requests | 2 | Hancheng
6,7 | Write JS code to let user join game rooms | 1 | Peipei
6,7 | Write backend code to handle room joining requests | 2 | Hancheng
6,7 | Write backend code to handle room leaving requests | 2 | Hancheng
4,5,6,7 | Test JSON endpoints functionality | 2 | Hancheng

Notes
-----------------------------
* The game center should allow users to accomplish feature 5, 6, 7 easily.
