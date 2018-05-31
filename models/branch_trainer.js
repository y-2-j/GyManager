module.exports = (sequelize, DataTypes) => {
    return sequelize.define("branch_trainer", {
        status: {
            type: DataTypes.ENUM,
            values: ["PENDING", "APPROVED", "REJECTED", "LEFT"],
            default: "PENDING"
        }
    });
};