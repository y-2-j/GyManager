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