const route = require("express").Router();

// Requiring passport
const Passport = require("passport");

//Requiring customer model
const { Customer } = require("../../models");
const { checkCustomerLoggedIn } = require("../../utils/auth");

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
        const customer = await Customer.findById(req.params.membershipNo, { attributes, raw: true });
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


module.exports = route;