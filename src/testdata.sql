INSERT INTO users (fb_id, nickname) VALUES ('test_id_2', 'Test User 2') RETURNING id;
INSERT INTO users (fb_id, nickname) VALUES ('test_id_3', 'Test User 3') RETURNING id;
INSERT INTO users (fb_id, nickname) VALUES ('test_id_1', 'Test User 1') RETURNING id;


INSERT INTO dictionary VALUES ('apple'), ('orange'), ('greet'), ('dictionary'), ('keyboard');


INSERT INTO "painter_score_map" VALUES (0, 0), (1, 3), (2, 3), (3, 2), (4, 1), (5, 1);
