$(()=>{
    const $equipments = $('.equipments');
    const $equips = $('.equips__item');
    const $trainer = $('#trainer');
    const $customer = $('#customer');  
    const $stats = $('.stats');  
    $equipments.hover(()=>{
        // $equipments.animate({opacity:0.5}, 100);
        $equips.animate({opacity:1}, 100);
    });
    
    const $statsTitle = $stats.find(".stats__title");
    $(window).scroll((event)=> {
        if ($(window).scrollTop() + $(window).height() >= $statsTitle.position().top){
            countUp(15, $trainer);
            countUp(84, $customer);
            $(window).off("scroll");
        }
    });

});

const countUp = ((num, element)=>{  
    let i=0;
    let x=setInterval(()=>{
        i++;
        element.html(i);
        if(i==num)
            clearInterval(x);
    }, 2000/num);
});