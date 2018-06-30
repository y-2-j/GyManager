$(async () => {
    const user = await fetchUser();
    const customer = await fetchCustomer(user.membershipNo);
    
    const customerHtml = getCustomerHtml(customer);
    const $mainContainer = $(".main-container");
    $mainContainer.html(customerHtml);
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