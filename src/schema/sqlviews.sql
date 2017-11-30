
CREATE VIEW public_rooms AS SELECT id, created_at, room_count_users(id) AS user_count,
room_count_players(id) AS player_count, (SELECT id FROM room_get_current_round(id)) AS round_id
FROM rooms WHERE passcode = '' ORDER BY id;

CREATE VIEW open_rounds AS SELECT * FROM rounds WHERE ended_at IS NULL ORDER BY id;

CREATE VIEW top_guessers AS SELECT id, nickname, score_guess FROM users ORDER BY score_guess;
CREATE VIEW top_painters AS SELECT id, nickname, score_draw FROM users ORDER BY score_draw;
CREATE VIEW top_users AS SELECT id, nickname, score_draw, score_guess, (score_guess + score_draw)
  AS score FROM users ORDER BY score DESC;

CREATE VIEW online_users AS SELECT *, user_get_current_round_id(id) AS round_id FROM users WHERE online = TRUE;
