const route = require("express").Router();

const moment = require("moment");

const { Op } = require("sequelize");

// Requiring branch model
const { Branch, Customer, Trainer, Allotment, BranchTrainer } = require("../../../models");
const { checkBranchLoggedIn, checkTrainerLoggedIn, checkCustomerLoggedIn } = require("../../../utils/auth");


// Retrieve all branches
route.get("/", async (req, res, next) => {
    try {
        const branches = await Branch.findAll({
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
            raw: true
        });
        res.send(branches);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// Get one branch
route.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const branch = await Branch.findById(id, {
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
            raw: true
        });
        if (branch === null)
            return res.status(404).send({ err: "Branch not found" });
        res.send(branch);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});


// PUT Route to update single branch's details
// Cannot update id of a branch from this route
route.put("/:id", checkBranchLoggedIn, async (req, res) => {
    try {
        if (req.params.id != req.user.id) { // Explicit Coersion
            return res.status(401).send({ err: "Cannot modify other Branch's Details!" });
        }

        // Prevent id from being updated
        const { id, ...updateValues } = req.body;

        await Branch.update(updateValues, {
            where: { id: req.params.id }
        });

        const branch = await Branch.findById(req.params.id, {
            attributes: { exclude: ["password", "createdAt", "updatedAt"] }
        });
        res.send(branch);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});


// GET Route to Get Attendance Report for the Branch's Customers of any Date
// Default Date: Current Date
route.get("/:id/attendance", checkBranchLoggedIn, async (req, res) => {
    try {
        // Check if current branch is same as in parameters
        if (req.params.id != req.user.id)   // Explicit Coersion
            return res.status(401).send({ err: "Cannot see other Branch's Details!" });

        // Get Date to find Attendance for
        let date = null;
        if (req.query.date)
            date = moment(req.query.date);
        else
            date = moment();
        
        // Find the Branch along with Customers, and their allotments for the date
        const branch = await Branch.findById(req.params.id, {
            include: [{
                model: Customer,
                attributes: ["membershipNo", "name", "preferredTime"],
                include: [{
                    model: Allotment,
                    where: {
                        branchId: req.params.id,
                        time: {
                            [Op.gte]: date.format("YYYY-MM-DD"),
                            [Op.lt]: date.add(1, 'days').format("YYYY-MM-DD")
                        }
                    },
                    required: false
                }]
            }]
        });

        // Optimize the Result
        const customers = branch.customers.map(customer => {
            const { allotments, ...toReturn } = customer.dataValues;
            return { ...toReturn, allotment: allotments[0] && allotments[0].dataValues }
        });

        // Send the list of Customers with their Allotment on specified Date
        res.send(customers);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


// Sub-Routes
route.use("/", require("./auth"));
route.use("/:id/trainers", require("./trainer"));
route.use("/:id/equipments", require("./equipment"));
route.use("/:id/customers", require("./customer"));
route.use("/:id/applications", require("./application"));




module.exports = route;