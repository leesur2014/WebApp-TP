CREATE OR REPLACE FUNCTION _room_get_current_round_id(_room_id INT) RETURNS INT AS $$
DECLARE
    _id INT;
BEGIN
    SELECT id INTO _id FROM open_rounds WHERE room_id = _room_id LIMIT 1;
    IF NOT FOUND THEN
      SELECT NULL INTO _id;
    END IF;
    RETURN _id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION _user_is_painter(_user_id INT) RETURNS BOOLEAN AS $$
DECLARE
  _user RECORD;
BEGIN
  SELECT * INTO _user
  FROM users
  WHERE id = _user_id;

  IF _user.room_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT * FROM open_rounds
    WHERE painter_id = _user_id AND room_id = _user.room_id
  );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION _room_count_users(_room_id INT) RETURNS INT AS $$
DECLARE
  _count INT;
BEGIN
	SELECT count(*) INTO _count FROM users WHERE room_id = _room_id;
  return _count;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION _room_count_players(_room_id INT) RETURNS INT AS $$
DECLARE
  _count INT;
BEGIN
	SELECT count(*) INTO _count FROM users WHERE room_id = _room_id AND observer = FALSE;
  return _count;
END;
$$ LANGUAGE plpgsql;

CREATE VIEW users_safe AS
  SELECT id, observer, nickname, score_draw, room_id, ready, last_seen, online,
    score_guess, (score_draw + score_guess) AS score
  FROM users;

CREATE VIEW users_extra AS
  SELECT *,
  _room_get_current_round_id(room_id) AS round_id,
  (score_guess + score_draw) AS score,
  _user_is_painter(id) AS painter
  FROM users;

CREATE VIEW rooms_extra AS
  SELECT *,
  _room_get_current_round_id(id) AS round_id,
  _room_count_users(id) AS user_count,
  _room_count_players(id) AS player_count
  FROM rooms;

CREATE VIEW public_rooms AS
  SELECT id, created_at, round_id, user_count, player_count
  FROM rooms_extra
  WHERE passcode = ''
  ORDER BY id DESC;

CREATE VIEW open_rounds AS
  SELECT *
  FROM rounds
  WHERE ended_at IS NULL;

CREATE VIEW score_board AS
  SELECT id, nickname, score_draw, score_guess, score, rank() OVER (ORDER BY score DESC)
  FROM users_extra;

CREATE VIEW history_painter AS
  SELECT users.id AS user_id, rounds.id AS round_id,
  rounds.started_at, rounds.ended_at, rounds.painter_score AS score
  FROM rounds JOIN users ON rounds.painter_id = users.id
  WHERE rounds.ended_at IS NOT NULL;

CREATE VIEW history_guesser AS
  SELECT round_user.user_id, round_user.round_id, rounds.started_at, rounds.ended_at, round_user.score
  FROM rounds JOIN round_user ON round_user.round_id = rounds.id
  WHERE rounds.ended_at IS NOT NULL;

CREATE VIEW history AS
  SELECT *, TRUE as painter FROM history_painter UNION
  SELECT *, FALSE as painter FROM history_guesser
  ORDER BY round_id DESC;
