const route = require("express").Router({ mergeParams: true });

const { Branch, Trainer, BranchTrainer } = require("../../../models");
const { checkBranchLoggedIn } = require("../../../utils/auth");

// GET route to retrieve all pending Trainer Application Requests
route.get("/", checkBranchLoggedIn, async (req, res) => {

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
route.post("/:applicationNo/approve", checkBranchLoggedIn, async (req, res) => {
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
route.post("/:applicationNo/reject", checkBranchLoggedIn, async (req, res) => {
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