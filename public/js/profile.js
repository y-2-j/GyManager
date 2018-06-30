$(async () => {
    const user = await fetchUser();

    let html = null;
    if (user === null) {
        window.location = "/";
    }
    if (user.type == "customer") {
        const customer = await fetchCustomer(user.membershipNo);
        html = getCustomerHtml(customer);
    }
    else if (user.type == "trainer") {
        const trainer = await fetchTrainer(user.id);

        trainer.branch = trainer.branches.find(({ branch_trainer }) => branch_trainer.status == "APPROVED");
    
        html = getTrainerHtml(trainer);
    }
    
    const $mainContainer = $(".main-container");
    $mainContainer.html(html);
});

const fetchCustomer = (membershipNo) => {
    return $.get(`/api/customers/${membershipNo}`);
};

const getCustomerHtml = (customer) => {
    return `
        <div class="details__container">
            <div class="details__header">
                <img src="https://via.placeholder.com/400x400.jpg" alt="Customer Image">
                <div class="name-container">
                    <h2>${customer.name}</h2>
                    <h3><b>Membership No.: </b>${customer.membershipNo}</h3>
                </div>
            </div>

            <div class="details_content">
                <p>
                    <b>Preferred Time Slot: </b>${customer.preferredTime}
                    <button>Change</button>
                </p>
                <p><b>Fees: </b>Rs. ${customer.fees} / month</p>
                <p>
                    <b>Age: </b>${customer.age}<br>
                    <b>Weight: </b>${customer.weight} kg<br>
                    <b>Height: </b>${customer.height} cm
                </p>
                </div>
            </div>
            <div class="sidebar">
                <div class="branch__details">
                    <h2>${customer.branch.name}</h2>
                    <p><b>Member Since: </b>${customer.joinDate}</p>
                    <p><b>Membership Expiry: </b>${customer.expiryDate}</p>
                    <p><b>Contact: </b>${customer.branch.phoneNo}</p>   
                </div>
                <div class="trainer__details">
                    <h2>${customer.trainer.name}</h2>
                    <p>Contact: ${customer.phoneNo}</p>
                    <p><b>Timings: </b>${customer.trainer.startTime} - ${customer.trainer.endTime}</p>
            </div>
        </div>    
    `;
};


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
            ${getTrainerSidebarHtml(trainer)}
        </div>    
    `;
};

const getTrainerSidebarHtml = (trainer) => {
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