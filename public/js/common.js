$(() => {
    const $menu = $(".menu");
    const $logoBtn = $(".logo-button");
    const $closeBtn = $(".menu__close-btn");
    const $loginContainer = $(".login-container");
    const $signupContainer = $(".signup-container");
    const $loginBtn =$(".login-btn");
    const $signupBtn =$(".signup-btn");

    $logoBtn.click(() => {
        $menu.show(200);
    });

    $closeBtn.click(() => {
        $menu.hide(200);
    });

    $signupBtn.click(()=>{
        $loginContainer.hide(300);
        $signupContainer.show(300);
    });

    $loginBtn.click(()=>{
        $signupContainer.hide(300);
        $loginContainer.show(300);
    });
});