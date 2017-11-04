CREATE OR REPLACE FUNCTION user_get_by_id (_user_id INT) RETURNS users AS $$
DECLARE
  _user users%ROWTYPE;
BEGIN
  SELECT * INTO _user FROM users WHERE id = _user_id;
  IF NOT FOUND THEN
		RAISE EXCEPTION 'user % does not exist', _user_id;
	END IF;
  RETURN _user;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_by_id (_room_id INT) RETURNS rooms AS $$
DECLARE
  _row rooms%ROWTYPE;
BEGIN
  SELECT * INTO _row FROM rooms WHERE id = _room_id;
  IF NOT FOUND THEN
		RAISE EXCEPTION 'room % does not exist', _room_id;
	END IF;
  RETURN _row;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION round_get_by_id (_round_id INT) RETURNS rounds AS $$
DECLARE
  _row rounds%ROWTYPE;
BEGIN
  SELECT * INTO _row FROM rounds WHERE id = _round_id;
  IF NOT FOUND THEN
		RAISE EXCEPTION 'round % does not exist', _round_id;
	END IF;
  RETURN _row;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION room_create(_user_id INT, passcode VARCHAR DEFAULT NULL) RETURNS rooms AS $$
DECLARE
  _room rooms%ROWTYPE;
  _user RECORD;
BEGIN
	SELECT * INTO _user FROM user_get_by_id(_user_id);
  -- ensure user is not in a room
	IF _user.room_id IS NOT NULL THEN
	  RAISE EXCEPTION 'user % is in room %', _user.id, _user.room_id;
	END IF;
  -- create a new room
	INSERT INTO rooms (passcode) VALUES (passcode) RETURNING * INTO _room;
  -- add this user into this room as a non-observer
	PERFORM user_enter_room(_user.id, _room.id);
	RETURN _room;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_delete(_room_id INT) RETURNS VOID AS $$
BEGIN
	IF NOT EXISTS (SELECT * FROM users WHERE room_id = _room_id) THEN
    RAISE INFO 'room % is marked deleted', _room_id;
		UPDATE rooms SET deleted_at = current_timestamp WHERE id = _room_id;
	ELSE
		RAISE EXCEPTION 'room % is not empty', _room_id;
	END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_get_current_round(_room_id INT) RETURNS SETOF rounds AS $$
DECLARE
  _round rounds%ROWTYPE;
BEGIN
  RETURN QUERY SELECT * FROM rounds WHERE room_id = _room_id AND ended_at IS NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_count_players(_room_id INT) RETURNS INT AS $$
BEGIN
	RETURN count(*) FROM users WHERE room_id = _room_id AND observer = FALSE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_get_random_player(_room_id INT) RETURNS users AS $$
DECLARE
  _user users%ROWTYPE;
BEGIN
  SELECT * INTO _user FROM users WHERE room_id = _room_id AND observer = 'FALSE'
    OFFSET floor(random() * room_count_players(_room_id)) LIMIT 1;
  RETURN _user;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_players (_room_id INT) RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE room_id = _room_id AND observer = 'FALSE';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_start_new_round(_room_id INT, word varchar) RETURNS rounds AS $$
DECLARE
	_round rounds%ROWTYPE;
 	_painter RECORD;
	_player RECORD;
BEGIN
  PERFORM room_get_by_id(_room_id);
	-- ensure there is no active rounds in this room
	IF EXISTS (SELECT * FROM room_get_current_round(_room_id)) THEN
		RAISE EXCEPTION 'there is an active round in room %', _room_id;
	END IF;
	-- ensure that there are at least two players in this room
	IF room_count_players(_room_id) < 2 THEN
		RAISE EXCEPTION 'less than two players in room %', _room_id;
	END IF;
  -- ensure that all players are ready
  IF EXISTS (SELECT id FROM users WHERE room_id = _room_id AND observer = FALSE AND ready = FALSE) THEN
    RAISE EXCEPTION 'some users are not ready';
  END IF;
	-- select a random user as the painter
	SELECT * INTO _painter FROM room_get_random_player(_room_id);
	-- create the round entry
	INSERT INTO rounds (room_id, painter_id, answer) VALUES (_room_id, _painter.id, word)
		RETURNING * INTO _round;
	-- create a row for each of the rest players in round_user table
	FOR _player IN SELECT * FROM room_get_players(_room_id) LOOP
		IF _player.id <> _painter.id THEN
			INSERT INTO round_user (round_id, user_id) VALUES (_round.id, _player.id);
		END IF;
  END LOOP;
	-- reset every player's ready bit
	UPDATE users SET ready = FALSE WHERE room_id = _room_id;
	RETURN _round;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION round_end(_round_id INT) RETURNS VOID AS $$
DECLARE
  _round RECORD;
  _row RECORD;
  _correct_guesses INT;
BEGIN
  -- ensure the round is not ended
  SELECT * INTO _round FROM round_get_by_id(_round_id);
  IF _round.ended_at IS NOT NULL THEN
    RAISE EXCEPTION 'round has eneded';
  END IF;
  -- get the # of correct_guesses
  SELECT count(*) INTO _correct_guesses FROM round_user WHERE round_user.submission = _round.answer;
  RAISE INFO '% players got the correct answer', _correct_guesses;
  -- caculate the painter's score thourgh painter_score_map
  -- also mark this round as ended
  UPDATE rounds SET ended_at = current_timestamp, painter_score =
    (SELECT score FROM painter_score_map WHERE correct_guesses = _correct_guesses)
    WHERE id = _round_id RETURNING * INTO _round;
  -- increment the painter's score in users table
  UPDATE users SET score_draw = score_draw + _round.painter_score WHERE id = _round.painter_id;
  -- increment each guesser's score
  FOR _row IN SELECT * FROM round_user WHERE round_id = _round_id LOOP
    UPDATE users SET score_guess = score_guess + _row.score WHERE id = _row.user_id;
  END LOOP;
  UPDATE users SET ready = FALSE WHERE id IN
    (SELECT user_id FROM round_user WHERE round_id = _round_id);
  END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION user_enter_room(_user_id INT, _room_id INT, _passcode VARCHAR DEFAULT '',
  _is_observer BOOLEAN DEFAULT FALSE, _max_players INT DEFAULT 6) RETURNS rooms AS $$
DECLARE
	_user users%ROWTYPE;
	_room rooms%ROWTYPE;
  _round rounds%ROWTYPE;
BEGIN
	SELECT * INTO _user FROM user_get_by_id(_user_id);
	IF _user.room_id IS NOT NULL THEN
		RAISE EXCEPTION 'user % is in room %', _user.id , _user.room_id;
	END IF;
	SELECT * INTO _room FROM room_get_by_id(_room_id);
	IF _room.deleted_at IS NOT NULL THEN
	  RAISE EXCEPTION 'room % has been deleted', _room_id;
	END IF;
  IF _room.passcode <> _passcode THEN
    RAISE EXCEPTION 'wrong passcode';
  END IF;
  -- check if room is full of players
	IF (NOT _is_observer) AND (SELECT room_count_players(_room_id)) >= _max_players THEN
		RAISE EXCEPTION 'room % is full, but can enter as observer', _room_id;
	END IF;
  -- if there is an active round in this room, user can only join as an observer
  IF EXISTS (SELECT room_get_current_round(_room_id)) AND (NOT _is_observer) THEN
    RAISE EXCEPTION 'room % has a round, but can enter as observer', _room_id;
  END IF;
	UPDATE users SET room_id = _room.id, observer = _is_observer, ready = FALSE WHERE id = _user.id;
	RETURN _room;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_exit_room (_user_id INT, _force BOOLEAN DEFAULT FALSE, _penalty INTEGER DEFAULT 5) RETURNS void AS $$
DECLARE
	_user users%ROWTYPE;
BEGIN
  SELECT * INTO _user FROM user_get_by_id(_user_id);
  IF _user.room_id IS NULL THEN
    -- do nothing
    RETURN;
  END IF;
  IF _user.observer THEN
    -- if user if an observer, he/she can exits any time as he/she wants
    UPDATE users SET room_id = NULL WHERE id = _user.id;
  ELSE
    IF EXISTS (SELECT * FROM room_get_current_round(_user.room_id)) THEN
      IF _force THEN
        -- TODO
      ELSE
        RAISE EXCEPTION 'cannot exit this room now';
      END IF;
    ELSE
      -- no active rounds in this room
      -- user can exit without incurring penalty
      UPDATE users SET room_id = NULL WHERE id = _user.id;
    END IF;

    IF room_count_players(_user.room_id) = 0 THEN
      PERFORM room_delete(_user.room_id);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_set_ready_status (_user_id INT, _ready BOOLEAN) RETURNS VOID AS $$
DECLARE
  _user RECORD;
BEGIN
  SELECT * INTO _user FROM user_get_by_id(_user_id);
  IF _user.room_id IS NULL THEN
    RAISE EXCEPTION 'failed since user % is not in a room', _user_id;
  END IF;
  IF _user.observer THEN
    RAISE EXCEPTION 'failed since user % is an observer', _user_id;
  END IF;
  IF EXISTS (SELECT * FROM room_get_current_round(_user.room_id)) THEN
    RAISE EXCEPTION 'failed since a round is active';
  END IF;
  UPDATE users SET ready = _ready WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_submit_answer (_user_id INT, _answer VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
  _round RECORD;
BEGIN
  PERFORM user_get_by_id(_user_id);

  SELECT * INTO STRICT _round FROM rounds WHERE id = (
    SELECT id FROM rounds JOIN round_user ON round_id = id
    WHERE ended_at IS NULL AND user_id = _user_id
  );

  -- TODO: decide whether a user is allow to guess multiple times
  UPDATE round_user SET submission = _answer, submitted_at = current_timestamp
    WHERE round_id = _round.id AND user_id = _user_id;

  IF _answer = _round.answer THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
