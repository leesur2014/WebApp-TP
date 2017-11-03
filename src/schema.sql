CREATE TABLE "user" (
	"id" serial NOT NULL,
	"fb_id" varchar(255) NOT NULL UNIQUE,
	"access_token" char(255) NOT NULL,
	"nickname" varchar(64) NOT NULL UNIQUE,
	"token_expire_at" TIMESTAMP NULL,
	"score_draw" integer NOT NULL DEFAULT '0',
	"score_guess" integer NOT NULL DEFAULT '0',
	"score_penalty" integer NOT NULL DEFAULT '0',
	"room_id" integer NULL,
	"ready" boolean NOT NULL default 'TRUE',
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "room" (
	"id" serial NOT NULL,
	"passcode" character(10) NULL,
	"created_at" TIMESTAMP NOT NULL,
	"deleted_at" TIMESTAMP NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "round" (
	"id" serial NOT NULL,
	"painter_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"started_at" TIMESTAMP NOT NULL,
	"ended_at" TIMESTAMP NULL,
	"answer" varchar(64) NOT NULL,
	PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "guesser" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"submission" varchar(64) NULL,
	"score" integer NULL,
	UNIQUE ("user_id", "round_id"),
	PRIMARY KEY ("id"),
) WITH (
  OIDS=FALSE
);



CREATE TABLE "canvas" (
	"id" serial NOT NULL,
	"round_id" integer NOT NULL,
	"timestamp" TIMESTAMP NOT NULL,
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



ALTER TABLE "user" ADD CONSTRAINT "user_fk0" FOREIGN KEY ("room_id") REFERENCES "room"("id");


ALTER TABLE "round" ADD CONSTRAINT "round_fk0" FOREIGN KEY ("painter_id") REFERENCES "user"("id");
ALTER TABLE "round" ADD CONSTRAINT "round_fk1" FOREIGN KEY ("room_id") REFERENCES "room"("id");

ALTER TABLE "guesser" ADD CONSTRAINT "guesser_fk0" FOREIGN KEY ("user_id") REFERENCES "user"("id");
ALTER TABLE "guesser" ADD CONSTRAINT "guesser_fk1" FOREIGN KEY ("round_id") REFERENCES "round"("id");

ALTER TABLE "canvas" ADD CONSTRAINT "canvas_fk0" FOREIGN KEY ("round_id") REFERENCES "round"("id");