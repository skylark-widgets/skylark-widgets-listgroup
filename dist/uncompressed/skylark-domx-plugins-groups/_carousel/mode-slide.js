 define([
  "skylark-langx/langx",
  "skylark-langx-events",
  "skylark-domx-eventer"
],function(langx,events,eventer){
  'use strict'


  var ModeSlide = events.Emitter.inherit({


    _construct : function(carsouel) {
    	this.carsouel = carsouel;
    },

    jump : function(toIndex,currentIndex,type,ended) {
    	let carsouel = this.carsouel,
    		velm = carsouel.elmx(),
    		options = carsouel.options,

            $active =  carsouel.$(carsouel.findItem(currentIndex)),
        	$next = carsouel.$(carsouel.findItem(toIndex)),
        	isCycling = carsouel.interval,
        	direction = type == 'next' ? 'left' : 'right';

        ///if ($next.hasClass('active')) {
        ///	return (carsouel.moving = false)
        ///}

        isCycling && carsouel.pause();

        /*
        if (this._$indicators.length) {
            this._$indicators.find('.active').removeClass('active');
            var $nextIndicator = $(this._$indicators.children()[this.getItemIndex($next)]);
            $nextIndicator && $nextIndicator.addClass('active');
        }
        */

        $next.addClass(type);
        $next.reflow(); // [0].offsetWidth; // force reflow
        $active.addClass(direction);
        $next.addClass(direction);
        $next
            .one('transitionEnd', function() {
                ///$next.removeClass([type, direction].join(' ')).addClass('active')
                ///$active.removeClass(['active', direction].join(' '))
                $next.removeClass([type, direction].join(' '));
                $active.removeClass(direction);
                ended();
            })
            .emulateTransitionEnd();

        isCycling && carsouel.cycle();

        return this
    }

  });


  return ModeSlide;	
});