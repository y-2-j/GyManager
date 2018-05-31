const route = require("express").Router();

const passport = require("passport");

const { Op } = require("sequelize");

// Requiring branch model
const { Branch, Customer, Trainer } = require("../../models");
const { checkBranchLoggedIn, checkCustomerLoggedIn } = require("../../utils/auth");


const authenticateBranch = (req, res, next) => {
    passport.authenticate("branch", (err, branch) => {
        if (err)
            return next(err);
        if (!branch)
            return res.status(401).send({ err: "Invalid Credentials!" });
        req.logIn(branch, err => {
            if (err)
                return next(err);
            return res.send({ id: req.user.id, name: req.user.name });
        });
    })(req, res, next);
};

// Create new Branch
route.post("/", async (req, res, next) => {
    try {
        const { id, ...branchDetails } = req.body;
        
        const branch = await Branch.create(branchDetails);
        req.body.id = branch.dataValues.id;

        // Log the user in
        authenticateBranch(req, res, next);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// Branch Login
route.post("/login", authenticateBranch);


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


// GET Route for availability of a branch
route.get("/:id/availability", async (req, res) => {
    try {
        // Check if branch exists
        const branch = await Branch.findById(req.params.id);
        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });
        
        // Array to be sent
        // Has 24 booleans corresponding to whether branch can accomodate the customer at ith hour or not
        const availability = [];

        for (let i = 0; i < 24; ++i) {
            const time = i*10000;

            // Find all trainers and their customers at ith Hour
            const trainers = await branch.getTrainers({   
                where: {
                    // Must be available at ith hour
                    startTime: {
                        [Op.lte]: time
                    },
                    endTime: {
                        [Op.gte]: time + 10000
                    }
                },
                include: {
                    model: Customer,
                    required: false,
                    // All Customers attended to at that hour
                    where: {
                        preferredTime: time
                    }
                }
            });

            // Find a free trainer
            if (trainers.findIndex(trainer => trainer.customers.length < 5) === -1) {
                // If no free trainer found can't accomodate customer at this time 
                availability[i] = false;
                continue;
            }

            // Find number of customers in Gym at ith hour
            const numCustomers = await branch.countCustomers({
                where: {
                    preferredTime: time
                }
            });

            if (numCustomers === branch.dataValues.capacity) {
                // If the Branch does not have more space for the customer
                availability[i] = false;
                continue;
            }

            // Else, customer can be accomodated
            availability[i] = true;
        }

        // Send the Availability Array to User
        res.send(availability);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});


module.exports = route;