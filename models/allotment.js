module.exports = (sequelize, DataTypes) => {
    return sequelize.define("allotment", {
        startTime: DataTypes.DATE,
        endTime: DataTypes.DATE
    });
};