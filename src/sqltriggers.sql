CREATE TRIGGER on_round_update AFTER
UPDATE ON rounds FOR EACH ROW
EXECUTE PROCEDURE update_score_draw ();


CREATE TRIGGER on_round_user_update AFTER
UPDATE ON round_user FOR EACH ROW
EXECUTE PROCEDURE update_score_guess ();
