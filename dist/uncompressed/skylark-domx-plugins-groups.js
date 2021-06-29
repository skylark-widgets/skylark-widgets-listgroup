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
    "./sortable",
    "./tiler",
    "./tree"
], function(groups) {
    return groups;
});
define('skylark-domx-plugins-groups', ['skylark-domx-plugins-groups/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-groups.js.map
