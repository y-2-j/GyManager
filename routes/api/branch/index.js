const route = require("express").Router();

// Requiring branch model
const { Branch } = require("../../../models");
const { checkBranchLoggedIn } = require("../../../utils/auth");


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



// Sub-Routes
route.use("/", require("./auth"));
route.use("/:id/trainers", require("./trainer"));
route.use("/:id/equipments", require("./equipment"));
route.use("/:id/customers", require("./customer"));
route.use("/:id/applications", require("./application"));




module.exports = route;