 define([
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups",
  "./group",
  "./_carousel/indicators",
  "./_carousel/mode-slide",
  "./_carousel/mode-rotate",
  "./_carousel/mode-coverflow"
],function(langx,browser,eventer,$,elmx,plugins,groups,Group,Indicators,ModeSlide,ModeRotate,ModeCoverflow){
  'use strict'

 
  var Carousel = Group.inherit({
    klassName : "Carousel",

    pluginName : "lark.groups.carousel",

        options : {
            classes : {
             // The class to add when the carousel is visible:
              display: 'display',
              // The class to add when the carousel only displays one item:
              single: 'single',
              // The class to add when the left edge has been reached:
              leftEdge: 'left',
              // The class to add when the right edge has been reached:
              rightEdge: 'right',
              // The class to add when the automatic slideshow is active:
              cycling: 'cycling',

              // The class to add when the carousel controls are visible:
              controls: 'controls',
            },

            cycle : {
              // [milliseconds]
              // If a positive number, Carousel will automatically advance to next item after that number of milliseconds
              interval: 5000,

              pause: 'hover',
            },

            loop : true,

            wrap: true,
            keyboard: true,

            controls : {
              selectors : {
               // The class for the "toggle" control:
                toggle: '.toggle',
                // The class for the "prev" control:
                prev: '.prev',
                // The class for the "next" control:
                next: '.next',
                // The class for the "close" control:
                close: '.close',
                // The class for the "play-pause" toggle control:
                cycleStop: '.cycle-stop'
              }
            },

            indicators : {
                indicator : {
                  template : "<li/>",
                  indexAttrName : "data-index"
                },

            },

            selectors :{
              itemsContainer : ".items",
              indicatorsContainer : ".indicators"
            },

            item : {
              selector : ".item",
              classes : {
                base : "item"
              }
            },

            data : {
              //items : ".carousel-item",  // the items are from dom elements
              //items : [{                 // the items are from json object
              //  type: 'image',href : "https://xxx.com/1.jpg",title : "1"
              //},{
              //  type: 'image',href : "https://xxx.com/1.jpg",title : "1"
              // }],
            },

            mode : "slide",

            //start : "center", //ex:0

            modes : {
              slide : {
                classes : {
                  base : "slide"
                }
              },

              rotate : {
                classes : {
                  base : "rotate",
                  threedContainer : "items-container"
                },
                radius : 240
              },

              coverflow : {
                classes : {
                  base : "coverflow",
                  itemPast : "past",
                  itemFuture : "future",
                  itemCurrent : "current",
                  itemContent : "content"
                },
                spacing :-0.6
              }
            },

            onjumped : null,
            onjumping : null
        },

        _construct: function(elm, options) {
            //this.options = options
            Group.prototype._construct.call(this,elm,options);

            this.options.item.selectable = true;
            this.options.item.multiSelect = false;


            this._$elm = this.$();
            this._$itemsContainer = this._$elm.find(this.options.selectors.itemsContainer);
            
            let $indicators = this._$elm.find(this.options.selectors.indicatorsContainer); 
            if ($indicators.length>0) {
              this._indicators = new Indicators($indicators[0],langx.mixin({
                carousel : this,
                active : 0
              },this.options.indicators));
              this._indicators.setActiveIndicator(0);
            }

            this.paused = null;
            this.moving = null;
            this.interval = null;
            this.$active = null;

            if (this.options.cycle.interval >0) {
              this.cycle(true);
            } else {
              this.cycle(false);
            }

            var self = this;
            this.options.keyboard && this._$elm.on('keydown.lark.carousel', langx.proxy(this.keydown, this))

            this.options.cycle.pause == 'hover' && !('ontouchstart' in document.documentElement) && this._$elm
                .on('mouseenter.lark.carousel', (e) => {
                  this.pause(true);
                }).on('mouseleave.lark.carousel', (e) => {
                  this.pause(false)
                });

            this._$elm.find(this.options.controls.selectors.prev).on("click",(e)=>{
                this.prev();
                eventer.stop(e);
            });

            this._$elm.find(this.options.controls.selectors.next).on("click",(e)=>{
                this.next();
                eventer.stop(e);
            });

            this._$elm.find(this.options.controls.selectors.cycleStop).on("click",(e)=>{
                this.cycle(!this.cycled);
                eventer.stop(e);
            });


            if (this.options.data.items) {
                this.addItems(this.options.data.items);
            }
            
            this._mode = new modes[this.options.mode](this);


            let startIndex = this.options.start;
            if (startIndex !== undefined) {
              if (startIndex === 'center' ) {
                startIndex = Math.floor(this.getItemsCount() / 2)
              } 

              this.jump(startIndex)              
            }

            if (this.options.onjumped) {
              this.on("jumped",this.options.onjumped)
            }

            if (this.options.onjumping) {
              this.on("jumping",this.options.onjumping)
            }
        },

        changeMode : function(mode) {
          if (mode == this.options.mode) {
            return;
          }

          this.options.mode = mode;

          if (this._mode && this._mode.dispose) {
            this._mode.dispose();
          }
          this._mode = null;
          this.clearItems();

          this.$().removeClass("slide rotate coverflow").addClass(this.options.modes[mode].classes.base);
          this.$items

          this.addItems(this.options.data.items);

          this._mode = new modes[this.options.mode](this);

          let startIndex = this.options.start;
          if (startIndex !== undefined) {
            if (startIndex === 'center' ) {
              startIndex = Math.floor(this.getItemsCount() / 2)
            } 
            this.jump(startIndex)              
          }
        },

        keydown : function(e) {
            if (/input|textarea/i.test(e.target.tagName)) return
            switch (e.which) {
                case 37:
                    this.prev();
                    break
                case 39:
                    this.next();
                    break
                default:
                    return
            }

            e.preventDefault()
        },


        /*
         * Cycles through the carousel items from left to right.
         */
        cycle : function(cycling) {
            if (langx.isDefined(cycling)) {
              this.cycled = !!cycling;
             ///  e || (this.paused = false)
              if (this.cycled) {
                 this._velm.addClass(this.options.classes.cycling)
              } else {
                 this._velm.removeClass(this.options.classes.cycling)
              }
            } 

            if (this.interval){
              clearInterval(this.interval);
            }

            if (this.options.cycle.interval && this.cycled && !this.paused ) {
                this.interval = setInterval(langx.proxy(this.next, this), this.options.cycle.interval);
            }

            return this;
        },


        getItemForDirection : function(direction, active) {
            var activeIndex = this.getItemIndex(active)
            var willWrap = (direction == 'prev' && activeIndex === 0) ||
                (direction == 'next' && activeIndex == (this._$items.length - 1))
            if (willWrap && !this.options.wrap) return active
            var delta = direction == 'prev' ? -1 : 1
            var itemIndex = (activeIndex + delta) % this._$items.length
            return this._$items.eq(itemIndex);
        },

        setActiveItem : function(toIndex) {
            Group.prototype.setActiveItem.call(this,toIndex);

            if (this._indicators) {
              this._indicators.setActiveIndicator(toIndex);
            }  
        },

        jump : function (to) {
          if (this.jumping) {
            return
          }

          let itemsCount = this.getItemsCount();
          if (itemsCount<=1) {
            return;
          } 

          let currentItem = this.getActiveItem(),
              currentIndex = currentItem ? this.getItemIndex(currentItem) : -1,
              toItem,
              toIndex,
              type;

          if (to === 'prev') {
              type = to;
              if (currentIndex > 0 ) { 
                toIndex = currentIndex -1; 
              } else if ( this.options.loop ) { 
                toIndex = itemsCount - 1; 
              }
          } else if (to === 'next') {
              type = to;
              if ( currentIndex < itemsCount - 1 ) { 
                toIndex = currentIndex + 1; 
              } else if ( this.options.loop ) { 
                toIndex = 0; 
              }
          } else if (typeof to === 'number') {
              toIndex = to;
          } else if ( typeof to == 'string') {
              toIndex = parseInt(to);
          } else if ( to !== undefined ) {
              // if object is sent, get its index
              toIndex = this.getItemIndex(to);
          }

          if (toIndex<0 || toIndex==currentIndex) {
            return;
          }

          if (!type) {
            type = toIndex > currentIndex ? 'next' : 'prev';
          }

          this.jumping =true;

          var jumpingEvent = eventer.create('jumping.lark.carousel', {
              toIndex,
              currentIndex,
              type
          });

          this.trigger(jumpingEvent);
          if (jumpingEvent.isDefaultPrevented()) {
            this.jumping =false;
            return;
          }

          this._mode.jump(toIndex,currentIndex,type,() => {
            //    $next.removeClass([type, direction].join(' ')).addClass('active')
            //    $active.removeClass(['active', direction].join(' '))
            this.setActiveItem(toIndex);

            var jumpedEvent = eventer.create('jumped.lark.carousel', { 
              toIndex,
              currentIndex,
              type
            });

            setTimeout(()=> {
              this.trigger(jumpedEvent)
            }, 0)


            this.jumping  = false;

          });

          return this;
        },

        /*
         *Cycles the carousel to a particular frame (0 based, similar to an array). Returns to the caller before the target item has been shown
        jump : function(pos) {
            var that = this;

            var activeItem = this.getActiveItem(),
                activeIndex = activeItem ? this.getItemIndex(activeItem) : -1;

            if (pos > (this._$items.length - 1) || pos < 0) return

            if (this.moving) return this._$elm.one('jumped.lark.carousel', function() { that.jump(pos) }) // yes, "slid"
            if (activeIndex == pos)  return this.pause().cycle()

            return this._mode.jump(pos > activeIndex ? 'next' : 'prev', this._$items.eq(pos))
        },
         */

        /*
         * Stops the carousel from cycling through items.
         */
        pause : function(pausing) {
            if (langx.isUndefined(pausing)) {
              pausing = true;
            }
            this.paused = !!pausing;

            ///e || (this.paused = true)

            ///if (this._$elm.find(this.options.controls.selectors.next + ","+ this.options.controls.selectors.prev).length) { //.next,.prev
                ///this._$elm.trigger(browser.support.transition.end)
                ///this.cycle(true)
            ///}

            ///this.interval = clearInterval(this.interval)
            this.cycle();

            return this
        },

        /*
         * Cycles to the next item. Returns to the caller before the next item has been shown
         */
        next : function() {
            return this.jump('next')
        },

        /*
         * Cycles to the previous item. Returns to the caller before the previous item has been shown.
         */
        prev : function() {
            return this.jump('prev')
        },

        resetItems : function() {
          Group.prototype.resetItems.call(this);

          if (this._mode && this._mode.resetItems) {
            this._mode.resetItems();
          }
        },

        addItems : function(items) {
            let index = this.getItemsCount();
            for (var i=0; i<items.length;i++) {
              this.addItem(index++,items[i]);
            }
            this.resetItems();
        },

        addItem : function(index,itemData) {
          let itemHtml = this.renderItemHtml(itemData),
              baseClass = this.options.item.classes.base;


          let $item = $(itemHtml);
          if (baseClass) {
            $item.addClass(baseClass);
          }

          if (this._$itemsContainer) {
            this._$itemsContainer.append($item);
          }
          if (this._indicators) {
            this._indicators.addIndicator(index,itemData);
          }
        },

        clearItems : function() {
          if (this._$itemsContainer) {
            this._$itemsContainer.attr("style","");
          }
          this._$items.remove();
          this._$items = $();

          if (this._indicators) {
            this._indicators.clearIndicators();
          }
        }
  });

  var modes = Carousel.modes = {
    "slide" : ModeSlide,
    "rotate" : ModeRotate,
    "coverflow" : ModeCoverflow
  };

  plugins.register(Carousel);

  return groups.Carousel = Carousel;	
});