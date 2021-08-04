 define([
  "skylark-langx/langx",
  "skylark-langx-events",
  "skylark-domx-query",
],function(langx,events,$){
  'use strict'


  var ModeCoverflow = events.Emitter.inherit({


    _construct : function(carsouel) {
    	this.carsouel = carsouel;

    	this._itemOffsets = [];
    	this._currentIndex = -1;

    	let classes = this.carsouel.options.modes.coverflow.classes;

        this._classRemover = new RegExp('\\b(' + classes.itemCurrent + '|' + classes.itemPast + '|' + classes.itemFuture + ')(.*?)(\\s|$)', 'g');
        this._whiteSpaceRemover = new RegExp('\\s\\s+', 'g');

    	this.resetItems();
    },


    resetItems : function () {
    	let classes = this.carsouel.options.modes.coverflow.classes,
    		$itemsContainer = this.carsouel._$itemsContainer,
    		$items = this.carsouel.getItems(),
    		spacing = this.carsouel.options.modes.coverflow.spacing;



        function noTransition() {
            $itemsContainer.css('transition', 'none');
            $items.css('transition', 'none');
        }

        function resetTransition() {
            $itemsContainer.css('transition', '');
            $items.css('transition', '');
        }

	    function calculateBiggestItemHeight() {
	        var biggestHeight = 0,
	            itemHeight;

	        $items.each(function() {
	            itemHeight = $(this).height();
	            if ( itemHeight > biggestHeight ) { biggestHeight = itemHeight; }
	        });
	        return biggestHeight;
	    }


        let skipTransition = true;
        if ( skipTransition ) { 
        	noTransition(); 
        }

         $items.each((i,item) => {
            let $item = $(item);

            $item.attr('class', function(i, c) {
                return c && c.replace(this._classRemover, '').replace(this._whiteSpaceRemover, ' ');
            });

            if ( !$item.children('.' + classes.itemContent ).length) {
                $item.wrapInner('<div class="' + classes.itemContent + '" />');
            }
            let width = $item.outerWidth();

            if ( spacing !== 0 ) {
               $item.css('margin-right', ( width * spacing ) + 'px');
             }
        });


        this._itemOffsets = [];
        let containerWidth = $itemsContainer.width();
        $itemsContainer.height(calculateBiggestItemHeight());
        ///$itemsContainer.height("300px");

        $items.each((i,item) => {
            let $item = $(item),
                width,
                left;
            width = $item.outerWidth();
            left = $item.position().left;
            this._itemOffsets[i] = -1 * ((left + (width / 2)) - (containerWidth / 2));

        });

        if ( skipTransition ) { 
        	setTimeout(resetTransition, 1); 
        }
    },

    center : function (currentIndex) {
    	if (currentIndex !== undefined) {
	        this._currentIndex = currentIndex;
    	} else {
    		currentIndex = this._currentIndex;
    	}
    	if (currentIndex>=0)  {
	        var classes = this.carsouel.options.modes.coverflow.classes,
	        	$itemsContainer = this.carsouel._$itemsContainer,
	        	$items =  this.carsouel.getItems(),
	        	total = $items.length;
	        var $item;
	        var newClass;
	        var zIndex;

	        $items.each((i,item) => {
	            $item = $(item);
	            newClass = ' ';

	            if (i === currentIndex)  {
	                newClass += classes.itemCurrent;
	                zIndex = (total + 1);
	            }
	            else if (i < currentIndex) {
	                newClass += classes.itemPast + ' ' +
	                    classes.itemPast + '-' + (currentIndex - i);
	                zIndex = total - (currentIndex - i);
	            } else  {
	                newClass += classes.itemFuture + ' ' +
	                    classes.itemFuture + '-' + (i - currentIndex);
	                
	                zIndex = total -  (i - currentIndex);
	            }

	            $item.css('z-index', zIndex )
	              .attr('class',(i, c) => {
	                return c && c.replace(this._classRemover, '').replace(this._whiteSpaceRemover,' ') + newClass;
	              });
	        });


	        $itemsContainer.css('transform', 'translateX(' + this._itemOffsets[currentIndex] + 'px)');
    	}
    },

    jump : function(toIndex,currentIndex,type,ended) {
        var $itemsContainer = this.carsouel._$itemsContainer;
        this.center(toIndex);
        $itemsContainer
            .one('transitionEnd', function() {
                ended();
            })
            .emulateTransitionEnd();

        return this;
    }

  });


  return ModeCoverflow;	
});