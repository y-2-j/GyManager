// Import Sequelize
const Sequelize = require("sequelize");

// User Files
const CONFIG = require("../config");

// Connect to Database
const db = new Sequelize(CONFIG.DB.DATABASE, CONFIG.DB.USER, CONFIG.DB.PASSWORD, {
	host: CONFIG.DB.HOST,
  dialect: "mysql",
  logging: false
});


// Import Models
const Branch = db.import("./branch");
const Customer = db.import("./customer");
const Trainer = db.import("./trainer");
const Equipment = db.import("./equipment");
const BranchEquipment = db.import("./branch_equipment");
const Allotment = db.import("./allotment");
const BranchTrainer = db.import("./branch_trainer");

// Associations
Customer.belongsTo(Branch);
Branch.hasMany(Customer);

Trainer.belongsToMany(Branch, { through: BranchTrainer, constraints: false });
Branch.belongsToMany(Trainer, { through: BranchTrainer, constraints: false });

Customer.belongsTo(Trainer);
Trainer.hasMany(Customer);

Branch.belongsToMany(Equipment, { through: BranchEquipment });
Equipment.belongsToMany(Branch, { through: BranchEquipment });

Allotment.belongsTo(Customer, { constraints: false });
Customer.hasMany(Allotment, { constraints: false });

Allotment.belongsTo(Trainer, { constraints: false });
Trainer.hasMany(Allotment, { constraints: false });

Allotment.belongsTo(Branch, { constraints: false });
Branch.hasMany(Allotment, { constraints: false });


db.authenticate()
  .then(() => db.sync({ alter: true }))
  .then(() => console.log("Database Ready!"))
  .catch(err => {
      console.error("Database Connection Failure: ", err);
      process.exit();
  });

// Export the Database and Connection
module.exports = { Branch, Customer, Trainer, Equipment, Allotment, BranchTrainer, db };