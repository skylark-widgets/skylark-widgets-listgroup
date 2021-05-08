 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./lists",
  "./multitier_list"
],function(langx,$,elmx,plugins,lists,_MultitierList){


  var CoverFlow = _MultitierList.inherit({
    klassName : "CoverFlow",

    pluginName : "domx.plugins.lists.coverflow"
  });


  plugins.register(CoverFlow);

  return lists.CoverFlow = CoverFlow;	
});