$(() => {
    const $loginContainer = $(".login-container");
    const $signupContainer = $(".signup-container");
    const $loginBtn =$(".login-btn");
    const $signupBtn =$(".signup-btn");

    $signupBtn.click(()=>{
        $loginContainer.hide();
        $signupContainer.show();
    });

    $loginBtn.click(()=>{
        $signupContainer.hide();
        $loginContainer.show();
    });
});