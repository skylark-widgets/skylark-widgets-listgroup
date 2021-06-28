 define([
  "skylark-langx/langx",
  "skylark-langx-events",
  "skylark-domx-eventer"
],function(langx,events,eventer){
  'use strict'


  var EffectSlide = events.Emitter.inherit({


    _construct : function(carsouel) {
    	this.carsouel = carsouel;
    },

    jump : function(type, next) {
    	let carsouel = this.carsouel,
    		velm = carsouel.elmx(),
    		options = carsouel.options

        var $active =  carsouel.$(carsouel.getActiveItem()),
        	$next = next || carsouel.getItemForDirection(type, $active),
        	isCycling = carsouel.interval,
        	direction = type == 'next' ? 'left' : 'right';

        if ($next.hasClass('active')) {
        	return (carsouel.moving = false)
        }

        var relatedTarget = $next[0];

        var movingEvent = eventer.create('jumping.lark.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        });

        carsouel.trigger(movingEvent);
        if (movingEvent.isDefaultPrevented()) return

        carsouel.moving = true;

        isCycling && carsouel.pause();

        /*
        if (this._$indicators.length) {
            this._$indicators.find('.active').removeClass('active');
            var $nextIndicator = $(this._$indicators.children()[this.getItemIndex($next)]);
            $nextIndicator && $nextIndicator.addClass('active');
        }
        */
        if (carsouel._indicators) {
            carsouel._indicators.setActiveIndicator(carsouel.getItemIndex($next));
        }

        var movedEvent = eventer.create('jumped.lark.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"

        $next.addClass(type);
        $next.reflow(); // [0].offsetWidth; // force reflow
        $active.addClass(direction);
        $next.addClass(direction);
        $next
            .one('transitionEnd', function() {
                $next.removeClass([type, direction].join(' ')).addClass('active')
                $active.removeClass(['active', direction].join(' '))
                carsouel.moving = false
                setTimeout(function() {
                    carsouel.trigger(movedEvent)
                }, 0)
            })
            .emulateTransitionEnd();

        isCycling && carsouel.cycle();

        return this
    },


  });


  return EffectSlide;	
});