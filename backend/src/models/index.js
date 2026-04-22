const { fn, col, where } = require("sequelize");
const User = require("./user");
const Profile = require("./profile");
const Score = require("./score");

User.hasOne(Profile, { foreignKey: "user_id", as: "profile" });
Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(Score, { foreignKey: "user_id", as: "scores" });
Score.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  fn,
  col,
  where,
  User,
  Profile,
  Score
};
