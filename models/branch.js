module.exports = (sequelize, DataTypes) => {
    return sequelize.define("branch", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        capacity: DataTypes.INTEGER,
        pincode: DataTypes.CHAR(6),
        address: DataTypes.STRING,
        phoneNo: DataTypes.CHAR(10),
        managerName: DataTypes.STRING,
        password: DataTypes.STRING
    });
};