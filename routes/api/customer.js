const route = require("express").Router();

const moment = require("moment");
// Requiring passport
const Passport = require("passport");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//Requiring customer model
const { Customer, Branch, Trainer, Allotment } = require("../../models");
const { checkBranchLoggedIn, checkCustomerLoggedIn } = require("../../utils/auth");

// HELPERS
const authenticateCustomer = (req, res, next) => {
    Passport.authenticate("customer", (err, customer) => {
        if (err)
            return next(err);
        if (!customer)
            return res.status(401).send({ err: "Invalid Credentials!" });
        req.logIn(customer, err => {
            if (err)
                return next(err);
            return res.send({ membershipNo: req.user.membershipNo, name: req.user.name });
        });
    })(req, res, next);
};


// Login the user
route.post("/login", authenticateCustomer);

// Signup
route.post("/signup", async (req, res, next) => {
    try {
        const { name, password, age, height, weight } = req.body;

        const customer = await Customer.create({ name, password, age, height, weight });
        req.body.membershipNo = customer.dataValues.membershipNo;

        authenticateCustomer(req, res, next);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


// GET Route for a customer's details: 
// Customer details are kept private, Only Customer can check his details
route.get("/:membershipNo", checkCustomerLoggedIn, async (req, res) => {
    try {
        if (req.user.membershipNo != req.params.membershipNo) { // Explicit Coersion
            return res.status(401).send({ err: "Cannot See other Customer's Details" });
        }

        const attributes = { exclude: ["password", "createdAt", "updatedAt"] };
        const customer = await Customer.findById(req.params.membershipNo, {
            include: [{
                model: Branch,
                attributes: ["id", "name", "phoneNo"]
            }, {
                model: Trainer,
                attributes: ["id", "name", "startTime", "endTime"]
            }],
            attributes
        });
        if (customer === null)
            return res.status(404).send({ err: "Customer not found!" });

        res.send(customer);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});


// PUT Route to update single customer's details
// Can update: name, password, age, height, weight
route.put("/:membershipNo", checkCustomerLoggedIn, async (req, res) => {
    try {
        if (req.user.membershipNo != req.params.membershipNo) { // Explicit coersion
            return res.status(401).send({ err: "Cannot Change other Customer's details!" });
        }

        // Prevent changing membershipNo and branchId
        const { name, password, age, height, weight } = req.body;
        await Customer.update({ name, password, age, height, weight }, {
            where: { membershipNo: req.params.membershipNo }
        });

        const customer = await Customer.findById(req.params.membershipNo, {
            attributes: { exclude: ["password", "createdAt", "updatedAt"] }
        });
        res.send(customer);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});


// POST Route to update Attendance of Customer
route.post("/:membershipNo/attendance", checkBranchLoggedIn, async (req, res) => {
    try {
        // Find the customer, with branch
        const customer = await Customer.findById(req.params.membershipNo, {
            include: [{
                model: Branch,
                // Check if current Branch is same as his Branch
                where: {
                    id: req.user.id
                }
            }, {
                model: Allotment,
                where: {
                    branchId: req.user.id,
                    time: {
                        [Op.gte]: moment().format("YYYY-MM-DD")
                    }
                },
                required: false
            }]
        });

        if (customer === null) {
            res.status(404).send({ err: "No such Customer found in your Branch!" });
        }

        
        // Check if Customer already alloted today, if yes, update time and return
        if (customer.allotments.length != 0) {
            const allotment = customer.allotments[0];
            await allotment.update({ time: moment() });
            return res.send(allotment);
        }
        else {
            const allotment = await Allotment.create({ time: moment() });
            await Promise.all([
                allotment.setCustomer(customer),
                allotment.setBranch(customer.branch),
                allotment.setTrainer(customer.trainerId)
            ]);
            return res.send(await allotment.reload());
        }

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = route;