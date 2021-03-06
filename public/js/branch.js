$(async () => {
    const user = await fetchUser();

    const branch = JSON.parse(localStorage.getItem("branch"));
    $(".outer-container").append(getBranchHtml(branch));
    $(".page-heading__name").html(branch.name);


    const $applyBtnContainer = $(".apply-join-btn-container");
    const $applyBtn = $applyBtnContainer.find(".apply-btn");
    const $joinBtn = $applyBtnContainer.find(".join-btn");
    const $preferredTime = $applyBtnContainer.find(".preferred-time");

    if (user === null || user.branchId)
        $applyBtnContainer.hide();
    else if (user.type === "trainer") {
        const trainer = await $.get(`/api/trainers/${user.id}`);
        trainer.branch = trainer.branches.find(({ branch_trainer }) => branch_trainer.status == "APPROVED");
        if (!trainer.branch) {
            $joinBtn.hide();
            $preferredTime.hide();
            $applyBtn.show();
            $applyBtnContainer.show();
        }
    }
    else if (user.type === "customer") {
        const customer = await $.get(`/api/customers/${user.membershipNo}`);
        if (!customer.branch) {
            $applyBtn.hide();
            $preferredTime.show();
            $joinBtn.show();
            $applyBtnContainer.show();
        }
    }

    $applyBtn.click(() => {
        $.post(`/api/branches/${branch.id}/trainers/apply`)
            .then(data => {
                alert("Your application has been received");
            })
            .catch(err => {
                console.log(err);
            });
    });

    $joinBtn.click(async () => {
        try {
            const time = parseInt($preferredTime.val().slice(0, 2));
            const availability = await $.get(`/api/branches/${branch.id}/customers/availability`);
            if (!availability[time]) {
                alert("Branch not available at this time");
            }
            else {
                await $.post(`/api/branches/${branch.id}/customers/join`, {
                    preferredTime: time
                });
                alert("Branch joined successfully");
                window.location = "/profile";
            }
        } catch (err) {
            console.error(err);
            alert("Oops, something went wrong!");
        }

    });

    const $equipments = $('.equipments');
    const $equips = $('.equips__item');
    const $trainer = $('#trainer');
    const $customer = $('#customer');
    const $stats = $('.stats');
    $equipments.hover(() => {
        $equips.animate({ opacity: 1 }, 100);
    });

    const $statsTitle = $stats.find(".stats__title");
    $(window).scroll((event) => {
        if ($(window).scrollTop() + $(window).height() >= $statsTitle.position().top) {
            countUp(15, $trainer);
            countUp(84, $customer);
            $(window).off("scroll");
        }
    });

});


const getBranchHtml = (branch) => {
    return `
        <div class="side-bar">
            <h2 class="side-bar__title">${branch.name}</h2>
            <h4 class="side-bar__subtitle">${branch.address}</h4>
            <h5 class="side-bar__subtitle side-bar__pincode">${branch.pincode}</h5>
            <div class="side-bar__details">
                <p>Manager: ${branch.managerName}</p>
                <p>Contact No: ${branch.phoneNo}</p>
            </div>
        </div>
        <div class="main-content">
            <div class="main-content__description">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore quos vel beatae corrupti deleniti tempora ipsam dolores eum, quasi sit, delectus natus? Saepe dignissimos molestias consequuntur reprehenderit qui quod vero doloremque, voluptates dolore illo sint. Officia ea nesciunt maiores ut. Facere at quasi provident expedita? Animi ut quos tempore suscipit est esse inventore necessitatibus minima sint cupiditate nisi unde fuga itaque recusandae, aperiam veritatis eos error. Minima consectetur in explicabo quisquam omnis exercitationem obcaecati dolore illo tenetur aspernatur, similique accusamus modi rem adipisci commodi fugiat dolor saepe assumenda, excepturi distinctio? Doloribus consequatur minima quae reprehenderit, debitis saepe laborum ab blanditiis.
            </div>
            <h3 class="equipments__title">Equipments: </h3>
            <div class="equipments">
                <div class="equips">
                    <p class="equips__item">Dumbell</p>
                    <p class="equips__item">Barbell</p>
                    <p class="equips__item">Buttefly</p>
                    <p class="equips__item">Kettles</p>
                    <p class="equips__item">Cross wings</p>
                    <p class="equips__item">Cycles</p>
                    <p class="equips__item">Treadmill</p>                    
                    <p class="equips__item">Bench Press</p>                    
                    <p class="equips__item">Weight assisted chin-ups</p>                    
                </div>
            </div>
            <div class="stats">
                <h2 class="stats__title">Number of customers enrolled</h2>
                <span class="stats__number" id="customer">0</span>
            </div>
            <div class="stats">
                <h2 class="stats__title">Active Trainers</h2>
                <span class="stats__number" id="trainer">0</span>
            </div>
        </div>
    `;
}

const countUp = ((num, element) => {
    let i = 0;
    let x = setInterval(() => {
        i++;
        element.html(i);
        if (i == num)
            clearInterval(x);
    }, 2000 / num);
});