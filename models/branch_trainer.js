module.exports = (sequelize, DataTypes) => {
    return sequelize.define("branch_trainer", {
        applicationNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        status: {
            type: DataTypes.ENUM,
            values: ["PENDING", "APPROVED", "REJECTED", "LEFT"],
            default: "PENDING"
        }
    });
};