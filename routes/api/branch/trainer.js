const route = require("express").Router({ mergeParams: true });

const { Branch, Trainer } = require("../../../models");
const { checkTrainerLoggedIn } = require("../../../utils/auth");


// Route for a Trainer Applying to a branch
route.post("/apply", checkTrainerLoggedIn, async (req, res) => {
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


module.exports = route;