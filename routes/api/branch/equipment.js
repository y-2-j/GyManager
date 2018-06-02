const route = require("express").Router({ mergeParams: true });

const { Branch, Equipment } = require("../../../models");
const { checkBranchLoggedIn } = require("../../../utils/auth");

// GET route to view equipments of a branch
route.get("/", checkBranchLoggedIn, async (req, res) => {
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
route.post("/", checkBranchLoggedIn, async (req, res) => {
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