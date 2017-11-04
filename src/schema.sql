CREATE TABLE "users" (
	"id" serial NOT NULL,
	"fb_id" varchar(255) NOT NULL UNIQUE,
	"fb_access_token" char(255) NULL,
	"fb_token_expire_at" TIMESTAMP NULL,
	"access_token" char(128) NULL,
	"nickname" varchar(64) NOT NULL,
	"score_draw" integer NOT NULL DEFAULT '0',
	"score_guess" integer NOT NULL DEFAULT '0',
	"score_penalty" integer NOT NULL DEFAULT '0',
	"joined_at" TIMESTAMP NOT NULL default current_timestamp,

	"online" boolean NOT NULL default 'FALSE',
	"room_id" integer NULL,
	"ready" boolean NOT NULL default 'FALSE',
	"observer" boolean NOT NULL default 'FALSE',
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "rooms" (
	"id" serial NOT NULL,
	"passcode" character(10) NULL,
	"created_at" TIMESTAMP NOT NULL default current_timestamp,
	"deleted_at" TIMESTAMP NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "rounds" (
	"id" serial NOT NULL,
	"painter_id" integer NOT NULL,
	"painter_score" integer NULL,
	"room_id" integer NOT NULL,
	"started_at" TIMESTAMP NOT NULL default current_timestamp,
	"ended_at" TIMESTAMP NULL,
	"answer" varchar(64) NOT NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "round_user" (
	"user_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"submission" varchar(64) NULL,
	"submitted_at" timestamp NULL,
	"score" integer NULL,
	PRIMARY KEY ("user_id", "round_id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "canvas" (
	"id" serial NOT NULL,
	"round_id" integer NOT NULL,
	"timestamp" TIMESTAMP NOT NULL default current_timestamp,
	"image" bytea NOT NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "dictionary" (
	"word" varchar(64) NOT NULL,
	PRIMARY KEY ("word")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "painter_score_map" (
	"correct_guessers" INTEGER,
	"score" INTEGER NOT NULL,
	PRIMARY KEY ("correct_guessers")
) WITH (
  OIDS=FALSE
);

INSERT INTO "painter_score_map" (correct_guessers, score) VALUES (0, 0), (1, 3), (2, 3), (3, 2), (4, 1), (5, 1);

ALTER TABLE "users" ADD CONSTRAINT "user_fk0" FOREIGN KEY ("room_id") REFERENCES "rooms"("id");


ALTER TABLE "rounds" ADD CONSTRAINT "round_fk0" FOREIGN KEY ("painter_id") REFERENCES "users"("id");
ALTER TABLE "rounds" ADD CONSTRAINT "round_fk1" FOREIGN KEY ("room_id") REFERENCES "rooms"("id");

ALTER TABLE "round_user" ADD CONSTRAINT "guesser_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "round_user" ADD CONSTRAINT "guesser_fk1" FOREIGN KEY ("round_id") REFERENCES "rounds"("id");

ALTER TABLE "canvas" ADD CONSTRAINT "canvas_fk0" FOREIGN KEY ("round_id") REFERENCES "rounds"("id");


CREATE VIEW public_rooms AS SELECT rooms.id, rooms.created_at, count(users.id)
FROM rooms JOIN users ON users.room_id = rooms.id
WHERE rooms.passcode IS NULL AND rooms.deleted_at IS NULL
GROUP BY rooms.id ORDER BY rooms.id;

CREATE VIEW top_guessers AS SELECT id, nickname, score_guess FROM users ORDER BY score_guess FETCH FIRST 50 ROWS ONLY;
CREATE VIEW top_painter AS SELECT id, nickname, score_draw FROM users ORDER BY score_draw FETCH FIRST 50 ROWS ONLY;
CREATE VIEW top_users AS SELECT id, nickname, (score_guess + score_draw - score_penalty) AS score
FROM users ORDER BY score FETCH FIRST 50 ROWS ONLY;
