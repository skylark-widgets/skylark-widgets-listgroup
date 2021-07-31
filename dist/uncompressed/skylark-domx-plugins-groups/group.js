 define([
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
                if (!veItem.hasClass('disabled')) {
                    let value = self.getItemValue(this);
                    self.setActiveItem(value);

                  if (self.options.item.selectable) {

                      if (self.options.item.multiSelect) {
                        self.toggleSelectOneItem(value);
                      } else {
                        self.clearSelectedItems();
                        self.selectOneItem(value);
                      }
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
          return $item[0];
        },

        getItems : function() {
          return this._$items;
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
          return $(this.findItem(valueOrIdx)).hasClass(this.options.item.classes.selected);
        },
                 
        selectOneItem : function (valueOrIdx) {
          $(this.findItem(valueOrIdx)).addClass(this.options.item.classes.selected);
        },

        unselectOneItem : function (valueOrIdx) {
          $(this.findItem(valueOrIdx)).removeClass(this.options.item.classes.selected);
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

        setActiveItem : function(valueOrIdx) {
          let current = this.getActiveItem(),
              next = this.findItem(valueOrIdx);
          if (next != current) {
            let activeClass = this.options.item.classes.active;
            $(current).removeClass(activeClass);
            $(next).addClass(activeClass);
          }
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



