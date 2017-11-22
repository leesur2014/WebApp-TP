CREATE OR REPLACE FUNCTION update_score_draw() RETURNS trigger AS
$$
BEGIN
  ASSERT NEW.painter_id = OLD.painter_id;
  UPDATE users SET score_draw = score_draw + NEW.painter_score - OLD.painter_score
  WHERE id = NEW.painter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_score_guess() RETURNS trigger AS
$$
BEGIN
  ASSERT NEW.user_id = OLD.user_id;
  UPDATE users SET score_guess = score_guess + NEW.score - OLD.score
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION delete_empty_room () RETURNS trigger AS
$$
BEGIN
  DELETE FROM rooms WHERE id = OLD.room_id AND NOT EXISTS (SELECT id FROM users WHERE room_id = rooms.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_round_update AFTER
UPDATE OF painter_score ON rounds
FOR EACH ROW
EXECUTE PROCEDURE update_score_draw ();


CREATE TRIGGER on_round_user_update AFTER
UPDATE OF score ON round_user
FOR EACH ROW
EXECUTE PROCEDURE update_score_guess ();

CREATE TRIGGER on_user_exit_room AFTER
UPDATE OF room_id ON users
FOR EACH ROW
WHEN (OLD.room_id IS NOT NULL AND NEW.room_id IS NULL)
EXECUTE PROCEDURE delete_empty_room ();
