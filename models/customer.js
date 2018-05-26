module.exports = (sequelize, DataTypes) => {
    return sequelize.define("customer", {
        membershipNo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        password: DataTypes.STRING,
        age: DataTypes.INTEGER,
        joinDate: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        expiryDate: DataTypes.DATEONLY,
        height: DataTypes.REAL,
        weight: DataTypes.REAL,
        fees: DataTypes.INTEGER
    });
};