const route = require("express").Router({ mergeParams: true });

const moment = require("moment");

const { Branch, Customer, Allotment } = require("../../../models");
const { checkBranchLoggedIn, checkCustomerLoggedIn } = require("../../../utils/auth");

const { Op } = require("sequelize");

// GET all customers of a particular branch
route.get("/", checkBranchLoggedIn, async (req, res) => {
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
route.get("/availability", async (req, res) => {
    try {
        console.log(req.params);
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
route.post("/join", checkCustomerLoggedIn, async (req, res) => {
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



// GET Route to Get Attendance Report for the Branch's Customers of any Date
// Default Date: Current Date
route.get("/attendance", checkBranchLoggedIn, async (req, res) => {
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

module.exports = route;