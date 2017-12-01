-- NOTE functions started with two underscores should not be called by the application

CREATE OR REPLACE FUNCTION user_ping(_user_id INT) RETURNS void AS $$
BEGIN
  UPDATE users
  SET last_seen = now_utc()
  WHERE id = _user_id AND online = TRUE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_login(_fb_id VARCHAR, _nickname VARCHAR, _token VARCHAR) RETURNS users AS $$
DECLARE
  _user users%ROWTYPE;
BEGIN
  SELECT * INTO _user FROM users WHERE fb_id = _fb_id;

  IF NOT FOUND THEN
    INSERT INTO users (fb_id, nickname)
    VALUES (_fb_id, _nickname)
    RETURNING * INTO _user;
  END IF;

  UPDATE users
  SET last_seen = now_utc(), token = _token, online = TRUE
  WHERE id = _user.id
  RETURNING * INTO _user;

  RETURN _user;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_logout(_user_id INT) RETURNS void AS $$
BEGIN
  UPDATE users
  SET online = FALSE, token = NULL, room_id = NULL, ready = FALSE
  WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION _dictionary_get_random_word() RETURNS VARCHAR AS $$
DECLARE
  _word VARCHAR;
  _rows INT;
BEGIN
  SELECT count(*) INTO _rows FROM dictionary;
  SELECT word INTO STRICT _word FROM dictionary OFFSET floor(random() * _rows) LIMIT 1;
  RETURN _word;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_start_round(_room_id INT) RETURNS rounds AS $$
DECLARE
  _room RECORD;
	_round rounds%ROWTYPE;
 	_painter RECORD;
	_player RECORD;
BEGIN
  SELECT * INTO STRICT _room
  FROM rooms_extra
  WHERE id = _room_id;

  IF _room.round_id IS NOT NULL THEN
    RAISE EXCEPTION 'The room is having a round';
  END IF;

  IF _room.player_count < 2 THEN
    RAISE EXCEPTION 'Less than 2 players in the room';
  END IF;

  IF EXISTS (SELECT id FROM users WHERE room_id = _room_id AND observer = FALSE AND ready = FALSE) THEN
    RAISE EXCEPTION 'some players in room % are not ready', _room_id;
  END IF;

  -- OK to start a round here
	-- select a random user as the painter
	SELECT * INTO STRICT _painter
  FROM users
  WHERE room_id = _room_id AND observer = FALSE
  ORDER BY RANDOM() LIMIT 1;

	-- create the round entry
	INSERT INTO rounds (room_id, painter_id, answer)
  VALUES (_room_id, _painter.id, _dictionary_get_random_word())
	RETURNING * INTO _round;

	-- create a row for each of the rest players in round_user table
	FOR _player IN SELECT * FROM users WHERE room_id = _room_id AND observer = FALSE LOOP
		IF _player.id <> _painter.id THEN
			INSERT INTO round_user (round_id, user_id) VALUES (_round.id, _player.id);
		END IF;
  END LOOP;

	-- clear ready bit of every user in the room
	UPDATE users SET ready = FALSE WHERE room_id = _room_id;
	RETURN _round;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION try_round_end(_round_id INT) RETURNS rounds AS $$
DECLARE
  _round rounds%ROWTYPE;
BEGIN
  SELECT * INTO _round FROM rounds WHERE id = _round_id;

  IF _round.painter_id NOT IN (SELECT id FROM users WHERE room_id = _round.room_id AND observer = FALSE) THEN
    -- painter is not in the room
    SELECT * INTO STRICT _round FROM round_end(_round_id);
    RETURN _round;
  END IF;

  IF EXISTS ((SELECT id FROM users WHERE room_id = _round.room_id AND observer = FALSE)
  EXCEPT (SELECT painter_id FROM rounds WHERE id = _round_id)
  EXCEPT (SELECT user_id FROM round_user WHERE submission = _round.answer AND round_id = _round_id)) THEN
    RAISE EXCEPTION 'There is still someone who has not got the correct answer';
  END IF;

  -- all guessers in the room got the correct answer
  SELECT * INTO STRICT _round FROM round_end(_round_id);
  RETURN _round;
END;
$$ LANGUAGE plpgsql;

-- round_end() should be called by the application when it is time to end a round
CREATE OR REPLACE FUNCTION round_end(_round_id INT, _penalty INT DEFAULT 5) RETURNS rounds AS $$
DECLARE
  _round RECORD;
  _row RECORD;
  _correct_guesses INT;
  _total_guess_count INT;
BEGIN
  -- raise exception if the round is already ended
  UPDATE rounds SET ended_at = now_utc()
  WHERE id = _round_id AND ended_at IS NULL
  RETURNING * INTO STRICT _round;

  IF NOT EXISTS (SELECT id FROM users WHERE id = _round.painter_id AND room_id = _round.room_id AND observer = FALSE) THEN
    -- penalize the painter if he is not in the room
    UPDATE rounds SET painter_score = painter_score - _penalty WHERE id = _round.id;
  END IF;

  FOR _row IN SELECT * FROM round_user WHERE round_id = _round.id LOOP
    IF NOT EXISTS (SELECT id FROM users WHERE id = _row.user_id AND room_id = _round.room_id AND observer = FALSE) THEN
      -- penalize the guesser if he is not in the room
      UPDATE round_user SET score = score - _penalty WHERE round_id = _row.round_id AND user_id = _row.user_id;
    END IF;
  END LOOP;

  SELECT count(*) INTO _correct_guesses
  FROM round_user
  WHERE round_id = _round.id AND submission = _round.answer;

  SELECT count(*) INTO _total_guess_count
  FROM round_user
  WHERE round_id = _round.id AND submission IS NOT NULL;

  UPDATE rounds
  SET painter_score = painter_score + _calc_painter_score(_correct_guesses, _total_guess_count)
  WHERE id = _round.id
  RETURNING * INTO STRICT _round;

  RETURN _round;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_create_room(_user_id INT, _passcode VARCHAR DEFAULT '') RETURNS rooms AS $$
DECLARE
    _room rooms%ROWTYPE;
    _user RECORD;
BEGIN
	SELECT * INTO STRICT _user FROM users WHERE id = _user_id;
  -- ensure user is not in a room
	IF _user.room_id IS NOT NULL THEN
    RAISE EXCEPTION 'you are in room %', _user.room_id;
	END IF;
  -- create a new room
	INSERT INTO rooms (passcode) VALUES (_passcode) RETURNING * INTO _room;
  -- add this user into this room as a non-observer
	UPDATE users SET room_id = _room.id, observer = FALSE, ready = FALSE WHERE id = _user.id;
	RETURN _room;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_enter_room(_user_id INT, _room_id INT, _passcode VARCHAR DEFAULT '',
  _is_observer BOOLEAN DEFAULT FALSE, _max_players INT DEFAULT 6) RETURNS VOID AS $$
DECLARE
	_user RECORD;
	_room rooms%ROWTYPE;
  _round rounds%ROWTYPE;
BEGIN
	SELECT * INTO STRICT _user FROM users WHERE id = _user_id;
	IF _user.room_id IS NOT NULL THEN
		RAISE EXCEPTION 'you are in room %, exit before entering another room', _user.room_id;
	END IF;

	SELECT * INTO STRICT _room FROM rooms WHERE id = _room_id;
  IF _room.passcode <> _passcode THEN
      RAISE EXCEPTION 'incorrect passcode';
  END IF;

  IF NOT _is_observer THEN
    -- check if room is full of players
  	IF (SELECT count(*) FROM users WHERE room_id = _room.id AND observer = FALSE) >= _max_players THEN
  		RAISE EXCEPTION 'room % is full. Cannot enter as a player. But you can enter as observer', _room_id;
  	END IF;
    -- if there is an active round in this room, user can only join as an observer
    IF EXISTS (SELECT * FROM open_rounds WHERE room_id = _room.id) THEN
      RAISE EXCEPTION 'room % is having a round. Cannot enter as a player. But you can enter as observer', _room_id;
    END IF;
  END IF;

	UPDATE users SET room_id = _room.id, observer = _is_observer, ready = FALSE WHERE id = _user.id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_exit_room (_user_id INT) RETURNS VOID AS $$
DECLARE
	_user RECORD;
BEGIN
  SELECT * INTO STRICT _user FROM users WHERE id = _user_id;
  IF _user.room_id IS NULL THEN
    RAISE EXCEPTION 'you are not in a room';
  END IF;
  UPDATE users SET room_id = NULL WHERE id = _user.id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_change_state (_user_id INT, _ready BOOLEAN) RETURNS VOID AS $$
DECLARE
  _user RECORD;
BEGIN
  SELECT * INTO STRICT _user FROM users_extra WHERE id = _user_id;
  IF _user.room_id IS NULL THEN
      RAISE EXCEPTION 'you are not in a room';
  END IF;
  IF _user.observer THEN
      RAISE EXCEPTION 'you are an observer';
  END IF;
  IF _user.round_id IS NOT NULL THEN
      RAISE EXCEPTION 'you are in a round';
  END IF;

  UPDATE users SET ready = _ready WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION user_guess (_user_id INT, _submission VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
  _round RECORD;
  _score INT;
  _record RECORD;
BEGIN
  SELECT * INTO STRICT _round FROM open_rounds
  WHERE id = (SELECT round_id FROM users_extra WHERE id = _user_id);

  SELECT * INTO STRICT _record FROM round_user
  WHERE round_id = _round.id AND user_id = _user_id;

  IF _record.submission = _round.answer THEN
    RAISE EXCEPTION 'you have submitted the correct answer';
  ELSE
    _score := 0;
    IF _submission = _round.answer THEN
      _score := _calc_guesser_score(_record.attempt + 1);
    END IF;

    UPDATE round_user
    SET submission = _submission, score = _score,
    attempt = attempt + 1, submitted_at = now_utc()
    WHERE round_id = _round.id AND user_id = _user_id;
  END IF;

  RETURN _submission = _round.answer;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_draw (_user_id INT, _image TEXT) RETURNS VOID AS $$
DECLARE
  _round RECORD;
BEGIN
  SELECT * INTO STRICT _round FROM open_rounds
  WHERE id = (SELECT round_id FROM users_extra WHERE id = _user_id);

  IF _round.painter_id = _user_id THEN
    UPDATE rounds SET image = _image, image_timestamp = now_utc() WHERE id = _round.id;
  ELSE
    RAISE EXCEPTION 'you are not the painter';
  END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION _calc_painter_score(_correct_guesses INT, _total_guess_count INT) RETURNS INT AS $$
BEGIN
  IF _correct_guesses = 0 THEN
    RETURN 0;
  ELSE
    RETURN 4 * _total_guess_count / _correct_guesses;
  END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION _calc_guesser_score(_attempt INT) RETURNS INT AS $$
BEGIN
  CASE _attempt
    WHEN 1, 2, 3 THEN
        RETURN 5;
    WHEN 4, 5, 6 THEN
        RETURN 2;
    ELSE
        RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_auto_logout(_thresh INTERVAL DEFAULT '60S') RETURNS SETOF users AS $$
DECLARE
  _row RECORD;
BEGIN
  FOR _row IN SELECT * FROM users WHERE online = TRUE AND last_seen < now_utc() - _thresh LOOP
    PERFORM user_logout(_row.id);
    RETURN NEXT _row;
  END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql;
