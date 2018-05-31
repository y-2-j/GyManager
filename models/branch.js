module.exports = (sequelize, DataTypes) => {
    return sequelize.define("branch", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        capacity: DataTypes.INTEGER,
        pincode: DataTypes.INTEGER(6),
        address: DataTypes.STRING,
        phoneNo: DataTypes.INTEGER(10),
        managerName: DataTypes.STRING,
        password: DataTypes.STRING
    });
};