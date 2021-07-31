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

      this.resetItems();

      this._$threedContainer = carsouel.$(`.${carsouel.options.modes.rotate.classes.threedContainer}`)

      this._rotatable = new Rotatable(this._$threedContainer[0],{
          starting : function(e) {
            return $(e.target).closest(carsouel.options.item.selector).length==0;
          },

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

    resetItems : function(delayTime) {
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

    jump : function(toIndex,currentIndex,type,ended) {
        let carsouel = this.carsouel,
            velm = carsouel.elmx(),
            options = carsouel.options,

            $active =  carsouel.$(carsouel.findItem(currentIndex)),
            $next = carsouel.$(carsouel.findItem(toIndex));

        $next.addClass(type);
        $next.reflow(); // [0].offsetWidth; // force reflow

        let $itemsContainer = carsouel._$itemsContainer;

        $itemsContainer
            .one('transitionEnd', function() {
                $next.removeClass(type);
                ended();
            })
            .css("transform","rotateY(" + (toIndex * this._deltaDeg) + "deg)")
            .emulateTransitionEnd();

        return this;
    }


  });


  return ModeRotate;  
});