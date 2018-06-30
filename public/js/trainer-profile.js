$(async () => {
    const user = await fetchUser();
    const trainer = await fetchTrainer(user.id);

    trainer.branch = trainer.branches.find(({ branch_trainer }) => branch_trainer.status == "APPROVED");

    const trainerHtml = getTrainerHtml(trainer);
    const $mainContainer = $(".main-container");
    $mainContainer.html(trainerHtml);
});


const fetchTrainer = (id) => {
    return $.get(`/api/trainers/${id}`);
};

const getTrainerHtml = (trainer) => {
    return `
        <div class="details__container">
            <div class="details__header">
                <img src="https://via.placeholder.com/400x400.jpg" alt="Trainer Image">
                <div class="name-container">
                    <h2>${trainer.name}</h2>
                    <h3><b>Trainer ID: </b>${trainer.id}</h3>
                </div>
            </div>

            <div class="details_content">
                <p>
                    <b>Start Time: </b>${trainer.startTime}
                    <button>Change</button>
                </p>
                <p>
                    <b>End Time: </b>${trainer.endTime}
                    <button>Change</button>
                </p>
                <p><b>Salary: </b>Rs. ${trainer.salary} / month</p>
                <p>
                    <b>Experience: </b>${trainer.experience} yrs.<br>
                </p>
            </div>
        </div>
        <div class="sidebar">
            ${getSidebarHtml(trainer)}
        </div>    
    `;
};

const getSidebarHtml = (trainer) => {
    return trainer.branch ? `
        <div class="branch__details">
            <h2>${trainer.branch.name}</h2>
            <p><b>Contact: </b>${trainer.branch.phoneNo}</p>   
        </div>
        <div class="customer__details">
            <h2>Customers</h2>
            <ul class="customers-list">
                ${trainer.customers.reduce((acc, customer) => {
                    return acc + `
                                <li class="customers-list__item">
                                    <p>${customer.name}</p>
                                    <p>${customer.preferredTime}</p>
                                </li>
                            `;
                }, "")}
            </ul>
        </div>
    `: `
        <div class="applications">
            <h2>Branch Applications</h2>
            <ul class="applications-list">
                ${trainer.branches.reduce((acc, branch) => {
                    return acc + `
                                <li class="applications-list__item">
                                    <p>${branch.name}</p>
                                    <p>${branch.branch_trainer.status}</p>
                                </li>
                            `;
                }, "")}
            </ul>
        </div>
    `;
};