const { Branch, Customer, Trainer, Equipment,db } =  require("./models");

//Requiring utils for Lorem generator and random number generator 
const Lorem = require("./utils/lorem");
const { randomNum } = require("./utils/randomNo");

// Deleting all records in existing tables
const clearDb = async () => {
    await Promise.all([
        Branch.destroy({ where: {}, truncate: true }),
        Customer.destroy({ where: {}, truncate: true }),
        Trainer.destroy({ where: {}, truncate: true }),
        Equipment.destroy({ where: {}, truncate: true })

    ]).catch(err => {
        console.error("Error in droping tables!");
        db.close();
    })
}

const createRandomData = async (numTrainers, numCustomers, numBranches, numEquips) => {
    try {
        const promises = [];
        for (var i = 0; i < numTrainers; i++) {
            const trainer = Trainer.create({
                name: Lorem.words(2),
                password: Lorem.word(),
                salary: randomNum(5000, 50000, 1000),
                startTime: randomNum(5, 23, 1) * 10000 + randomNum(0, 59, 1) * 100 + randomNum(0, 59, 1),
                endTime: randomNum(5, 23, 1) * 10000 + randomNum(0, 59, 1) * 100 + randomNum(0, 59, 1),
                experience: randomNum(0, 10, 1)
            })
            promises.push(trainer);
        }
        for (var i = 0; i < numCustomers; i++) {
            const customer = Customer.create({
                name: Lorem.words(2),
                password: Lorem.word(),
                age: randomNum(12, 60, 1),
                height: randomNum(140, 195, 2),
                weight: randomNum(40, 120, 2),
                fees: randomNum(500, 2500, 100),
                joinDate: Date.now() - randomNum(1, 30, 1) * 24 * 60 * 60 * 1000,
                experience: randomNum(0, 10, 1)
            })
            promises.push(customer);
        }
        for (var i = 0; i < numBranches; i++) {
            const branch = Branch.create({
                name: Lorem.word(),
                pincode: randomNum(10000, 90000, 18),
                address: Lorem.words(3),
                phoneNo: randomNum(20000000, 48000000, 12),
                managerName: Lorem.words(2),
                password: Lorem.word()
            })
            promises.push(branch);
        }
        for (var i = 0; i < numEquips; i++) {
            const x = i;
            const equip = Equipment.create({
                name: Lorem.word() + " " + x,
                category: Lorem.word(),
                price: randomNum(2000, 30000, 500)
            })
            promises.push(equip);
        }
        await Promise.all(promises);

    } catch (err) {
        console.error("Error adding data to database: ", err);
    }
}


(async () => {
    try{
        await clearDb();
        await createRandomData(5,5,5,5);
        await db.close();
    }catch(err){
        console.error(err);
    }
})();