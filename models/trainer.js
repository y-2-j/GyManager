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
        startTime: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        endTime: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        experience: DataTypes.INTEGER
    });
};