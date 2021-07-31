define([
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
