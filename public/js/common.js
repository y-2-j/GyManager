$(() => {
    const $menu = $(".menu");
    const $logoBtn = $(".logo-button");
    const $closeBtn = $(".menu__close-btn");

    $logoBtn.click(() => {
        $menu.show(200);
    });

    $closeBtn.click(() => {
        $menu.hide(200);
    });
});

// Fetch user from Database and display Menu
const fetchUser = async () => {
    const user = await $.get("/user") || null;
    
    // Not Logged In
    if (user === null) {
        $("#public-menu").show();
    }
    // Logged in as Customer
    else if (user.type === "customer") {
        $("#customer-menu").show();

    }
    // Logged in as Trainer
    else if (user.type === "trainer") {
        $("#trainer-menu").show();
    }

    return user;
};