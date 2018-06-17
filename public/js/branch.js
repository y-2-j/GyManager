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
    let displayed=false;
    $stats.mouseenter(()=>{
        if(!displayed){
            countUp(15, $trainer);
            countUp(84, $customer);
            displayed=true;
        }
    });

});

const sleep= ((milliseconds) => {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
});

const countUp = ((num, element)=>{  
    let i=0;
    let x=setInterval(()=>{
        i++;
        element.html(i);
        if(i==num)
            clearInterval(x);
    }, 20);
});