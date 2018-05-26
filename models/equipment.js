module.exports = (sequelize, DataTypes) => {
    return sequelize.define("equipment", {
        name: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        category: DataTypes.STRING,
        price: DataTypes.INTEGER
    });
};