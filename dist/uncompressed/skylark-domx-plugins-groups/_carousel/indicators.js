 define([
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

    clearIndicators : function() {
       this.$indicators.remove();
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