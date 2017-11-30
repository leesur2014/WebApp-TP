-- NOTE functions started with two underscores should not be called by the application

-- start read-only functions

CREATE OR REPLACE FUNCTION calc_painter_score(_correct_guesses INT, _total_guesser_count INT) RETURNS INT AS $$
BEGIN
    IF _correct_guesses = 0 THEN
        RETURN 0;
    ELSE
        RETURN 2 * _total_guesser_count / _correct_guesses;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION calc_guesser_score(_attempt INT) RETURNS INT AS $$
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


CREATE OR REPLACE FUNCTION user_get_by_id (_user_id INT) RETURNS users AS $$
DECLARE
    _user users%ROWTYPE;
BEGIN
    BEGIN
        SELECT * INTO STRICT _user FROM users WHERE id = _user_id;
    EXCEPTION
            WHEN NO_DATA_FOUND THEN
                    RAISE EXCEPTION 'user % not found', _user_id;
    END;
    RETURN _user;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_by_id (_room_id INT) RETURNS rooms AS $$
DECLARE
    _row rooms%ROWTYPE;
BEGIN
    BEGIN
        SELECT * INTO STRICT _row FROM rooms WHERE id = _room_id;
    EXCEPTION
            WHEN NO_DATA_FOUND THEN
                    RAISE EXCEPTION 'room % not found', _room_id;
    END;
    RETURN _row;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION round_get_by_id (_round_id INT) RETURNS rounds AS $$
DECLARE
    _row rounds%ROWTYPE;
BEGIN
    BEGIN
        SELECT * INTO STRICT _row FROM rounds WHERE id = _round_id;
    EXCEPTION
            WHEN NO_DATA_FOUND THEN
                    RAISE EXCEPTION 'round % not found', _round_id;
    END;
    RETURN _row;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_get_current_round(_user_id INT) RETURNS SETOF rounds AS $$
BEGIN
    RETURN QUERY SELECT * FROM open_rounds WHERE room_id = (SELECT room_id FROM user_get_by_id(_user_id)) LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_get_current_round_id(_user_id INT) RETURNS INT AS $$
DECLARE
    _id INT;
BEGIN
    SELECT id INTO _id FROM open_rounds WHERE room_id = (SELECT room_id FROM user_get_by_id(_user_id)) LIMIT 1;
    IF NOT FOUND THEN
      SELECT NULL INTO _id;
    END IF;
    RETURN _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_is_painter(_user_id INT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT * FROM user_get_current_round(_user_id) WHERE painter_id = _user_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_current_round(_room_id INT) RETURNS SETOF rounds AS $$
BEGIN
    RETURN QUERY SELECT * FROM open_rounds WHERE room_id = _room_id LIMIT 1;
    RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_users(_room_id INT) RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY SELECT * FROM users WHERE room_id = _room_id;
    RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_players (_room_id INT) RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY SELECT * FROM users WHERE room_id = _room_id AND observer = FALSE;
    RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_count_users(_room_id INT) RETURNS INT AS $$
DECLARE
    _count INT;
BEGIN
	SELECT count(*) INTO _count FROM users WHERE room_id = _room_id;
    return _count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_count_players(_room_id INT) RETURNS INT AS $$
DECLARE
    _count INT;
BEGIN
	SELECT count(*) INTO _count FROM users WHERE room_id = _room_id AND observer = FALSE;
    return _count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION room_get_random_player(_room_id INT) RETURNS users AS $$
DECLARE
    _user users%ROWTYPE;
BEGIN
    BEGIN
        SELECT * INTO STRICT _user FROM room_get_players(_room_id) ORDER BY RANDOM() LIMIT 1;
    EXCEPTION
            WHEN NO_DATA_FOUND THEN
                    RAISE EXCEPTION 'no users in room %', _room_id;
    END;
    RETURN _user;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION dictionary_get_random_word() RETURNS VARCHAR AS $$
DECLARE
    _word VARCHAR;
    _rows INT;
BEGIN
    SELECT count(*) INTO _rows FROM dictionary;
    SELECT word INTO STRICT _word FROM dictionary OFFSET floor(random() * _rows) LIMIT 1;
    RETURN _word;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION __room_can_start_round(_room_id INT) RETURNS BOOLEAN AS $$
BEGIN
	-- ensure there is no active rounds in this room
	IF EXISTS (SELECT * FROM room_get_current_round(_room_id)) THEN
        RAISE INFO 'there is an open round in room %', _room_id;
		RETURN FALSE;
	END IF;
	-- ensure that there are at least two players in this room
	IF room_count_players(_room_id) < 2 THEN
		RAISE INFO 'less than two players in room %', _room_id;
        RETURN FALSE;
	END IF;
    -- ensure that all players are ready
    IF EXISTS (SELECT id FROM room_get_players(_room_id) WHERE ready = FALSE) THEN
        RAISE INFO 'some players in room % are not ready', _room_id;
        RETURN FALSE;
    END IF;
	RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- END read-only functionssss

CREATE OR REPLACE FUNCTION user_ping(_user_id INT) RETURNS void AS $$
BEGIN
    UPDATE users SET last_seen = now_utc() WHERE id = _user_id AND online = TRUE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_login(_fb_id VARCHAR, _nickname VARCHAR, _token VARCHAR) RETURNS users AS $$
DECLARE
    _user users%ROWTYPE;
BEGIN
    SELECT * INTO _user FROM users WHERE fb_id = _fb_id;
    IF NOT FOUND THEN
        INSERT INTO users (fb_id, nickname) VALUES (_fb_id, _nickname) RETURNING * INTO _user;
    END IF;
    UPDATE users SET last_seen = now_utc(), token = _token, online = TRUE
        WHERE id = _user.id RETURNING * INTO _user;
    RETURN _user;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_logout(_user_id INT) RETURNS void AS $$
BEGIN
    UPDATE users SET online = FALSE, token = NULL, room_id = NULL WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_create_room(_user_id INT, _passcode VARCHAR DEFAULT '') RETURNS rooms AS $$
DECLARE
    _room rooms%ROWTYPE;
    _user users%ROWTYPE;
BEGIN
	SELECT * INTO STRICT _user FROM user_get_by_id(_user_id);
    -- ensure user is not in a room
	IF _user.room_id IS NOT NULL THEN
	    RAISE EXCEPTION 'you are in room %', _user.room_id;
	END IF;
    -- create a new room
	INSERT INTO rooms (passcode) VALUES (_passcode) RETURNING * INTO _room;
    -- add this user into this room as a non-observer
	PERFORM user_enter_room(_user.id, _room.id, _passcode);
	RETURN _room;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION room_start_round(_room_id INT) RETURNS rounds AS $$
DECLARE
	_round rounds%ROWTYPE;
 	_painter RECORD;
	_player RECORD;
BEGIN
    PERFORM room_get_by_id(_room_id);
	IF NOT __room_can_start_round(_room_id) THEN
        RAISE EXCEPTION 'cannot start a new round';
    END IF;
	-- select a random user as the painter
	SELECT * INTO STRICT _painter FROM room_get_random_player(_room_id);
	-- create the round entry
	INSERT INTO rounds (room_id, painter_id, answer)
        VALUES (_room_id, _painter.id, dictionary_get_random_word())
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

CREATE OR REPLACE FUNCTION try_round_end(_round_id INT) RETURNS rounds AS $$
DECLARE
    _round RECORD;
BEGIN
    SELECT * INTO _round FROM rounds WHERE id = _round_id;

    IF _round.painter_id NOT IN (SELECT id FROM room_get_players(_round.room_id)) THEN
        -- painter is not in the room
        SELECT * INTO STRICT _round FROM round_end(_round_id);
        RETURN _round;
    END IF;


    IF EXISTS ((SELECT id FROM room_get_players(_round.room_id))
        EXCEPT (SELECT painter_id FROM rounds WHERE id = _round_id)
        EXCEPT (SELECT user_id FROM round_user WHERE submission = _round.answer AND round_id = _round_id)) THEN
        RAISE EXCEPTION 'There is still someone who has not got the correct answer';
    ELSE
        -- all guessers in the room got the correct answer
        SELECT * INTO STRICT _round FROM round_end(_round_id);
    END IF;

    RETURN _round;
END;
$$ LANGUAGE plpgsql;

-- round_end() should be called by the application when it is time to end a round
CREATE OR REPLACE FUNCTION round_end(_round_id INT, _penalty INT DEFAULT 5) RETURNS rounds AS $$
DECLARE
    _round RECORD;
    _row RECORD;
    _correct_guesses INT;
    _total_guesser_count INT;
BEGIN
    -- raise exception if the round is already ended
    UPDATE rounds SET ended_at = now_utc() WHERE id = _round_id AND ended_at IS NULL RETURNING * INTO STRICT _round;

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

    SELECT count(*) INTO _total_guesser_count
    FROM round_user
    WHERE round_id = _round.id;

    UPDATE rounds
    SET painter_score = painter_score + calc_painter_score(_correct_guesses, _total_guesser_count)
    WHERE id = _round.id
    RETURNING * INTO STRICT _round;

    RETURN _round;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION round_abort(_round_id INT) RETURNS rounds AS $$
DECLARE
    _round RECORD;
BEGIN
    SELECT * INTO STRICT _round FROM open_rounds WHERE id = _round_id;

    IF EXISTS (SELECT id FROM room_get_players(_round.room_id) WHERE id = _round.painter_id)
        AND EXISTS (SELECT id FROM room_get_players(_round.room_id) WHERE id <> _round.painter_id) THEN
        RAISE EXCEPTION 'round % cannot be aborted', _round.id;
    ELSE
        UPDATE rounds SET ended_at = now_utc() WHERE id = _round_id AND ended_at IS NULL
        RETURNING * INTO STRICT _round;
    END IF;

    RETURN _round;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION user_enter_room(_user_id INT, _room_id INT, _passcode VARCHAR DEFAULT '',
    _is_observer BOOLEAN DEFAULT FALSE, _max_players INT DEFAULT 6) RETURNS VOID AS $$
DECLARE
	_user users%ROWTYPE;
	_room rooms%ROWTYPE;
    _round rounds%ROWTYPE;
BEGIN
	SELECT * INTO _user FROM user_get_by_id(_user_id);
	IF _user.room_id IS NOT NULL THEN
		RAISE EXCEPTION 'you are in room %', _user.room_id;
	END IF;
	SELECT * INTO _room FROM room_get_by_id(_room_id);
    IF _room.passcode <> _passcode THEN
        RAISE EXCEPTION 'incorrect passcode';
    END IF;

    IF NOT _is_observer THEN
        -- check if room is full of players
    	IF (SELECT room_count_players(_room_id)) >= _max_players THEN
    		RAISE EXCEPTION 'room % is full. Cannot enter as a player. But you can enter as observer', _room_id;
    	END IF;
        -- if there is an active round in this room, user can only join as an observer
        IF EXISTS (SELECT * FROM room_get_current_round(_room_id)) THEN
            RAISE EXCEPTION 'room % has a round. Cannot enter as a player. But you can enter as observer', _room_id;
        END IF;
    END IF;

	UPDATE users SET room_id = _room.id, observer = _is_observer, ready = FALSE WHERE id = _user.id;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_exit_room (_user_id INT) RETURNS INTEGER AS $$
DECLARE
	_user users%ROWTYPE;
BEGIN
    SELECT * INTO _user FROM user_get_by_id(_user_id);
    IF _user.room_id IS NULL THEN
        RAISE EXCEPTION 'you are not in a room';
    END IF;
    UPDATE users SET room_id = NULL WHERE id = _user.id;
    RETURN _user.room_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_change_state (_user_id INT, _ready BOOLEAN) RETURNS VOID AS $$
DECLARE
    _user users%ROWTYPE;
BEGIN
    SELECT * INTO _user FROM user_get_by_id(_user_id);
    IF _user.room_id IS NULL THEN
        RAISE EXCEPTION 'you are not in a room';
    END IF;
    IF _user.observer THEN
        RAISE EXCEPTION 'you are an observer';
    END IF;
    IF EXISTS (SELECT * FROM user_get_current_round(_user_id)) THEN
        RAISE EXCEPTION 'you are in an active round';
    END IF;

    UPDATE users SET ready = _ready WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION user_guess (_user_id INT, _submission VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
    _round rounds%ROWTYPE;
    _score INT;
    _record round_user%ROWTYPE;
BEGIN

    SELECT * INTO _round FROM user_get_current_round(_user_id);
    IF NOT FOUND THEN
        RAISE EXCEPTION 'you are not in a round';
    END IF;

    SELECT * INTO STRICT _record FROM round_user WHERE round_id = _round.id AND user_id = _user_id;

    IF _record.submission = _round.answer THEN
        RAISE EXCEPTION 'you have submitted the correct answer';
    ELSE
        _score := 0;
        IF _submission = _round.answer THEN
            _score := calc_guesser_score(_record.attempt + 1);
        END IF;

        UPDATE round_user SET submission = _submission, score = _score, attempt = attempt + 1,
        submitted_at = now_utc() WHERE round_id = _round.id AND user_id = _user_id;
    END IF;

    RETURN _submission = _round.answer;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_draw (_user_id INT, _image TEXT) RETURNS VOID AS $$
DECLARE
    _round RECORD;
BEGIN
    SELECT * INTO _round FROM user_get_current_round(_user_id);
    IF NOT FOUND THEN
        RAISE EXCEPTION 'you are not in a round';
    END IF;
    IF _round.painter_id = _user_id THEN
        UPDATE rounds SET image = _image, image_timestamp = now_utc() WHERE id = _round.id;
    ELSE
        RAISE EXCEPTION 'you are not the painter';
    END IF;
END;
$$ LANGUAGE plpgsql;
