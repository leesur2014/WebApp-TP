
CREATE VIEW public_rooms AS SELECT id, created_at, room_count_users(id) AS user_count,
room_count_players(id) AS player_count, (SELECT id FROM room_get_current_round(id)) AS round_id
FROM rooms WHERE passcode = '' AND deleted_at IS NULL ORDER BY id;

CREATE VIEW open_rounds AS SELECT * FROM rounds WHERE ended_at IS NULL ORDER BY id;

CREATE VIEW top_guessers AS SELECT id, nickname, score_guess FROM users ORDER BY score_guess FETCH FIRST 50 ROWS ONLY;
CREATE VIEW top_painter AS SELECT id, nickname, score_draw FROM users ORDER BY score_draw FETCH FIRST 50 ROWS ONLY;
CREATE VIEW top_users AS SELECT id, nickname, (score_guess + score_draw - score_penalty) AS score
FROM users ORDER BY score FETCH FIRST 50 ROWS ONLY;
