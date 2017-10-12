Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres://jzhong:testtest@192.168.88.10:5432/draw');

const Room = sequelize.define('room', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  passcode: {
    // if null, the room is public
    // if not, a user need both the room id and passcode to join the room
    type: Sequelize.STRING,
    allowNull: true
  }
});
  // statistics

const Dict = sequelize.define('dict', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  word: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Round = sequelize.define('round', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  success: {
    // # of people who successfully guessed the word
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  active: {
    // is the round still ongoing
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  canvas: {
    // the drawing canvas
    type: Sequelize.BLOB,
    allowNull: true,
    defaultValue: null
  }
});

const User = sequelize.define('user', {
  id: {
    // unique user ID from Facebook
    type: Sequelize.CHAR(100),
    primaryKey: true
  },
  name: {
    // name provided by Facebook
    type: Sequelize.STRING,
    allowNull: false
  },
  nickname: {
    // name provided by the user for privacy reasons
    type: Sequelize.STRING,
    allowNull: false
  },

  // total_score = guess_score + paint_score - penalty
  guess_score: {
    // increase at correct guess
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  paint_score: {
    // increase at correct guess by other players
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  penalty: {
    // increase when quitting from a round
    type: Sequelize.INTEGER,
    defaultValue: 0
  },

  // game related
  observer: {
    // a user can join a room as an observer or a player when the room has no active rounds
    // a user can only join a room as an observer if the room has an active round
    //
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  ready: {
    // whether the user is ready to begin a round
    // set true when a non-readyonly user clicks 'ready'
    // set false when a round starts
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  busy: {
    // whether the user is painting or guessing
    // set true when round starts
    // set false when a) a round ends b) the user has done drawing c) the user get the correct answer
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
});


Room.hasOne(Round);
Room.hasMany(User);
Round.hasMany(User, {as: 'guesser'});
Round.hasOne(User, {as: 'painter'});
Round.hasOne(Dict, {as: 'word'});

Dict.sync({force: true}).then(function () {
  User.sync({force: true}).then(function () {
    Round.sync({force: true}).then(function () {
    Room.sync({force: true});
  })})});


// Dict.sync();
// Room.sync();
// Round.sync();
// User.sync();
