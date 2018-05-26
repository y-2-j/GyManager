module.exports = (sequelize, DataTypes) => {
    return sequelize.define("branch_equipment", {
        manufacturer: DataTypes.STRING,
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
};