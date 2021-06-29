/**
 * skylark-domx-plugins-groups - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-groups/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-domx-plugins-groups/groups',[
	"skylark-langx/skylark"
],function(skylark){
  'use strict'
	return skylark.attach("domx.plugins.groups");
});
 define('skylark-domx-plugins-groups/group',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups"
],function(langx,$,elmx,plugins,groups){
  'use strict'

    /*
     * The base plugin class for grouping items.
     */
    var Group = plugins.Plugin.inherit({
        klassName : "Group",

        pluginName : "lark.groups.group",

        options : {
        	classes : {
        	},

        	selectors : {
            //container : "ul", // 
        	},

          item : {
            template : "<span><i class=\"glyphicon\"></i><a href=\"javascript: void(0);\"></a> </span>",
            selector : "li",      // ".list-group-item"

            selectable: false,
            multiSelect: false,

            classes : {
              base : "item",
              selected : "selected",
              active : "active"
            }
          },

          //active : 0,

          //A collection or function that is used to generate the content of the group 
          /*
           * example1
           *itemsSource : [{  
           *  type: 'image',href : "https://xxx.com/1.jpg",title : "1"
           *},{
           *  type: 'image',href : "https://xxx.com/1.jpg",title : "1"
           * }],
           */
          /*
           * example2
           *itemsSource :  function(){},
           */
        },

        selected : null,
 
        _construct : function(elm,options) {
            this.overrided(elm,options);
            var self = this,
                velm = this._velm = elmx(this._elm),
                itemSelector = this.options.item.selector;

            velm.on('click', itemSelector, function () {
                var veItem = elmx(this);

                if (self.options.item.selectable && !veItem.hasClass('disabled')) {
                    let value = self.getItemValue(this);
                    if (self.options.item.multiSelect) {
                      self.toggleSelectOneItem(value);
                    } else {
                      self.clearSelectedItems();
                      self.selectOneItem(value);
                    }
                }

                //veItem.blur();
                return false;
            });

            this.resetItems();

            ///if (this.options.item.multiSelect) {
            ///  this.selected = [];
            ///} else {
            ///  this.selected = null;
            ///}
            ///this.selected = this.options.selected;
        },

        resetItems : function() {
            this._$items = this._velm.$(this.options.item.selector);
        },

        findItem : function (valueOrIdx) {
          var $item;
          if (langx.isNumber(valueOrIdx)) {
            $item = this._$items.eq(valueOrIdx);
          } else if (langx.isString(valueOrIdx)) {
            $item = this._$items.filter('[data-value="' + valueOrIdx + '"]');
          } else {
            $item = $(valueOrIdx);
          }
          return $item;
        },

        getItemValue : function(item) {
          let $item = $(item),
              value = $item.data("value");
          if (value === undefined) {
            value = this._$items.index($item[0]);
          }
          return value;
        },

        getItemsCount : function() {
            return this._$items.size();
        },

        getItemIndex : function(item) {
            return this._$items.index(item);
        },

        
        isSelectedItem : function(valueOrIdx) {
          return this.findItem(valueOrIdx).hasClass(this.options.item.classes.selected);
        },
                 
        selectOneItem : function (valueOrIdx) {
          this.findItem(valueOrIdx).addClass(this.options.item.classes.selected);
        },

        unselectOneItem : function (valueOrIdx) {
            this.findItem(valueOrIdx).removeClass(this.options.item.classes.selected);
        },

        /*
         * clears the selected items.
         */
        clearSelectedItems : function() {
          let selectedClass = this.options.item.classes.selected;
          this._$items.filter(`.${selectedClass}`).removeClass(selectedClass);
        },

        getSelectedItemValues : function() {
          let selectedClass = this.options.item.classes.selected;
          return  this._$items.filter(`.${selectedClass}`).map( (el) => {
            return this.getItemValue(el);
          });
        },

        getSelectedItems : function() {
          let selectedClass = this.options.item.classes.selected;
          return  this._$items.filter(`.${selectedClass}`);
        },

        getActiveItem : function() {
          let activeClass = this.options.item.classes.active,
              $activeItem = this._$items.filter(`.${activeClass}`);
          return $activeItem[0] || null;
        },


        getSelectedItem : function() {
          let selectedItems = this.getSelectedItems();
          return selectedItems[0] || null;
        },

        toggleSelectOneItem : function(valueOrIdx) {
          if (this.isSelectedItem(valueOrIdx)) {
            this.unselectOneItem(valueOrIdx);
          } else {
            this.selectOneItem(valueOrIdx);
          }
        },

        renderItemHtml : function(itemData) {
          if (!this._renderItemHtml) {
            let itemTpl = this.options.item.template;
            if (langx.isString(itemTpl)) {
              this._renderItemHtml = langx.template(itemTpl);
            } else if (langx.isFunction(itemTpl)) {
              this._renderItemHtml = itemTpl;
            }
          }

          return this._renderItemHtml(itemData);
        }

  });


  plugins.register(Group);

  return groups.Group = Group;

});




 define('skylark-domx-plugins-groups/_carousel/indicators',[
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "../groups"
],function(langx,browser,eventer,$,elmx,plugins,groups){


  var Indicators = plugins.Plugin.inherit({
    klassName : "Indicators",

    pluginName : "lark.groups.carousel.indicators",


    options : {
      thumbnail : true,

      indicator : {
	      template : "<li/>",
	      indexAttrName : "data-index",
	      selector : "> li",
	      classes : {
	          active : "active"
	      }
      }
    },

    _construct: function(elm, options) {
    	plugins.Plugin.prototype._construct.call(this,elm,options);

      this._velm = this.elmx();
    	this.$indicators = this._velm.query(this.options.indicator.selector);

      this._velm.on("click", `[${this.options.indicator.indexAttrName}]`, (e) => {
          var $indicator = $(e.target),
              slideIndex = $indicator.attr(this.options.indicator.indexAttrName);

          this.options.carousel.jump(slideIndex);
          e.preventDefault();
      });
    },


    createIndicator: function (itemData) {
      if (!this._renderIndicatorHtml) {
        this._renderIndicatorHtml = langx.template(this.options.indicator.template);
      }

      /*
      var indicator = noder.createElement("li");
      var title = itemData.title;
      var thumbnailUrl
      var thumbnail
      if (this.options.thumbnail) {
        thumbnailUrl = itemData["thumbnail"]

        if (thumbnailUrl) {
          indicator.style.backgroundImage = 'url("' + thumbnailUrl + '")'
        }
      }
      if (title) {
        indicator.title = title;
      }
      */

      return $(this._renderIndicatorHtml(itemData))[0];
    },

    addIndicator: function (index,itemData) {
        var indicator = this.createIndicator(itemData)
        indicator.setAttribute('data-index', index)
        this._velm.append(indicator)
        this.$indicators = this.$indicators.add(indicator);
    },

    setActiveIndicator: function (index) {
      if (this.$indicators) {
        let activeIndicatorClass = this.options.indicator.classes.active;
        if (this.activeIndicator) {
          this.activeIndicator.removeClass(activeIndicatorClass)
        }
        this.activeIndicator = $(this.$indicators[index])
        this.activeIndicator.addClass(activeIndicatorClass)
      }
    }

  });

  return Indicators;
});
 define('skylark-domx-plugins-groups/_carousel/effect_slide',[
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
 define('skylark-domx-plugins-groups/carousel',[
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups",
  "./group",
  "./_carousel/indicators",
  "./_carousel/effect_slide"
],function(langx,browser,eventer,$,elmx,plugins,groups,Group,Indicators,EffectSlide){
  'use strict'

  var effects = {
    "slide" : EffectSlide
  };
 
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

              pause: 'hover'        
            },

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

            effect : "slide",

            startIndex : 0,

            effects : {
              slide : {
                classes : {
                  base : "slide"
                }
              },

              rotate : {
                classes : {
                  base : "rotate"
                }
              },

              coverflow : {
                classes : {
                  base : "coverflow"
                }
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

            this._effect = new effects[this.options.effect](this);

            if (this.options.data.items) {
                this.addItems(this.options.data.items);
                this.jump(this.options.startIndex)
            }

            if (this.options.onjumped) {
              this.on("jumped",this.options.onjumped)
            }

            if (this.options.onjumping) {
              this.on("jumping",this.options.onjumping)
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

        /*
         *Cycles the carousel to a particular frame (0 based, similar to an array). Returns to the caller before the target item has been shown
         */
        jump : function(pos) {
            var that = this;

            var activeItem = this.getActiveItem(),
                activeIndex = activeItem ? this.getItemIndex(activeItem) : -1;

            if (pos > (this._$items.length - 1) || pos < 0) return

            if (this.moving) return this._$elm.one('jumped.lark.carousel', function() { that.jump(pos) }) // yes, "slid"
            if (activeIndex == pos)  return this.pause().cycle()

            return this._effect.jump(pos > activeIndex ? 'next' : 'prev', this._$items.eq(pos))
        },

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
            if (this.moving) {
              return
            }
            return this._effect.jump('next')
        },

        /*
         * Cycles to the previous item. Returns to the caller before the previous item has been shown.
         */
        prev : function() {
           if (this.moving) return
            return this._effect.jump('prev')
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

        }
  });


  plugins.register(Carousel);

  return groups.Carousel = Carousel;	
});
 define('skylark-domx-plugins-groups/linear',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "skylark-domx-plugins-toggles/collapse",
  "./groups",
  "./group"
],function(langx,$,elmx,plugins,Collapse,groups,Group){
  'use strict'

  var Linear = Group.inherit({
    klassName : "Tiler",

    pluginName : "lark.groups.linear",

    options: {
       alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: false,

        template : '<ul class="clearfix repeater-linear" data-container="true" data-infinite="true" data-preserve="shallow"></ul>',
        item : {
            template: '<li class="repeater-item"><img  src="{{ThumbnailImage}}" class="thumb"/><h4 class="title">{{name}}</h4></div>',
            
        },

        viewClass: "repeater-linear",
        renderItem : null
    },

    _construct: function (elm, options) {
      this.overrided(elm, options);

      this._renderItem = langx.template(this.options.item.template);

      for (var i=0;i<options.items.length;i++) {
        var itemHtml = this._renderItem(options.items[i]);
        this._velm.append($(itemHtml));
      }
    }

  });

  plugins.register(Linear);

  return groups.Linear = Linear;

});




define('skylark-domx-plugins-groups/slidable',[
  'skylark-langx/langx',
  'skylark-domx-browser',
  'skylark-domx-noder',
  'skylark-domx-styler',
  'skylark-domx-eventer',
  'skylark-domx-query',
  "skylark-domx-plugins-base",
  "skylark-devices-points/touch",
  "./groups"
], function (langx,browser, noder, styler, eventer, $,plugins,touch,groups) {
  'use strict'
  var Slidable = plugins.Plugin.inherit({
    klassName: "Slidable",

    pluginName : "lark.groups.slidable",

    options: {
      selectors : {
        // The tag name, Id, element or querySelector of the slides container:
        slidesContainer: 'div',
        // The tag name, Id, element or querySelector of the title element:
        titleElement: 'h3',

        // The tag name, Id, element or querySelector of the indicator container:
        indicatorContainer: 'ol'
      },

      classes : {
        // The class to add when the gallery is visible:
        displayClass: 'lark-domx-slidable-display',
        // The class to add when the gallery only displays one element:
        singleClass: 'lark-domx-slidable-single',
        // The class to add when the left edge has been reached:
        leftEdgeClass: 'lark-domx-slidable-left',
        // The class to add when the right edge has been reached:
        rightEdgeClass: 'lark-domx-slidable-right',
        // The class to add when the automatic slideshow is active:
        playingClass: 'lark-domx-slidable-playing',

        // The class to add when the gallery controls are visible:
        controlsClass: 'lark-domx-slidable-controls',

        // The class for all slides:
        slideClass: 'slide',
        // The slide class for loading elements:
        slideLoadingClass: 'slide-loading',
        // The slide class for elements that failed to load:
        slideErrorClass: 'slide-error',
        // The class for the content element loaded into each slide:
        slideContentClass: 'slide-content',
        // The class for the "toggle" control:
        toggleClass: 'toggle',
        // The class for the "prev" control:
        prevClass: 'prev',
        // The class for the "next" control:
        nextClass: 'next',
        // The class for the "close" control:
        closeClass: 'close',
        // The class for the "play-pause" toggle control:
        playPauseClass: 'play-pause',

        // The class for the active indicator:
        activeIndicatorClass: 'active'
      },
      // The list object property (or data attribute) with the object type:
      //--- typeProperty: 'type',
      // The list object property (or data attribute) with the object title:
      //--- titleProperty: 'title',
      // The list object property (or data attribute) with the object alt text:
      //--- altTextProperty: 'alt',
      // The list object property (or data attribute) with the object URL:
      //--- urlProperty: 'href',
      // The list object property (or data attribute) with the object srcset URL(s):
      //--- srcsetProperty: 'urlset',
      // The gallery listens for transitionend events before triggering the
      // opened and closed events, unless the following option is set to false:
      displayTransition: true,
      // Defines if the gallery slides are cleared from the gallery modal,
      // or reused for the next gallery initialization:
      clearSlides: true,
      // Defines if images should be stretched to fill the available space,
      // while maintaining their aspect ratio (will only be enabled for browsers
      // supporting background-size="contain", which excludes IE < 9).
      // Set to "cover", to make images cover all available space (requires
      // support for background-size="cover", which excludes IE < 9):
      //--- stretchImages: false,
      // Toggle the controls on pressing the Return key:
      toggleControlsOnReturn: true,

      // Toggle the controls on slide click:
      toggleControlsOnSlideClick: true,

      // Toggle the automatic slideshow interval on pressing the Space key:
      toggleSlideshowOnSpace: true,

      // Navigate the gallery by pressing left and right on the keyboard:
      enableKeyboardNavigation: true,

      // Close the gallery on pressing the Esc key:
      closeOnEscape: false,

      // Close the gallery when clicking on an empty slide area:
      closeOnSlideClick: false,

      // Close the gallery by swiping up or down:
      closeOnSwipeUpOrDown: false,

      // Emulate touch events on mouse-pointer devices such as desktop browsers:
      emulateTouchEvents: true,

      // Stop touch events from bubbling up to ancestor elements of the Gallery:
      stopTouchEventsPropagation: false,

      // Hide the page scrollbars:
      hidePageScrollbars: false,

      // Stops any touches on the container from scrolling the page:
      disableScroll: true,

      // Carousel mode (shortcut for carousel specific options):
      carousel: false,

      // Allow continuous navigation, moving from last to first
      // and from first to last slide:
      continuous: true,

      // Remove elements outside of the preload range from the DOM:
      unloadElements: true,

      // Start with the automatic slideshow:
      startSlideshow: false,

      // Delay in milliseconds between slides for the automatic slideshow:
      slideshowInterval: 5000,

      // The starting index as integer.
      // Can also be an object of the given list,
      // or an equal object with the same url property:
      index: 0,
      // The number of elements to load around the current index:
      preloadRange: 2,
      // The transition speed between slide changes in milliseconds:
      transitionSpeed: 400,
      // The transition speed for automatic slide changes, set to an integer
      // greater 0 to override the default transition speed:
      slideshowTransitionSpeed: undefined,


        // Hide the page scrollbars:
      hidePageScrollbars: false,



      // Defines if the gallery indicators should display a thumbnail:
      thumbnailIndicators: true,


      // Callback function executed when the Gallery is initialized.
      // Is called with the gallery instance as "this" object:
      onopen: langx.noop,
      // Callback function executed when the Gallery has been initialized
      // and the initialization transition has been completed.
      // Is called with the gallery instance as "this" object:
      onopened: langx.noop,
      // Callback function executed on slide change.
      // Is called with the gallery instance as "this" object and the
      // current index and slide as arguments:
      onslide: langx.noop,
      // Callback function executed after the slide change transition.
      // Is called with the gallery instance as "this" object and the
      // current index and slide as arguments:
      onslideend: langx.noop,
      // Callback function executed on slide content load.
      // Is called with the gallery instance as "this" object and the
      // slide index and slide element as arguments:
      onslidecomplete: langx.noop,
      // Callback function executed when the Gallery is about to be closed.
      // Is called with the gallery instance as "this" object:
      onclose: langx.noop,
      // Callback function executed when the Gallery has been closed
      // and the closing transition has been completed.
      // Is called with the gallery instance as "this" object:
      onclosed: langx.noop
    },

    _construct: function (gallery, options) {
      this.overrided(gallery, options);
      this._velm = this.elmx();

      this.list = this.options.items;
      //this.options.container = this.elm();
      this.num = this.list.length;

      this.initStartIndex()
      if (this.initWidget() === false) {
        return false
      }
      this.initEventListeners()
      // Load the slide at the given index:
      this.onslide(this.index)
      // Manually trigger the slideend event for the initial slide:
      this.ontransitionend()
      // Start the automatic slideshow if applicable:
      if (this.options.startSlideshow) {
        this.play()
      }
    },

    createIndicator: function (obj) {
      var gallery = this.gallery,
        indicator = this.indicatorPrototype.cloneNode(false)
      var title = obj.title;
      var thumbnailUrl
      var thumbnail
      if (this.options.thumbnailIndicators) {
        thumbnailUrl = obj["thumbnail"]

        if (thumbnailUrl === undefined) {
          thumbnail = obj.getElementsByTagName && $(obj).find('img')[0]
          if (thumbnail) {
            thumbnailUrl = thumbnail.src
          }
        }
        if (thumbnailUrl) {
          indicator.style.backgroundImage = 'url("' + thumbnailUrl + '")'
        }
      }
      if (title) {
        indicator.title = title;
      }
      return indicator;
    },

    addIndicator: function (index) {
      if (this.indicatorContainer.length) {
        var indicator = this.createIndicator(this.list[index])
        indicator.setAttribute('data-index', index)
        this.indicatorContainer[0].appendChild(indicator)
        this.indicators.push(indicator)
      }
    },

    setActiveIndicator: function (index) {
      if (this.indicators) {
        if (this.activeIndicator) {
          this.activeIndicator.removeClass(this.options.classes.activeIndicatorClass)
        }
        this.activeIndicator = $(this.indicators[index])
        this.activeIndicator.addClass(this.options.classes.activeIndicatorClass)
      }
    },

    slide: function (to, speed) {
      window.clearTimeout(this.timeout)
      var index = this.index
      var direction
      var naturalDirection
      var diff
      if (index === to || this.num === 1) {
        return
      }
      if (!speed) {
        speed = this.options.transitionSpeed
      }
      if (!this.options.continuous) {
        to = this.circle(to)
      }
      // 1: backward, -1: forward:
      direction = Math.abs(index - to) / (index - to)
      // Get the actual position of the slide:
      if (this.options.continuous) {
        naturalDirection = direction
        direction = -this.positions[this.circle(to)] / this.slideWidth
        // If going forward but to < index, use to = slides.length + to
        // If going backward but to > index, use to = -slides.length + to
        if (direction !== naturalDirection) {
          to = -direction * this.num + to
        }
      }
      diff = Math.abs(index - to) - 1
      // Move all the slides between index and to in the right direction:
      while (diff) {
        diff -= 1
        this.move(
          this.circle((to > index ? to : index) - diff - 1),
          this.slideWidth * direction,
          0
        )
      }
      to = this.circle(to)
      this.move(index, this.slideWidth * direction, speed)
      this.move(to, 0, speed)
      if (this.options.continuous) {
        this.move(
          this.circle(to - direction),
          -(this.slideWidth * direction),
          0
        )
      }

      this.onslide(to)
    },

    getIndex: function () {
      return this.index
    },

    getNumber: function () {
      return this.num
    },

    prev: function () {
      if (this.options.continuous || this.index) {
        this.slide(this.index - 1)
      }
    },

    next: function () {
      if (this.options.continuous || this.index < this.num - 1) {
        this.slide(this.index + 1)
      }
    },

    play: function (time) {
      var that = this
      ///window.clearTimeout(this.timeout);
      if (this.timeout) {
        this.timeout.cancel();
        this.timeout = null;
      }
      this.interval = time || this.options.slideshowInterval
      if (this.elements[this.index] > 1) {
        this.timeout = langx.debounce(this.slide.bind(this),this.interval,true)(this.index + 1, this.options.slideshowTransitionSpeed);
      }
      this._velm.addClass(this.options.classes.playingClass)
    },

    pause: function () {
      //window.clearTimeout(this.timeout)
      if (this.timeout) {
        this.timeout.cancel();
        this.timeout = null;
      }
      this.interval = null
      //if (this.cancelAnimationFrame) {
      //  this.cancelAnimationFrame.call(window, this.animationFrameId)
      //  this.animationFrameId = null
      //}
      this._velm.removeClass(this.options.classes.playingClass)
    },

    add: function (list) {
      var i
      if (!list.concat) {
        // Make a real array out of the list to add:
        list = Array.prototype.slice.call(list)
      }
      if (!this.list.concat) {
        // Make a real array out of the Gallery list:
        this.list = Array.prototype.slice.call(this.list)
      }
      this.list = this.list.concat(list)
      this.num = this.list.length
      if (this.num > 2 && this.options.continuous === null) {
        this.options.continuous = true
        this._velm.removeClass(this.options.classes.leftEdgeClass)
      }
      this._velm
        .removeClass(this.options.classes.rightEdgeClass)
        .removeClass(this.options.classes.singleClass)
      for (i = this.num - list.length; i < this.num; i += 1) {
        this.addSlide(i)
        this.positionSlide(i)
      }
      this.positions.length = this.num
      this.initSlides(true)
    },

    resetSlides: function () {
      this.slidesContainer.empty();
      this.unloadAllSlides();
      this.slides = [];
      this.indicatorContainer.empty();
      this.indicators = [];

    },

    handleClose: function () {
      if (this.activeIndicator) {
        this.activeIndicator.removeClass(this.options.classes.activeIndicatorClass)
      }

      var options = this.options
      this.destroyEventListeners()
      // Cancel the slideshow:
      this.pause();
      this._velm.hide();
      this._velm.removeClass([options.displayClass,options.singleClass,options.leftEdgeClass,options.rightEdgeClass]);
      if (options.hidePageScrollbars) {
        document.body.style.overflow = this.bodyOverflowStyle
      }
      if (this.options.clearSlides) {
        this.resetSlides()
      }
      if (this.options.onclosed) {
        this.options.onclosed.call(this)
      }
    },

    close: function () {
      var that = this

      function closeHandler(event) {
        if (event.target === that._elm) {
          that._velm.off(browser.support.transition.end, closeHandler)
          that.handleClose()
        }
      }
      if (this.options.onclose) {
        this.options.onclose.call(this)
      }
      if (this.options.displayTransition) {
        this._velm.on(browser.support.transition.end, closeHandler)
        this._velm.removeClass(this.options.classes.displayClass)
      } else {
        this.handleClose()
      }
    },

    circle: function (index) {
      // Always return a number inside of the slides index range:
      return (this.num + index % this.num) % this.num
    },

    move: function (index, dist, speed) {
      this.translateX(index, dist, speed)
      this.positions[index] = dist
    },

    translate: function (index, x, y, speed) {
      var slide = this.slides[index];
      styler.css(slide,"transitionDuration",speed + "ms");
      styler.css(slide,"transform", 'translate(' + x + 'px, ' +  y +  'px)' +  ' translateZ(0)');

    },

    translateX: function (index, x, speed) {
      this.translate(index, x, 0, speed)
    },

    translateY: function (index, y, speed) {
      this.translate(index, 0, y, speed)
    },

    onresize: function () {
      this.initSlides(true)
    },

    onmousedown: function (event) {
      // Trigger on clicks of the left mouse button only
      // and exclude video & audio elements:
      if (
        event.which &&
        event.which === 1 &&
        event.target.nodeName !== 'VIDEO' &&
        event.target.nodeName !== 'AUDIO'
      ) {
        // Preventing the default mousedown action is required
        // to make touch emulation work with Firefox:
        event.preventDefault();
        (event.originalEvent || event).touches = [{
          pageX: event.pageX,
          pageY: event.pageY
        }]
        this.ontouchstart(event)
      }
    },

    onmousemove: function (event) {
      if (this.touchStart) {;
        (event.originalEvent || event).touches = [{
          pageX: event.pageX,
          pageY: event.pageY
        }]
        this.ontouchmove(event)
      }
    },

    onmouseup: function (event) {
      if (this.touchStart) {
        this.ontouchend(event)
        delete this.touchStart
      }
    },

    onmouseout: function (event) {
      if (this.touchStart) {
        var target = event.target
        var related = event.relatedTarget
        if (!related || (related !== target && !noder.contains(target, related))) {
          this.onmouseup(event)
        }
      }
    },

    ontouchstart: function (event) {
      if (this.options.stopTouchEventsPropagation) {
        eventer.stop(event)
      }
      // jQuery doesn't copy touch event properties by default,
      // so we have to access the originalEvent object:
      var touches = (event.originalEvent || event).touches[0]
      this.touchStart = {
        // Remember the initial touch coordinates:
        x: touches.pageX,
        y: touches.pageY,
        // Store the time to determine touch duration:
        time: Date.now()
      }
      // Helper variable to detect scroll movement:
      this.isScrolling = undefined
      // Reset delta values:
      this.touchDelta = {}
    },

    ontouchmove: function (event) {
      if (this.options.stopTouchEventsPropagation) {
        eventer.stop(event)
      }
      // jQuery doesn't copy touch event properties by default,
      // so we have to access the originalEvent object:
      var touches = (event.originalEvent || event).touches[0]
      var scale = (event.originalEvent || event).scale
      var index = this.index
      var touchDeltaX
      var indices
      // Ensure this is a one touch swipe and not, e.g. a pinch:
      if (touches.length > 1 || (scale && scale !== 1)) {
        return
      }
      if (this.options.disableScroll) {
        event.preventDefault()
      }
      // Measure change in x and y coordinates:
      this.touchDelta = {
        x: touches.pageX - this.touchStart.x,
        y: touches.pageY - this.touchStart.y
      }
      touchDeltaX = this.touchDelta.x
      // Detect if this is a vertical scroll movement (run only once per touch):
      if (this.isScrolling === undefined) {
        this.isScrolling =
          this.isScrolling ||
          Math.abs(touchDeltaX) < Math.abs(this.touchDelta.y)
      }
      if (!this.isScrolling) {
        // Always prevent horizontal scroll:
        event.preventDefault()
        // Stop the slideshow:
        window.clearTimeout(this.timeout)
        if (this.options.continuous) {
          indices = [this.circle(index + 1), index, this.circle(index - 1)]
        } else {
          // Increase resistance if first slide and sliding left
          // or last slide and sliding right:
          this.touchDelta.x = touchDeltaX =
            touchDeltaX /
            ((!index && touchDeltaX > 0) ||
              (index === this.num - 1 && touchDeltaX < 0) ?
              Math.abs(touchDeltaX) / this.slideWidth + 1 :
              1)
          indices = [index]
          if (index) {
            indices.push(index - 1)
          }
          if (index < this.num - 1) {
            indices.unshift(index + 1)
          }
        }
        while (indices.length) {
          index = indices.pop()
          this.translateX(index, touchDeltaX + this.positions[index], 0)
        }
      } else {
        this.translateY(index, this.touchDelta.y + this.positions[index], 0)
      }
    },

    ontouchend: function (event) {
      if (this.options.stopTouchEventsPropagation) {
        eventer.stop(event)
      }
      var index = this.index
      var speed = this.options.transitionSpeed
      var slideWidth = this.slideWidth
      var isShortDuration = Number(Date.now() - this.touchStart.time) < 250
      // Determine if slide attempt triggers next/prev slide:
      var isValidSlide =
        (isShortDuration && Math.abs(this.touchDelta.x) > 20) ||
        Math.abs(this.touchDelta.x) > slideWidth / 2
      // Determine if slide attempt is past start or end:
      var isPastBounds =
        (!index && this.touchDelta.x > 0) ||
        (index === this.num - 1 && this.touchDelta.x < 0)
      var isValidClose = !isValidSlide &&
        this.options.closeOnSwipeUpOrDown &&
        ((isShortDuration && Math.abs(this.touchDelta.y) > 20) ||
          Math.abs(this.touchDelta.y) > this.slideHeight / 2)
      var direction
      var indexForward
      var indexBackward
      var distanceForward
      var distanceBackward
      if (this.options.continuous) {
        isPastBounds = false
      }
      // Determine direction of swipe (true: right, false: left):
      direction = this.touchDelta.x < 0 ? -1 : 1
      if (!this.isScrolling) {
        if (isValidSlide && !isPastBounds) {
          indexForward = index + direction
          indexBackward = index - direction
          distanceForward = slideWidth * direction
          distanceBackward = -slideWidth * direction
          if (this.options.continuous) {
            this.move(this.circle(indexForward), distanceForward, 0)
            this.move(this.circle(index - 2 * direction), distanceBackward, 0)
          } else if (indexForward >= 0 && indexForward < this.num) {
            this.move(indexForward, distanceForward, 0)
          }
          this.move(index, this.positions[index] + distanceForward, speed)
          this.move(
            this.circle(indexBackward),
            this.positions[this.circle(indexBackward)] + distanceForward,
            speed
          )
          index = this.circle(indexBackward)
          this.onslide(index)
        } else {
          // Move back into position
          if (this.options.continuous) {
            this.move(this.circle(index - 1), -slideWidth, speed)
            this.move(index, 0, speed)
            this.move(this.circle(index + 1), slideWidth, speed)
          } else {
            if (index) {
              this.move(index - 1, -slideWidth, speed)
            }
            this.move(index, 0, speed)
            if (index < this.num - 1) {
              this.move(index + 1, slideWidth, speed)
            }
          }
        }
      } else {
        if (isValidClose) {
          this.close()
        } else {
          // Move back into position
          this.translateY(index, 0, speed)
        }
      }
    },

    ontouchcancel: function (event) {
      if (this.touchStart) {
        this.ontouchend(event)
        delete this.touchStart
      }
    },

    ontransitionend: function (event) {
      var slide = this.slides[this.index]
      if (!event || slide === event.target) {
        if (this.interval) {
          this.play()
        }
        ///this.setTimeout(this.options.onslideend, [this.index, slide])
        langx.defer(this.options.onslideend, [this.index, slide]);
      }
    },

    oncomplete: function (event) {
      var target = event.target || event.srcElement
      var parent = target && target.parentNode
      var index
      if (!target || !parent) {
        return
      }
      index = this.getNodeIndex(parent)
      $(parent).removeClass(this.options.classes.slideLoadingClass)
      if (event.type === 'error') {
        $(parent).addClass(this.options.classes.slideErrorClass)
        this.elements[index] = 3 // Fail
      } else {
        this.elements[index] = 2 // Done
      }
      // Fix for IE7's lack of support for percentage max-height:
      if (target.clientHeight > this._velm.clientHeight()) {
        target.style.maxHeight = this._velm.clientHeight()
      }
      if (this.interval && this.slides[this.index] === parent) {
        this.play()
      }
      ///this.setTimeout(this.options.onslidecomplete, [index, parent])
      langx.defer(this.options.onslidecomplete, [index, parent]);
    },

    onload: function (event) {
      this.oncomplete(event)
    },

    onerror: function (event) {
      this.oncomplete(event)
    },

    onkeydown: function (event) {
      switch (event.which || event.keyCode) {
        case 13: // Return
          if (this.options.toggleControlsOnReturn) {
            eventer.stop(event)
            this.toggleControls()
          }
          break
        case 27: // Esc
          if (this.options.closeOnEscape) {
            this.close()
            // prevent Esc from closing other things
            event.stopImmediatePropagation()
          }
          break
        case 32: // Space
          if (this.options.toggleSlideshowOnSpace) {
            eventer.stop(event)
            this.toggleSlideshow()
          }
          break
        case 37: // Left
          if (this.options.enableKeyboardNavigation) {
            eventer.stop(event)
            this.prev()
          }
          break
        case 39: // Right
          if (this.options.enableKeyboardNavigation) {
            eventer.stop(event)
            this.next()
          }
          break
      }
    },

    handleClick: function (event) {
      var options = this.options
      var target = event.target || event.srcElement
      var parent = target.parentNode

      if (parent === this.indicatorContainer[0]) {
        // Click on indicator element
        eventer.stop(event)
        this.slide(this.getNodeIndex(target));
        return;
      } else if (parent.parentNode === this.indicatorContainer[0]) {
        // Click on indicator child element
        this.preventDefault(event)
        this.slide(this.getNodeIndex(parent))
        return;
      }


      function isTarget(className) {
        return $(target).hasClass(className) || $(parent).hasClass(className)
      }
      if (isTarget(options.classes.toggleClass)) {
        // Click on "toggle" control
        eventer.stop(event)
        this.toggleControls()
      } else if (isTarget(options.classes.prevClass)) {
        // Click on "prev" control
        eventer.stop(event)
        this.prev()
      } else if (isTarget(options.classes.nextClass)) {
        // Click on "next" control
        eventer.stop(event)
        this.next()
      } else if (isTarget(options.classes.closeClass)) {
        // Click on "close" control
        eventer.stop(event)
        this.close()
      } else if (isTarget(options.classes.playPauseClass)) {
        // Click on "play-pause" control
        eventer.stop(event)
        this.toggleSlideshow()
      } else if (parent === this.slidesContainer[0]) {
        // Click on slide background
        if (options.closeOnSlideClick) {
          eventer.stop(event)
          this.close()
        } else if (options.toggleControlsOnSlideClick) {
          eventer.stop(event)
          this.toggleControls()
        }
      } else if (
        parent.parentNode &&
        parent.parentNode === this.slidesContainer[0]
      ) {
        // Click on displayed element
        if (options.toggleControlsOnSlideClick) {
          eventer.stop(event)
          this.toggleControls()
        }
      }
    },

    onclick: function (event) {
      if (
        this.options.emulateTouchEvents &&
        this.touchDelta &&
        (Math.abs(this.touchDelta.x) > 20 || Math.abs(this.touchDelta.y) > 20)
      ) {
        delete this.touchDelta
        return
      }
      return this.handleClick(event)
    },

    updateEdgeClasses: function (index) {
      if (!index) {
        this._velm.addClass(this.options.classes.leftEdgeClass)
      } else {
        this._velm.removeClass(this.options.classes.leftEdgeClass)
      }
      if (index === this.num - 1) {
        this._velm.addClass(this.options.classes.rightEdgeClass)
      } else {
        this._velm.removeClass(this.options.classes.rightEdgeClass)
      }
    },

    handleSlide: function (index) {
      if (!this.options.continuous) {
        this.updateEdgeClasses(index)
      }
      this.loadElements(index)
      if (this.options.unloadElements) {
        this.unloadElements(index)
      }
      this.setTitle(index);
      this.setActiveIndicator(index)
    },

    onslide: function (index) {
      this.index = index
      this.handleSlide(index)
      ///this.setTimeout(this.options.onslide, [index, this.slides[index]])
      langx.defer(this.options.onslide, [index, this.slides[index]]);
    },

    setTitle: function (index) {
      var firstChild = this.slides[index].firstChild
      var text = firstChild.title || firstChild.alt
      var titleElement = this.titleElement
      if (titleElement.length) {
        this.titleElement.empty()
        if (text) {
          titleElement[0].appendChild(document.createTextNode(text))
        }
      }
    },

    createElement: function (obj, callback) {
      var element = this.options.renderItem(obj, callback);
      $(element).addClass(this.options.classes.slideContentClass);
      return element;
    },

    loadElement: function (index) {
      if (!this.elements[index]) {
        if (this.slides[index].firstChild) {
          this.elements[index] = $(this.slides[index]).hasClass(
              this.options.classes.slideErrorClass
            ) ?
            3 :
            2
        } else {
          this.elements[index] = 1 // Loading
          $(this.slides[index]).addClass(this.options.classes.slideLoadingClass)
          this.slides[index].appendChild(
            this.createElement(this.list[index], this.proxyListener)
          )
        }
      }
    },

    loadElements: function (index) {
      var limit = Math.min(this.num, this.options.preloadRange * 2 + 1)
      var j = index
      var i
      for (i = 0; i < limit; i += 1) {
        // First load the current slide element (0),
        // then the next one (+1),
        // then the previous one (-2),
        // then the next after next (+2), etc.:
        j += i * (i % 2 === 0 ? -1 : 1)
        // Connect the ends of the list to load slide elements for
        // continuous navigation:
        j = this.circle(j)
        this.loadElement(j)
      }
    },

    unloadElements: function (index) {
      var i, diff
      for (i in this.elements) {
        if (this.elements.hasOwnProperty(i)) {
          diff = Math.abs(index - i)
          if (
            diff > this.options.preloadRange &&
            diff + this.options.preloadRange < this.num
          ) {
            this.unloadSlide(i)
            delete this.elements[i]
          }
        }
      }
    },

    addSlide: function (index) {
      var slide = this.slidePrototype.cloneNode(false)
      slide.setAttribute('data-index', index)
      this.slidesContainer[0].appendChild(slide)
      this.slides.push(slide);
      this.addIndicator(index)

    },

    positionSlide: function (index) {
      var slide = this.slides[index]
      styler.css(slide,{
         "width" : this.slideWidth + 'px' ,
         "left" : index * -this.slideWidth + 'px'
      });
      this.move(
        index,
        this.index > index ?
        -this.slideWidth :
        this.index < index ? this.slideWidth : 0,
        0
      )
    },

    initSlides: function (reload) {
      if (!reload) {
        this.indicatorContainer = this._velm.query(
          this.options.selectors.indicatorContainer
        )
        if (this.indicatorContainer.length) {
          this.indicatorPrototype = document.createElement('li')
          this.indicators = this.indicatorContainer[0].children
        }
      }

      var clearSlides, i
      if (!reload) {
        this.positions = []
        this.positions.length = this.num
        this.elements = {}
        this.imagePrototype = document.createElement('img')
        this.elementPrototype = document.createElement('div')
        this.slidePrototype = document.createElement('div')
        $(this.slidePrototype).addClass(this.options.classes.slideClass)
        this.slides = this.slidesContainer[0].children
        clearSlides =
          this.options.clearSlides || this.slides.length !== this.num
      }
      this.slideWidth = this._velm.clientWidth();
      this.slideHeight = this._velm.clientHeight();
      this.slidesContainer[0].style.width = this.num * this.slideWidth + 'px'
      if (clearSlides) {
        this.resetSlides()
      }
      for (i = 0; i < this.num; i += 1) {
        if (clearSlides) {
          this.addSlide(i)
        }
        this.positionSlide(i)
      }
      // Reposition the slides before and after the given index:
      if (this.options.continuous) {
        this.move(this.circle(this.index - 1), -this.slideWidth, 0)
        this.move(this.circle(this.index + 1), this.slideWidth, 0)
      }
    },

    unloadSlide: function (index) {
      var slide, firstChild
      slide = this.slides[index]
      firstChild = slide.firstChild
      if (firstChild !== null) {
        slide.removeChild(firstChild)
      }
    },

    unloadAllSlides: function () {
      var i, len
      for (i = 0, len = this.slides.length; i < len; i++) {
        this.unloadSlide(i)
      }
    },

    toggleControls: function () {

      var controlsClass = this.options.classes.controlsClass
      if (this._velm.hasClass(controlsClass)) {
        this._velm.removeClass(controlsClass)
      } else {
        this._velm.addClass(controlsClass)
      }
    },

    toggleSlideshow: function () {
      if (!this.interval) {
        this.play()
      } else {
        this.pause()
      }
    },

    getNodeIndex: function (element) {
      return parseInt(element.getAttribute('data-index'), 10)
    },

    initStartIndex: function () {
      var index = this.options.index;

      // Make sure the index is in the list range:
      this.index = this.circle(parseInt(index, 10) || 0)
    },

    initEventListeners: function () {
      var that = this
      var slidesContainer = this.slidesContainer

      function proxyListener(event) {
        var type =
          browser.support.transition.end === event.type ?
          'transitionend' :
          event.type
        that['on' + type](event)
      }
      $(window).on('resize', proxyListener)
      $(document.body).on('keydown', proxyListener)
      this._velm.on('click', proxyListener)
      if (touch.isTouchEnabled()) {
        slidesContainer.on(
          'touchstart touchmove touchend touchcancel',
          proxyListener
        )
      } else if (this.options.emulateTouchEvents) {
        slidesContainer.on(
          'mousedown mousemove mouseup mouseout',
          proxyListener
        )
      }

      slidesContainer.on(browser.support.transition.end, proxyListener)
      this.proxyListener = proxyListener
    },

    destroyEventListeners: function () {
      var slidesContainer = this.slidesContainer
      var proxyListener = this.proxyListener
      $(window).off('resize', proxyListener)
      $(document.body).off('keydown', proxyListener)
      this._velm.off('click', proxyListener)
      if (touch.isTouchEnabled()) {
        slidesContainer.off(
          'touchstart touchmove touchend touchcancel',
          proxyListener
        )
      } else if (this.options.emulateTouchEvents ) {
        slidesContainer.off(
          'mousedown mousemove mouseup mouseout',
          proxyListener
        )
      }
      slidesContainer.off(browser.support.transition.end, proxyListener)
    },

    handleOpen: function () {
      if (this.options.onopened) {
        this.options.onopened.call(this)
      }
    },

    initWidget: function () {
      var that = this

      function openHandler(event) {
        if (event.target === that._elm) {
          that._velm.off(browser.support.transition.end, openHandler)
          that.handleOpen()
        }
      }
      this.slidesContainer = this._velm
        .query(this.options.selectors.slidesContainer)
        .first()
      if (!this.slidesContainer.length) {

        return false
      }
      this.titleElement = this._velm.query(this.options.selectors.titleElement).first()
      if (this.num === 1) {
        this._velm.addClass(this.options.classes.singleClass)
      }
      if (this.options.onopen) {
        this.options.onopen.call(this)
      }
      if (this.options.displayTransition) {
        this._velm.on(browser.support.transition.end, openHandler)
      } else {
        this.handleOpen()
      }
      if (this.options.hidePageScrollbars) {
        // Hide the page scrollbars:
        this.bodyOverflowStyle = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
      this._velm.show();
      this.initSlides()
      this._velm.addClass(this.options.classes.displayClass)
    }
  });


  plugins.register(Slidable);

  return groups.Slidable = Slidable;
});
define('skylark-domx-plugins-dnd/draggable',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "./dnd",
    "./manager"
], function(langx, noder, datax, finder, geom, eventer, styler, plugins, dnd,manager) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;



    var Draggable = plugins.Plugin.inherit({
        klassName: "Draggable",
        
        pluginName : "lark.dnd.draggable",

        options : {
            draggingClass : "dragging"
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            var self = this,
                options = this.options;

            self.draggingClass = options.draggingClass;

            ["preparing", "started", "ended", "moving"].forEach(function(eventName) {
                if (langx.isFunction(options[eventName])) {
                    self.on(eventName, options[eventName]);
                }
            });


            eventer.on(elm, {
                "mousedown": function(e) {
                    var options = self.options;
                    if (options.handle) {
                        self.dragHandle = finder.closest(e.target, options.handle);
                        if (!self.dragHandle) {
                            return;
                        }
                    }
                    if (options.source) {
                        self.dragSource = finder.closest(e.target, options.source);
                    } else {
                        self.dragSource = self._elm;
                    }
                    manager.prepare(self);
                    if (self.dragSource) {
                        datax.attr(self.dragSource, "draggable", 'true');
                    }
                },

                "mouseup": function(e) {
                    if (self.dragSource) {
                        //datax.attr(self.dragSource, "draggable", 'false');
                        self.dragSource = null;
                        self.dragHandle = null;
                    }
                },

                "dragstart": function(e) {
                    datax.attr(self.dragSource, "draggable", 'false');
                    manager.start(self, e);
                },

                "dragend": function(e) {
                    eventer.stop(e);

                    if (!manager.dragging) {
                        return;
                    }

                    manager.end(false);
                }
            });

        }

    });

    plugins.register(Draggable,"draggable");

    return dnd.Draggable = Draggable;
});
define('skylark-domx-plugins-dnd/droppable',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "./dnd",
    "./manager"
], function(langx, noder, datax, finder, geom, eventer, styler, plugins, dnd,manager) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;


    var Droppable = plugins.Plugin.inherit({
        klassName: "Droppable",

        pluginName : "lark.dnd.droppable",

        options : {
            draggingClass : "dragging"
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            var self = this,
                options = self.options,
                draggingClass = options.draggingClass,
                hoverClass,
                activeClass,
                acceptable = true;

            ["started", "entered", "leaved", "dropped", "overing"].forEach(function(eventName) {
                if (langx.isFunction(options[eventName])) {
                    self.on(eventName, options[eventName]);
                }
            });

            eventer.on(elm, {
                "dragover": function(e) {
                    e.stopPropagation()

                    if (!acceptable) {
                        return
                    }

                    var e2 = eventer.create("overing", {
                        overElm: e.target,
                        transfer: manager.draggingTransfer,
                        acceptable: true
                    });
                    self.trigger(e2);

                    if (e2.acceptable) {
                        e.preventDefault() // allow drop

                        e.dataTransfer.dropEffect = "copyMove";
                    }

                },

                "dragenter": function(e) {
                    var options = self.options,
                        elm = self._elm;

                    var e2 = eventer.create("entered", {
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    e.stopPropagation()

                    if (hoverClass && acceptable) {
                        styler.addClass(elm, hoverClass)
                    }
                },

                "dragleave": function(e) {
                    var options = self.options,
                        elm = self._elm;
                    if (!acceptable) return false

                    var e2 = eventer.create("leaved", {
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    e.stopPropagation()

                    if (hoverClass && acceptable) {
                        styler.removeClass(elm, hoverClass);
                    }
                },

                "drop": function(e) {
                    var options = self.options,
                        elm = self._elm;

                    eventer.stop(e); // stops the browser from redirecting.

                    if (!manager.dragging) return

                    // manager.dragging.elm.removeClass('dragging');

                    if (hoverClass && acceptable) {
                        styler.addClass(elm, hoverClass)
                    }

                    var e2 = eventer.create("dropped", {
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    manager.end(true)
                }
            });

            manager.on("dndStarted", function(e) {
                var e2 = eventer.create("started", {
                    transfer: manager.draggingTransfer,
                    acceptable: false
                });

                self.trigger(e2);

                acceptable = e2.acceptable;
                hoverClass = e2.hoverClass;
                activeClass = e2.activeClass;

                if (activeClass && acceptable) {
                    styler.addClass(elm, activeClass);
                }

            }).on("dndEnded", function(e) {
                var e2 = eventer.create("ended", {
                    transfer: manager.draggingTransfer,
                    acceptable: false
                });

                self.trigger(e2);

                if (hoverClass && acceptable) {
                    styler.removeClass(elm, hoverClass);
                }
                if (activeClass && acceptable) {
                    styler.removeClass(elm, activeClass);
                }

                acceptable = false;
                activeClass = null;
                hoverClass = null;
            });

        }
    });

    plugins.register(Droppable,"droppable");

    return dnd.Droppable = Droppable;
});
define('skylark-domx-plugins-groups/sortable',[
    "./groups",
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-query",
    "skylark-domx-plugins-base",
    "skylark-domx-plugins-dnd/draggable",
    "skylark-domx-plugins-dnd/droppable"
],function(groups, langx,noder,datax,geom,eventer,styler,$,plugins,Draggable,Droppable){
   'use strict'

    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height,
        some = Array.prototype.some,
        map = Array.prototype.map;

    var Sorter = plugins.Plugin.inherit({
        "klassName" : "Sorter",

        enable : function() {

        },
        
        disable : function() {

        },

        destory : function() {

        }
    });


    var dragging, placeholders = $();


    var Sortable = plugins.Plugin.inherit({
        klassName: "Sortable",

        pluginName : "lark.groups.sortable",
        
        options : {
            connectWith: false,
            placeholder: null,
            placeholderClass: 'sortable-placeholder',
            draggingClass: 'sortable-dragging',
            items : null
        },

        /*
         * @param {HTMLElement} container  the element to use as a sortable container
         * @param {Object} options  options object
         * @param {String} [options.items = ""] 
         * @param {Object} [options.connectWith =] the selector to create connected groups
         * @param {Object} [options
         * @param {Object} [options
         */
        _construct : function (container,options) {
            this.overrided(container,options);

            options = this.options;

            var isHandle, index, 
                $container = $(container), 
                $items = $container.children(options.items);
            var placeholder = $(options.placeholder || noder.createElement(/^(ul|ol)$/i.test(container.tagName) ? 'li' : 'div',{
                "class" : options.placeholderClass
            }));

            Draggable(container,{
                source : options.items,
                handle : options.handle,
                draggingClass : options.draggingClass,
                preparing : function(e) {
                    //e.dragSource = e.handleElm;
                },
                started :function(e) {
                    e.ghost = e.dragSource;
                    e.transfer = {
                        "text": "dummy"
                    };
                    index = (dragging = $(e.dragSource)).index();
                },
                ended : function(e) {
                    if (!dragging) {
                        return;
                    }
                    dragging.show();
                    placeholders.detach();
                    if (index != dragging.index()) {
                        dragging.parent().trigger('sortupdate', {item: dragging});
                    }
                    dragging = null;                
                }

            });

            
            Droppable(container,{
                started: function(e) {
                    e.acceptable = true;
                    e.activeClass = "active";
                    e.hoverClass = "over";
                },
                overing : function(e) {
                    if ($items.is(e.overElm)) {
                        if (options.forcePlaceholderSize) {
                            placeholder.height(dragging.outerHeight());
                        }
                        dragging.hide();
                        $(e.overElm)[placeholder.index() < $(e.overElm).index() ? 'after' : 'before'](placeholder);
                        placeholders.not(placeholder).detach();
                    } else if (!placeholders.is(e.overElm) && !$(e.overElm).children(options.items).length) {
                        placeholders.detach();
                        $(e.overElm).append(placeholder);
                    }                
                },
                dropped : function(e) {
                    placeholders.filter(':visible').after(dragging);
                    dragging.show();
                    placeholders.detach();

                    dragging = null;                
                  }
            });

            $container.data('items', options.items)
            placeholders = placeholders.add(placeholder);
            if (options.connectWith) {
                $(options.connectWith).add(this).data('connectWith', options.connectWith);
            }
            
        }
    });

    plugins.register(Sortable,"sortable");

    return groups.Sortable = Sortable;
});

 define('skylark-domx-plugins-groups/tiler',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups",
  "./group"
],function(langx,$,elmx,plugins,groups,Group){
  'use strict'

  var Tiler = Group.inherit({
    klassName : "Tiler",

    pluginName : "lark.groups.tiler",

    options: {
        alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: false,
        viewClass: "repeater-tile",
        template : '<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>',
        item : {
            template: '<div class="thumbnail"><img height="75" src="<%= href %>" width="65"><span><%= title %></span></div>',
            selectable : true
        },
        renderItem : null
    },

    _construct: function (elm, options) {
      this.overrided(elm, options);

      this._renderItem = langx.template(this.options.item.template);

      for (var i=0;i<options.items.length;i++) {
        var itemHtml = this._renderItem(options.items[i]);
        this._velm.append($(itemHtml));
      }
    }

  });


  plugins.register(Tiler);

  return groups.Tiler = Tiler;	
});
 define('skylark-domx-plugins-groups/tree',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-lists",
  "skylark-domx-plugins-base",
  "./groups",
  "./group",
  "skylark-domx-plugins-toggles/collapse"
],function(langx,$,elmx,lists,plugins,groups,Group){
  'use strict'


  var Tree = Group.inherit({
    klassName : "Tree",

    pluginName : "lark.groups.tree",

    _construct : function(elm,options) {
        this.overrided(elm,options);

        lists.multitier(elm,langx.mixin({
          hide : function($el) {
            $el.plugin("lark.toggles.collapse").hide();
          },
          toggle : function($el) {
            $el.plugin("lark.toggles.collapse").toggle();
          }
        },this.options));
    }

  });


  plugins.register(Tree);

  return groups.Tree = Tree;	
});
define('skylark-domx-plugins-groups/main',[
    "./groups",
    "./group",
    "./carousel",
    "./linear",
    "./slidable",
    "./sortable",
    "./tiler",
    "./tree"
], function(groups) {
    return groups;
});
define('skylark-domx-plugins-groups', ['skylark-domx-plugins-groups/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-groups.js.map
