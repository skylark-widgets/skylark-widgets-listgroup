 define([
  "skylark-langx/langx",
  "skylark-langx-events",
  "skylark-domx-eventer",
  "skylark-domx-query",
  "skylark-domx-styler",
  "skylark-domx-plugins-interact/rotatable",
  "skylark-domx-plugins-interact/scalable"
],function(langx,events,eventer,$,styler,Rotatable,Scalable){
  'use strict'


  var ModeRotate = events.Emitter.inherit({

  	options : {

  	},


    _construct : function(carsouel) {
    	this.carsouel = carsouel;

    	this.reset();

        this._$threedContainer = carsouel.$(`.${carsouel.options.modes.rotate.classes.threedContainer}`)

    	this._rotatable = new Rotatable(this._$threedContainer[0],{
		      started : function() {
		          //playSpin(false);
		      },

		      stopped : function() {
		          //playSpin(true);
		      }
    	});

    	this._scalable = new Scalable(this._$threedContainer[0],{
    		radius : carsouel.options.modes.rotate.radius,
    		targets : carsouel.getItems()
    	});

    	this._start = 0;

    },

    reset : function(delayTime) {
    	let items = this.carsouel.getItems();
    	if (items) {
    		let itemsCount = this._itemsCount = items.length,
    			deltaDeg = this._deltaDeg = 360 / itemsCount;

		    for (var i = 0; i < itemsCount; i++) {
		    	styler.css(items[i],{
		    		transform : "rotateY(" + (i * deltaDeg) + "deg)"
		    	});
		    }    		
    	}


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

        let nextIndex = carsouel.getItemIndex($next);

        var relatedTarget = $next[0];

        var movingEvent = eventer.create('jumping.lark.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        });

        carsouel.trigger(movingEvent);
        if (movingEvent.isDefaultPrevented()) return

        carsouel.moving = true;

        ///isCycling && carsouel.pause();

        /*
        if (this._$indicators.length) {
            this._$indicators.find('.active').removeClass('active');
            var $nextIndicator = $(this._$indicators.children()[this.getItemIndex($next)]);
            $nextIndicator && $nextIndicator.addClass('active');
        }
        */
        if (carsouel._indicators) {
            carsouel._indicators.setActiveIndicator(nextIndex);
        }

        var movedEvent = eventer.create('jumped.lark.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"

        $next.addClass(type);
        $next.reflow(); // [0].offsetWidth; // force reflow
        $active.addClass(direction);
        $next.addClass(direction);

        let $itemsContainer = carsouel._$itemsContainer;

        $itemsContainer
            .one('transitionEnd', function() {
                $next.removeClass([type, direction].join(' ')).addClass('active')
                $active.removeClass(['active', direction].join(' '))
                carsouel.moving = false
                setTimeout(function() {
                    carsouel.trigger(movedEvent)
                }, 0)
            })
            .css("transform","rotateY(" + (nextIndex * this._deltaDeg) + "deg)")
            .emulateTransitionEnd();

        //isCycling && carsouel.cycle();

        return this
    }


  });


  return ModeRotate;	
});