 define([
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-domx-plugins-base",
  "./groups",
  "./group"
],function(langx,$,elmx,plugins,groups,Group){


  var CoverFlow = Group.inherit({
    klassName : "CoverFlow",

    pluginName : "domx.plugins.groups.coverflow"
  });


  plugins.register(CoverFlow);

  return groups.CoverFlow = CoverFlow;	
});