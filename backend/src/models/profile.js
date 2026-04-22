const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const Profile = sequelize.define(
  "Profile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: "profiles",
    timestamps: false
  }
);

module.exports = Profile;
