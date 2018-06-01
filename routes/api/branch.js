const route = require("express").Router();

const passport = require("passport");

// Requiring branch model
const { Branch, Equipment } = require("../../models");
const { checkBranchLoggedIn } = require("../../utils/auth");


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

module.exports = route;