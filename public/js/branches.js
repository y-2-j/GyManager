$(async () => {
    let branches = [];

    const $mainContainer = $(".main-container");
    $mainContainer.on("click", ".details__btn", (event) => {
        const branchId = $(event.target).closest("[data-id]").data("id");
        localStorage.setItem("branch", JSON.stringify(branches.find(branch => branch.id === branchId)));
        window.location = "/branch";
    });

    branches = await getBranches();
    for (const branch of branches) {
        $(".main-container").append(getBranchHtml(branch));
    }
});

const getBranches = () => {
    return $.get("/api/branches");
};

const getBranchHtml = (branch) => {
    return $(`
        <div data-id="${branch.id}" class="branch-container">
            <img src="/images/temp.jpg">
            <div class="details">
                <a href=""><h3 class="details__title">${branch.name}</h3></a>
                <h4 class="details__address">${branch.address}</h4>
                <p class="details__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Et fugiat eius laudantium consectetur distinctio! Quis sequi consequatur atque assumenda non, nihil laudantium, provident ratione, nesciunt facilis voluptas! Ad, facilis eaque.</p>
                <div class="details__contact">
                    <span class="manager">Manager: ${branch.owner}</span>
                    <span class="phone">Contact No: ${branch.phoneNo}</span>
                </div>
                <div class="details__btn-container">
                    <button class="details__btn btn btn-primary">See More >></button>
                </div>
            </div>
        </div>  
    `);
}