 define([
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