const route = require("express").Router();

const passport = require("passport");

// Requiring branch model
const { Branch, Trainer } = require("../../models");
const { checkBranchLoggedIn, checkTrainerLoggedIn } = require("../../utils/auth");


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
        
        const application = await trainer.addBranch(branch, { through: { status: "PENDING" }});
        res.send({ trainerId: trainer.id, branchId: branch.id, status: "PENDING" });

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


module.exports = route;