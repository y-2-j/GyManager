module.exports = (sequelize, DataTypes) => {
    return sequelize.define("allotment", {
        time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
};