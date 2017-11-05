INSERT INTO users (fb_id, nickname) VALUES ('test_id_2', 'Test User 2') RETURNING id;
INSERT INTO users (fb_id, nickname) VALUES ('test_id_3', 'Test User 3') RETURNING id;
INSERT INTO users (fb_id, nickname) VALUES ('test_id_1', 'Test User 1') RETURNING id;


INSERT INTO dictionary VALUES ('apple'), ('orange'), ('greet'), ('dictionary'), ('keyboard');
