const route = require("express").Router();

const moment = require("moment");
const passport = require("passport");

const { Op } = require("sequelize");

// Requiring branch model
const { Branch, Customer, Trainer, Equipment, Allotment, BranchTrainer } = require("../../models");
const { checkBranchLoggedIn, checkTrainerLoggedIn, checkCustomerLoggedIn } = require("../../utils/auth");


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

// GET route to view equipments of a branch
route.get("/:id/equipments", checkBranchLoggedIn, async (req, res) => {
    try {
        // Check if branch exists
        const branch = await Branch.findById(req.params.id, {
            attributes: [],
            include: {
                model: Equipment,
                required: false
            }
        });

        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });

        // Verifying authority to see branches
        if (req.params.id != req.user.id) { // Explicit Coersion
            return res.status(401).send({ err: "Cannot see other Branch's Details!" });
        }

        // Send the Branch with updated Equipment
        res.send(branch.get("equipment").map(eq => {
            eq = eq.dataValues;
            eq["branch_equipment"] = eq["branch_equipment"].dataValues;
            return eq;
        }));

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// POST route to add and delete an equipment of a branch
route.post("/:id/equipments", checkBranchLoggedIn, async (req, res) => {
    try {
        const { equipmentName, quantity, manufacturer, price, category } = req.body;
        if (quantity < 0)
            return res.status(400).send({ err: "Quantity cannot be negative" });

        // Check if branch exists
        const branch = await Branch.findById(req.params.id, {
            attributes: ["id"],
            include: {
                model: Equipment,
                where: {
                    name: equipmentName
                },
                required: false
            }
        });
        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });

        // Verifying authority to see branches
        if (req.params.id != req.user.id) { // Explicit Coersion
            return res.status(401).send({ err: "Cannot modify other Branch's Details!" });
        }

        // Create the equipment if not found
        const equipment = await Equipment.findOrCreate({
            where: { name: equipmentName },
            defaults: { price, category }
        });

        // Add or update Equipment to the branch
        await branch.addEquipment(equipmentName, { through: { quantity, manufacturer, category } });

        // Send the Branch with updated Equipment
        res.send(await Branch.findById(req.params.id, {
            attributes: {
                exclude: ["password"]
            },
            include: {
                model: Equipment,
                where: {
                    name: equipmentName
                },
                required: false
            }
        }));

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Route for a Trainer Applying to a branch
route.post("/:id/apply", checkTrainerLoggedIn, async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });

        const trainer = await Trainer.findById(req.user.id, {
            include: {
                model: Branch
            }
        });
        const numBranches = trainer.branches.filter(branch => branch["branch_trainer"].status === "APPROVED").length;
        if (numBranches !== 0) {
            return res.status(400).send({ err: "Cannot join more than one Branch at a time!" });
        }
        
        await trainer.addBranches(branch, { through: { status: "PENDING" }});
        const application = await trainer.getBranches({ where: { id: branch.id } });
        const { createdAt, updatedAt, ...toSend } = application[0]["branch_trainer"].dataValues;
        res.send(toSend);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


const checkAvailability = async (branch) => {
    // Array to be sent
    // Has 24 booleans corresponding to whether branch can accomodate the customer at ith hour or not
    const availability = [];

    for (let i = 0; i < 24; ++i) {
        const time = i * 10000;

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
            through: {
                where: { status: "APPROVED" }
            },
            include: [{
                model: Customer,
                required: false,
                // All Customers attended to at that hour
                where: {
                    preferredTime: time
                }
            }]
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
    return availability;
}


// GET Route for availability of a branch
route.get("/:id/availability", async (req, res) => {
    try {
        // Check if branch exists
        const branch = await Branch.findById(req.params.id);
        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });

        const availability = await checkAvailability(branch);

        // Send the Availability Array to User
        res.send(availability);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});


// Function to get a free trainer in the branch at the preferred time
// return null if branch not available
const getfreeTrainer = async (branch, preferredTime) => {
    // Find all trainers and their customers at ith Hour
    const trainers = await branch.getTrainers({
        where: {
            // Must be available at ith hour
            startTime: {
                [Op.lte]: preferredTime
            },
            endTime: {
                [Op.gte]: preferredTime + 10000
            }
        },
        through: {
            where: { status: "APPROVED" }
        },
        include: [{
            model: Customer,
            required: false,
            // All Customers attended to at that hour
            where: {
                preferredTime
            }
        }]
    });

    // Find a free trainer
    const trainer = trainers.find(trainer => trainer.customers.length < 5);
    if (trainer === undefined)
        return null;

    // Find number of customers in Gym at ith hour
    const numCustomers = await branch.countCustomers({ where: { preferredTime } });
    if (numCustomers === branch.dataValues.capacity) {
        // If the Branch does not have more space for the customer
        return null;
    }

    return trainer;
};


// POST route for customer to join a branch
route.post("/:id/join", checkCustomerLoggedIn, async (req, res) => {
    try {
        const preferredTime = parseInt(req.body.preferredTime) * 10000;
        const branchId = req.params.id;
        const membershipNo = req.user.membershipNo;

        const branch = await Branch.findById(branchId);
        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });

        const trainer = await getfreeTrainer(branch, preferredTime);
        if (trainer === null)
            return res.status(404).send({ err: "Branch not available!" });

        const customer = await Customer.findById(membershipNo);

        await Promise.all([
            customer.update({ preferredTime }),
            customer.setBranch(branch),
            customer.setTrainer(trainer)
        ]);

        const { password, salary, createdAt, updatedAt, customers, ...toSend } = trainer.dataValues;
        res.send(toSend);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// GET all customers of a particular branch
route.get("/:id/customers", checkBranchLoggedIn, async (req, res) => {
    try {
        // Check if branch exists
        const branch = await Branch.findById(req.params.id);
        if (branch === null)
            return res.status(404).send({ err: "Branch not found!" });

        // Verifying authority to see branches
        if (req.params.id != req.user.id) { // Explicit Coersion
            return res.status(401).send({ err: "Cannot view other Branch's Details!" });
        }
        const customer = await branch.getCustomers({
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
            raw: true
        });
        res.send(customer);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
})



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

// GET route to retrieve all pending Trainer Application Requests
route.get("/:id/applications", checkBranchLoggedIn, async (req, res) => {

    const branch = await Branch.findById(req.params.id, {
        attributes: [],
        include: {
            model: Trainer,
            attributes: { exclude: ["password"] },
            through: {
                where: {
                    status: "PENDING"
                }
            }
        }
    });

    // Check if branch exists
    if (branch === null)
        res.status(404).send({ err: "Branch not found" });

    // Check if user is the branch owner
    if (req.params.id != req.user.id)
        res.status(401).send({ err: "Not allowed to view other branch's details" });

    res.send(branch.trainers);
});

// POST route to accept a pending application
route.post("/:id/applications/:applicationNo/approve", checkBranchLoggedIn, async (req, res) => {
    const application = await BranchTrainer.findById(req.params.applicationNo);

    // Check if user is the branch owner
    if (req.params.id != req.user.id || req.params.id != application.branchId)
        res.status(401).send({ err: "Not allowed to change other branch's details" });

    // Check for status of Application
    if (application.status != "PENDING")
        return res.status(400).send({ err: "Can approve only Pending Requests!" });

    application.status = "APPROVED";
    res.send(await application.save());
});

// POST route to reject a pending application
route.post("/:id/applications/:applicationNo/reject", checkBranchLoggedIn, async (req, res) => {
    const application = await BranchTrainer.findById(req.params.applicationNo);

    // Check if user is the branch owner
    if (req.params.id != req.user.id || req.params.id != application.branchId)
        res.status(401).send({ err: "Not allowed to change other branch's details" });

    // Check for status of Application
    if (application.status != "PENDING")
        return res.status(400).send({ err: "Can reject only Pending Requests!" });

    application.status = "REJECTED";
    res.send(await application.save());
});

module.exports = route;