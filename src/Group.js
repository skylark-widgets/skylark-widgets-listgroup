 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups"
],function(langx,$,elmx,plugins,groups){

    var Group = plugins.Plugin.inherit({
        klassName : "Group",

        pluginName : "lark.groups.group",

        options : {
        	classes : {
        	},

        	selectors : {
          	item : "li",                   // ".list-group-item"
        	},

          item : {
            template : "<span><i class=\"glyphicon\"></i><a href=\"javascript: void(0);\"></a> </span>",

            selectable: true,
            multiSelect: false,

            classes : {
              selected : "active"
            },

            selectors : {
              icon : " > span > i",
              text : " > span > a"
            }
          },

        	selected : 0
        },

        selected : null,
 
        _construct : function(elm,options) {
            this.overrided(elm,options);
            var self = this,
                velm = this._velm = elmx(this._elm),
                itemSelector = this.options.selectors.item;

            this._$items = velm.$(itemSelector);

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

            if (this.options.item.multiSelect) {
              this.selected = [];
            } else {
              this.selected = null;
            }
            ///this.selected = this.options.selected;
        },
        
        findItem : function (valueOrIdx) {
          var $item;
          if (langx.isNumber(valueOrIdx)) {
            $item = this._$items.eq(valueOrIdx);
          } else {
            $item = this._$items.filter('[data-value="' + valueOrIdx + '"]');
          }
          return $item;
        },

        getItemValue : function(elm) {
          let $item = $(elm),
              value = $item.data("value");
          if (value === undefined) {
            value = this._$items.index($item[0]);
          }
          return value;
        },

        isSelected : function(valueOrIdx) {
          return this.findItem(valueOrIdx).hasClass(this.options.item.classes.selected);
        },
                 
        selectOneItem : function (valueOrIdx) {
          this.findItem(valueOrIdx).addClass(this.options.item.classes.selected);
        },

        unselectOneItem : function (valueOrIdx) {
            this.findItem(valueOrIdx).removeClass(this.options.item.classes.selected);
        },

        clearSelectedItems : function() {
          let selectedClass = this.options.item.classes.selected;
          this._$items.filter(`.${selectedClass}`).removeClass(selectedClass);
        },


        getSelectedItems : function() {
          return  this._$items.filter(`.${selectedClass}`).map( (el) => {
            return this.getItemValue(el);
          });
        },

        toggleSelectOneItem : function(valueOrIdx) {
          if (this.isSelected(valueOrIdx)) {
            this.unselectOneItem(valueOrIdx);
          } else {
            this.selectOneItem(valueOrIdx);
          }
        }

  });


  plugins.register(Group);

  return groups.Group = Group;

});



