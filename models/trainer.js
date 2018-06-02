module.exports = (sequelize, DataTypes) => {
    return sequelize.define("trainer", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        password: DataTypes.STRING,
        salary: DataTypes.INTEGER,
        startTime: DataTypes.TIME,
        endTime: DataTypes.TIME,
        experience: DataTypes.INTEGER
    });
};