-- credit https://stackoverflow.com/questions/16609724/using-current-time-in-utc-as-default-value-in-postgresql
create function now_utc() returns timestamp as $$
  select now() at time zone 'utc';
$$ language sql;

CREATE TABLE "users" (
	"id" SERIAL NOT NULL,
	"fb_id" VARCHAR(64) NOT NULL UNIQUE,
	"token" VARCHAR(64) NULL,
	"nickname" VARCHAR(64) NOT NULL,
	"score_draw" INTEGER NOT NULL DEFAULT '0',
	"score_guess" INTEGER NOT NULL DEFAULT '0',
	"joined_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL default now_utc(),

	"online" boolean NOT NULL default 'FALSE',
	"room_id" INTEGER NULL,
	"ready" boolean NOT NULL default 'FALSE',
	"observer" boolean NOT NULL default 'FALSE',
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "rooms" (
	"id" SERIAL NOT NULL,
	"passcode" CHAR(10) NOT NULL DEFAULT '',
	"created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL default now_utc(),
	"deleted_at" TIMESTAMP WITHOUT TIME ZONE NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "rounds" (
	"id" SERIAL NOT NULL,
	"painter_id" INTEGER NOT NULL,
	"painter_score" INTEGER NOT NULL DEFAULT 0,
	"room_id" INTEGER NOT NULL,
	"started_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL default now_utc(),
	"ended_at" TIMESTAMP WITHOUT TIME ZONE NULL,
	"answer" VARCHAR(64) NOT NULL,
  "image" TEXT NULL,
  "image_timestamp" TIMESTAMP WITHOUT TIME ZONE NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "round_user" (
	"user_id" INTEGER NOT NULL,
	"round_id" INTEGER NOT NULL,
	"submission" VARCHAR(64) NULL,
	"submitted_at" timestamp NULL,
	"score" INTEGER NOT NULL DEFAULT 0,
  "attempt" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("user_id", "round_id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "dictionary" (
	"word" VARCHAR(64) NOT NULL,
	PRIMARY KEY ("word")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "painter_score_map" (
	"correct_guesses" INTEGER PRIMARY KEY,
	"score" INTEGER NOT NULL
) WITH (
  OIDS=FALSE
);


ALTER TABLE "users" ADD CONSTRAINT "user_fk0" FOREIGN KEY ("room_id") REFERENCES "rooms"("id");


ALTER TABLE "rounds" ADD CONSTRAINT "round_fk0" FOREIGN KEY ("painter_id") REFERENCES "users"("id");
ALTER TABLE "rounds" ADD CONSTRAINT "round_fk1" FOREIGN KEY ("room_id") REFERENCES "rooms"("id");

ALTER TABLE "round_user" ADD CONSTRAINT "guesser_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "round_user" ADD CONSTRAINT "guesser_fk1" FOREIGN KEY ("round_id") REFERENCES "rounds"("id");


-- TODO
-- Implement the constraint that users cannot be in a room whose deleted_at is not null
