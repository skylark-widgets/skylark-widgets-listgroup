/**
 * skylark-domx-plugins-lists - The skylark list plugin library.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-plugins-lists/
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

define('skylark-domx-plugins-lists/lists',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("domx.plugins.lists",{});
});
 define('skylark-domx-plugins-lists/Group',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists"
],function(langx,$,elmx,plugins,lists){

    var Group = plugins.Plugin.inherit({
        klassName : "Group",

        pluginName : "domx.plugins.lists.group",

        options : {
        	multiSelect: false,

        	classes : {
          	active : "active"
        	},


        	selectors : {
          	item : "li",                   // ".list-group-item"

        	},

          item : {
            template : "<span><i class=\"glyphicon\"></i><a href=\"javascript: void(0);\"></a> </span>",
            checkable : false,
            selectors : {
              icon : " > span > i",
              text : " > span > a"
            }
          },

        	selected : 0
        },

        state : {
          selected : Object
        },

        _construct : function(elm,options) {
            this.overrided(elm,options);
            var self = this,
                velm = this._velm = elmx(this._elm),
                itemSelector = this.options.selectors.item;

            this._$items = velm.$(itemSelector);

            velm.on('click', itemSelector, function () {
                var veItem = elmx(this);

                if (!veItem.hasClass('disabled')) {
                  var value = veItem.data("value");
                  if (value === undefined) {
                    value = self._$items.index(this);
                  }
                  self.selected = value;
                }

                //veItem.blur();
                return false;
            });
            this.selected = this.options.selected;

        },

        _refresh : function(updates) {
          this.overrided(updates);
          var self  = this;

          function findItem(valueOrIdx) {
            var $item;
            if (langx.isNumber(valueOrIdx)) {
              $item = self._$items.eq(valueOrIdx);
            } else {
              $item = self._$items.filter('[data-value="' + valueOrIdx + '"]');
            }
            return $item;
          } 
                 
          function selectOneItem(valueOrIdx) {
            findItem(valueOrIdx).addClass(self.options.classes.active);
          }

          function unselectOneItem(valueOrIdx) {
            findItem(valueOrIdx).removeClass(self.options.classes.active);
          }

          if (updates["selected"]) {
            if (this.options.multiSelect) {
            } else {
              unselectOneItem(updates["selected"].oldValue);
              selectOneItem(updates["selected"].value);
            }

          }
        }

  });


  plugins.register(Group);

  return lists.Group = Group;

});




 define('skylark-domx-plugins-lists/multitier_list',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "skylark-domx-plugins-toggles/Collapsable",
  "./lists",
  "./Group"
],function(langx,$,elmx,plugins,Collapsable,lists,Group){

    var _MultitierList = Group.inherit({
        klassName : "_MultitierList",

        options : {
          multitier : {
            mode   : "",  // "tree" or "accordion" or "popover"
            levels : 2,
            selectors :  {
              children : "ul",  // "> .list-group"
              hasChildren : ":has(ul)",
              toggler : " > a"
            },
            classes : {
              collapsed : "",
              expanded : ""
            },

            multiExpand : true,
          }
        },

        state : {
          selected : Object
        },

        _construct : function(elm,options) {
            this.overrided(elm,options);
            var self = this,
                itemSelector = this.options.selectors.item;

            var multitierMode = this.options.multitier.mode,
                hasChildrenSelector = this.options.multitier.selectors.hasChildren,
                childrenSelector = this.options.multitier.selectors.children;           


              var multiExpand = self.options.multitier.multiExpand,
                  togglerSelector = self.options.multitier.selectors.toggler;

              this._$items.has(childrenSelector).find(togglerSelector).on("click" + "." + this.pluginName, function(e) {
                  e.preventDefault();

                  if (multiExpand) {
                      langx.scall($(this).closest(itemSelector).siblings().removeClass("active").children(childrenSelector+".in").plugin("domx.toggles.collapsable"),"hide");
                  }
                  $(this).closest(itemSelector).toggleClass("active").children(childrenSelector).plugin("domx.toggles.collapsable").toggle();
              });

             this._$items.filter(".active").has(childrenSelector).children(childrenSelector).addClass("collapse in");
             this._$items.not(".active").has(childrenSelector).children(childrenSelector).addClass("collapse");
        }

  });


  return lists._MultitierList = _MultitierList;

});




 define('skylark-domx-plugins-lists/foldable',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists",
  "./multitier_list"
],function(langx,$,elmx,plugins,lists,_MultitierList){

  var Foldable = _MultitierList.inherit({
    klassName : "Foldable",

    pluginName : "domx.plugins.lists.foldable"

  });

  plugins.register(Foldable);

  return lists.Foldable = Foldable;
});

 define('skylark-domx-plugins-lists/cascadable',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists",
  "./multitier_list"
],function(langx,$,elmx,plugins,lists,_MultitierList){


  var Cascadable = _MultitierList.inherit({
    klassName : "Cascadable",

    pluginName : "domx.plugins.lists.cascadable"
  });


  plugins.register(Cascadable);

  return lists.Cascadable = Cascadable;	
});
 define('skylark-domx-plugins-lists/group',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists"
],function(langx,$,elmx,plugins,lists){

    var Group = plugins.Plugin.inherit({
        klassName : "Group",

        pluginName : "domx.plugins.lists.group",

        options : {
        	multiSelect: false,

        	classes : {
          	active : "active"
        	},


        	selectors : {
          	item : "li",                   // ".list-group-item"

        	},

          item : {
            template : "<span><i class=\"glyphicon\"></i><a href=\"javascript: void(0);\"></a> </span>",
            checkable : false,
            selectors : {
              icon : " > span > i",
              text : " > span > a"
            }
          },

        	selected : 0
        },

        state : {
          selected : Object
        },

        _construct : function(elm,options) {
            this.overrided(elm,options);
            var self = this,
                velm = this._velm = elmx(this._elm),
                itemSelector = this.options.selectors.item;

            this._$items = velm.$(itemSelector);

            velm.on('click', itemSelector, function () {
                var veItem = elmx(this);

                if (!veItem.hasClass('disabled')) {
                  var value = veItem.data("value");
                  if (value === undefined) {
                    value = self._$items.index(this);
                  }
                  self.selected = value;
                }

                //veItem.blur();
                return false;
            });
            this.selected = this.options.selected;

        },

        _refresh : function(updates) {
          this.overrided(updates);
          var self  = this;

          function findItem(valueOrIdx) {
            var $item;
            if (langx.isNumber(valueOrIdx)) {
              $item = self._$items.eq(valueOrIdx);
            } else {
              $item = self._$items.filter('[data-value="' + valueOrIdx + '"]');
            }
            return $item;
          } 
                 
          function selectOneItem(valueOrIdx) {
            findItem(valueOrIdx).addClass(self.options.classes.active);
          }

          function unselectOneItem(valueOrIdx) {
            findItem(valueOrIdx).removeClass(self.options.classes.active);
          }

          if (updates["selected"]) {
            if (this.options.multiSelect) {
            } else {
              unselectOneItem(updates["selected"].oldValue);
              selectOneItem(updates["selected"].value);
            }

          }
        }

  });


  plugins.register(Group);

  return lists.Group = Group;

});




define('skylark-domx-plugins-lists/slidable',[
  'skylark-langx/langx',
  'skylark-domx-browser',
  'skylark-domx-noder',
  'skylark-domx-styler',
  'skylark-domx-eventer',
  'skylark-domx-query',
  'skylark-domx-plugins',
  "skylark-devices-points/touch",
  "./lists"
], function (langx,browser, noder, styler, eventer, $,plugins,touch,lists) {
  'use strict'
  var Slidable = plugins.Plugin.inherit({
    klassName: "Slidable",

    pluginName : "domx.plugins.lists.slidable",

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
      onopen: undefined,
      // Callback function executed when the Gallery has been initialized
      // and the initialization transition has been completed.
      // Is called with the gallery instance as "this" object:
      onopened: undefined,
      // Callback function executed on slide change.
      // Is called with the gallery instance as "this" object and the
      // current index and slide as arguments:
      onslide: undefined,
      // Callback function executed after the slide change transition.
      // Is called with the gallery instance as "this" object and the
      // current index and slide as arguments:
      onslideend: undefined,
      // Callback function executed on slide content load.
      // Is called with the gallery instance as "this" object and the
      // slide index and slide element as arguments:
      onslidecomplete: undefined,
      // Callback function executed when the Gallery is about to be closed.
      // Is called with the gallery instance as "this" object:
      onclose: undefined,
      // Callback function executed when the Gallery has been closed
      // and the closing transition has been completed.
      // Is called with the gallery instance as "this" object:
      onclosed: undefined
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
        this.timeout.stop();
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
        this.timeout.stop();
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

  return lists.Slidable = Slidable;
});
 define('skylark-domx-plugins-lists/tiler',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists",
  "./group"
],function(langx,$,elmx,plugins,lists,Group){


  var Tiler = Group.inherit({
    klassName : "Tiler",

    pluginName : "domx.plugins.lists.tiler",

    options: {
        alignment: 'left',
        infiniteScroll: false,
        itemRendered: null,
        noItemsHTML: 'no items found',
        selectable: false,
        viewClass: "repeater-tile",
        template : '<div class="clearfix repeater-tile" data-container="true" data-infinite="true" data-preserve="shallow"></div>',
        item : {
            template: '<div class="thumbnail"><img height="75" src="<%= href %>" width="65"><span><%= title %></span></div>'
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

  return lists.Tiler = Tiler;	
});
 define('skylark-domx-plugins-lists/tree',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins",
  "./lists",
  "./multitier_list"
],function(langx,$,elmx,plugins,lists,_MultitierList){


  var Cascade = _MultitierList.inherit({
    klassName : "Tree",

    pluginName : "domx.plugins.lists.tree"
  });


  plugins.register(Cascade);

  return lists.Cascade = Cascade;	
});
define('skylark-domx-plugins-lists/main',[
    "./lists",
    "./foldable",
    "./cascadable",
    "./group",
    "./slidable",
    "./tiler",
    "./tree"
], function(lists) {
    return lists;
});
define('skylark-domx-plugins-lists', ['skylark-domx-plugins-lists/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-lists.js.map
