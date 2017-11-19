"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol==="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}return function(t,i,r){if(i)e(t.prototype,i);if(r)e(t,r);return t}}();// @preserve
/*\

title: $:/plugins/felixhayashi/tiddlymap/js/Adapter
type: application/javascript
module-type: library

@preserve

\*/
var _ViewAbstraction=require("$:/plugins/felixhayashi/tiddlymap/js/ViewAbstraction");var _ViewAbstraction2=_interopRequireDefault(_ViewAbstraction);var _EdgeType=require("$:/plugins/felixhayashi/tiddlymap/js/EdgeType");var _EdgeType2=_interopRequireDefault(_EdgeType);var _NodeType=require("$:/plugins/felixhayashi/tiddlymap/js/NodeType");var _NodeType2=_interopRequireDefault(_NodeType);var _utils=require("$:/plugins/felixhayashi/tiddlymap/js/utils");var _utils2=_interopRequireDefault(_utils);var _Edge=require("$:/plugins/felixhayashi/tiddlymap/js/Edge");var _Edge2=_interopRequireDefault(_Edge);var _vis=require("$:/plugins/felixhayashi/vis/vis.js");var _vis2=_interopRequireDefault(_vis);var _environment=require("$:/plugins/felixhayashi/tiddlymap/js/lib/environment");var env=_interopRequireWildcard(_environment);var _contrastcolour=require("$:/core/modules/macros/contrastcolour.js");function _interopRequireWildcard(e){if(e&&e.__esModule){return e}else{var t={};if(e!=null){for(var i in e){if(Object.prototype.hasOwnProperty.call(e,i))t[i]=e[i]}}t.default=e;return t}}function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _defineProperty(e,t,i){if(t in e){Object.defineProperty(e,t,{value:i,enumerable:true,configurable:true,writable:true})}else{e[t]=i}return e}function _classCallCheck(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}var Adapter=function(){function e(t,i){_classCallCheck(this,e);this.getTiddlerById=t.getTiddlerById.bind(t);this.getId=t.getIdByTiddler.bind(t);this.assignId=t.assignId.bind(t);this.edgeTypeSubscriberRegistry=i;this.indeces=$tm.indeces;this.wiki=$tw.wiki;this.visShapesWithTextInside=_utils2.default.getLookupTable(["ellipse","circle","database","box","text"])}_createClass(e,[{key:"deleteEdge",value:function e(t){return this._processEdge(t,"delete")}},{key:"insertEdge",value:function e(t){return this._processEdge(t,"insert")}},{key:"deleteEdges",value:function e(t){t=_utils2.default.convert(t,"array");for(var i=t.length;i--;){this.deleteEdge(t[i])}}},{key:"_processEdge",value:function e(t,i){$tm.logger("debug","Edge",i,t);var r=this.getTiddlerById(t.from);if(!r||!_utils2.default.tiddlerExists(r)){return}var a=_utils2.default.getTiddler(r);var s=this.indeces.allETy[t.type]||_EdgeType2.default.getInstance(t.type);var l=this.edgeTypeSubscriberRegistry.getAllForType(s);var n=i+"Edge";for(var o=l.length;o--;){l[o][n](a,t,s)}if(i==="insert"&&!s.exists()){s.save()}return t}},{key:"getAdjacencyList",value:function e(t){var i=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};$tm.start("Creating adjacency list");if(!i.edges){var r=_utils2.default.getMatches(env.selector.allPotentialNodes);i.edges=this.getEdgesForSet(r,i.toWL,i.typeWL)}var a=_utils2.default.groupByProperty(i.edges,t||"to");$tm.stop("Creating adjacency list");return a}},{key:"getNeighbours",value:function e(t){var i=this;var r=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};$tm.start("Get neighbours");var a=r.addProperties,s=r.toWL,l=r.typeWL,n=r.steps;var o=this.indeces.allETy;var d=_utils2.default.getArrayValuesAsHashmapKeys(t);var u=_ViewAbstraction2.default.exists(r.view)?new _ViewAbstraction2.default(r.view):null;var f=_utils2.default.makeHashMap();var g=_utils2.default.makeHashMap();var c=parseInt(n)>0?n:1;var v=r.direction||u&&u.getConfig("neighbourhood_directions");var y=!v||v==="both";var h=y||v==="in";var p=y||v==="out";var _=this.getAdjacencyList("to",r);var b=function e(t,r,s){f[t.id]=t;var l=i.getTiddlerById(t[r]);if(!d[l]){d[l]=true;var n=i.makeNode(l,a);if(n){g[n.id]=n;s.push(l)}}};var m=void 0;for(m=0;m<c&&t.length;m++){var w=[];for(var T=t.length;T--;){if(_utils2.default.isSystemOrDraft(t[T])){continue}var k=this.getEdges(t[T],s,l);for(var E in k){var N=o[k[E].type];if(y||p&&N.toArrow||h&&N.invertedArrow){b(k[E],"to",w)}}var A=_[this.getId(t[T])];if(!A){continue}for(var I=A.length;I--;){var x=o[A[I].type];if(y||h&&x.toArrow||p&&x.invertedArrow){b(A[I],"from",w)}}}t=w}var S={nodes:g,edges:f};$tm.logger("debug","Retrieved neighbourhood",S,"steps",m);$tm.stop("Get neighbours");return S}},{key:"getGraph",value:function e(){var t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},i=t.view,r=t.filter,a=t.edgeTypeWL,s=t.neighbourhoodScope;$tm.start("Assembling Graph");i=_ViewAbstraction2.default.exists(i)?new _ViewAbstraction2.default(i):null;var l=_utils2.default.getMatches(r||i&&i.getNodeFilter("compiled"));var n=parseInt(s||i&&i.getConfig("neighbourhood_scope"));var o=a||i&&i.getEdgeTypeFilter("whitelist");var d=_utils2.default.getArrayValuesAsHashmapKeys(l);var u={edges:this.getEdgesForSet(l,d,o),nodes:this.selectNodesByReferences(l,{view:i,outputType:"hashmap"})};if(n){var f=this.getNeighbours(l,{steps:n,view:i,typeWL:o,addProperties:{group:"tmap:neighbour"}});Object.assign(u.nodes,f.nodes);Object.assign(u.edges,f.edges);if(i&&i.isEnabled("show_inter_neighbour_edges")){var g=this.getTiddlersByIds(f.nodes);var c=_utils2.default.getArrayValuesAsHashmapKeys(g);Object.assign(u.edges,this.getEdgesForSet(g,c))}}removeObsoleteViewData(u.nodes,i);this.attachStylesToNodes(u.nodes,i);$tm.stop("Assembling Graph");$tm.logger("debug","Assembled graph:",u);return u}},{key:"getEdges",value:function e(t,i,r){var a=_utils2.default.getTiddler(t);if(!a||_utils2.default.isSystemOrDraft(a)){return}var s=this.indeces.allETy;var l=_utils2.default.makeHashMap();var n=this.edgeTypeSubscriberRegistry.getAll();for(var o=0,d=n.length;o<d;o++){Object.assign(l,n[o].loadEdges(a,i,r))}for(var u in l){var f=l[u];if(!f.from||!f.to){continue}var g=s[f.type]||_EdgeType2.default.getInstance(f.type);addStyleToEdge(l[u],g);l[u]=f}return l}},{key:"getEdgesForSet",value:function e(t,i,r){var a=_utils2.default.makeHashMap();for(var s=t.length;s--;){Object.assign(a,this.getEdges(t[s],i,r))}return a}},{key:"selectEdgesByType",value:function e(t){var i=_utils2.default.makeHashMap(_defineProperty({},_EdgeType2.default.getInstance(t).id,true));return this.getEdgesForSet(this.getAllPotentialNodes(),null,i)}},{key:"getAllPotentialNodes",value:function e(){return _utils2.default.getMatches($tm.selector.allPotentialNodes)}},{key:"_processEdgesWithType",value:function e(t,i){var r=i.action,a=i.newName;t=_EdgeType2.default.getInstance(t);$tm.logger("debug","Processing edges",t,r);var s=this.selectEdgesByType(t);if(r==="rename"){new _EdgeType2.default(a,t).save()}for(var l in s){this._processEdge(s[l],"delete");if(r==="rename"){s[l].type=a;this._processEdge(s[l],"insert")}}this.wiki.deleteTiddler(t.fullPath)}},{key:"selectNodesByReferences",value:function e(t){var i=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{},r=i.addProperties,a=i.outputType;var s=_utils2.default.makeHashMap();var l=Object.keys(t);for(var n=l.length;n--;){var o=this.makeNode(t[l[n]],r);if(o){s[o.id]=o}}return _utils2.default.convert(s,a)}},{key:"selectNodesByIds",value:function e(t,i){var r=this.getTiddlersByIds(t);return this.selectNodesByReferences(r,i)}},{key:"selectNodeById",value:function e(t,i){i=Object.assign({},i,{outputType:"hashmap"});var r=this.selectNodesByIds([t],i);return r[t]}},{key:"removeNodeType",value:function e(t){t=_NodeType2.default.getInstance(t);this.wiki.deleteTiddler(t.fullPath)}},{key:"makeNode",value:function e(t,i){var r=_utils2.default.getTiddler(t);if(!r||_utils2.default.isSystemOrDraft(r))return;var a=_utils2.default.merge({},i);a.id=this.assignId(r);var s=r.fields[$tm.field.nodeLabel];a.label=s&&$tm.field.nodeLabel!=="title"?this.wiki.renderText("text/plain","text/vnd-tiddlywiki",s):r.fields.title;return a}},{key:"getInheritedNodeStyles",value:function e(t){var i=this.getTiddlersByIds(t);var r={};var a=this.indeces.glNTy;for(var s=a.length;s--;){var l=a[s];var n=[];if(l.id==="tmap:neighbour"){for(var o in t){if(t[o].group==="tmap:neighbour"){n.push(this.getTiddlerById(o))}}}else{n=l.getInheritors(i)}for(var d=n.length;d--;){var u=n[d];var f=r[u]=r[u]||{};f.style=_utils2.default.merge(f.style||{},l.style);if(l["fa-icon"]){f["fa-icon"]=l["fa-icon"]}else if(l["tw-icon"]){f["tw-icon"]=l["tw-icon"]}}}return r}},{key:"attachStylesToNodes",value:function e(t,i){i=_ViewAbstraction2.default.exists(i)?new _ViewAbstraction2.default(i):null;var r=this.getInheritedNodeStyles(t);var a=i?i.getNodeData():_utils2.default.makeHashMap();var s=i&&!i.isEnabled("physics_mode");for(var l in t){var n=this.getTiddlerById(l);var o=this.wiki.getTiddler(n);var d=o.fields;var u=t[l];var f=void 0;var g=r[n];if(g){_utils2.default.merge(u,g.style);f=getIcon(g["fa-icon"],g["tw-icon"])}if(d.color){u.color=d.color}if(d["tmap.style"]){_utils2.default.merge(u,_utils2.default.parseJSON(d["tmap.style"]))}f=getIcon(d["tmap.fa-icon"],d["icon"])||f;var c=a[l];if(c){_utils2.default.merge(u,c);if(s){u.fixed={x:u.x!=null,y:u.y!=null}}f=getIcon(c["fa-icon"],c["tw-icon"])||f}var v=u.color!==null&&_typeof(u.color)==="object";var y=v?u.color.background:u.color;u.color={background:y,border:v?u.color.border:undefined};addNodeIcon(u,f);u.font=u.font||{};if(u.shape&&!this.visShapesWithTextInside[u.shape]){u.font.color="black"}else if(!u.font.color&&y){u.font.color=(0,_contrastcolour.run)(y,y,"black","white")}if(u.shape==="icon"&&_typeof(u.icon)==="object"){u.icon.color=y}}if(i){var h=t[i.getConfig("central-topic")];if(h){_utils2.default.merge(h,this.indeces.glNTyById["tmap:central-topic"].style)}}}},{key:"deleteNode",value:function e(t){if(!t){return}var i=(typeof t==="undefined"?"undefined":_typeof(t))==="object"?t.id:t;var r=this.getTiddlerById(i);if(r){_utils2.default.deleteTiddlers([r])}var a=_utils2.default.getMatches(env.selector.allViews);for(var s=a.length;s--;){var l=new _ViewAbstraction2.default(a[s]);l.removeNode(i)}var n=this.getNeighbours([r]);this.deleteEdges(n.edges)}},{key:"deleteNodes",value:function e(t){for(var i=t.length;i--;){this.deleteNode(t[i])}}},{key:"insertNode",value:function e(){var t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var i=arguments[1];var r=arguments[2];t.label=this.wiki.generateNewTitle(t.label||_utils2.default.getRandomLabel());var a=new $tw.Tiddler({text:""},r,{title:t.label,"tmap.id":null},this.wiki.getModificationFields(),this.wiki.getCreationFields());this.wiki.addTiddler(a);t=this.makeNode(a,t);if(_ViewAbstraction2.default.exists(i)){new _ViewAbstraction2.default(i).addNode(t)}return t}},{key:"getTiddlersByIds",value:function e(t){if(Array.isArray(t)){t=_utils2.default.getArrayValuesAsHashmapKeys(t)}else if(t instanceof _vis2.default.DataSet){t=_utils2.default.getLookupTable(t,"id")}var i=[];for(var r in t){var a=this.getTiddlerById(r);if(a){i.push(a)}}return i}}]);return e}();var getFAdigits=function e(t){return t.length===4?t:t.substr(3,4)};var addNodeIcon=function e(t,i){if(!i){return}if(i.fa){t.shape="icon";t.icon={shape:"icon",face:"FontAwesome",color:t.color,code:String.fromCharCode("0x"+getFAdigits(i.fa))};if(t.size){t.icon.size=t.size}return}if(i.tw){var r=_utils2.default.getTiddler(i.tw);if(!r){return}if(r.fields["_canonical_uri"]){t.image=r.fields["_canonical_uri"];t.shape="image"}else if(r.fields.text){t.image=_utils2.default.getDataUri(r);t.shape="image"}}};var removeObsoleteViewData=function e(t,i){if(!_ViewAbstraction2.default.exists(i)||!t){return}i=new _ViewAbstraction2.default(i);var r=i.getNodeData();var a=0;for(var s in r){if(t[s]===undefined&&r[s]!=null){r[s]=undefined;a++}}if(a){$tm.logger("debug","[Cleanup]","Removed obsolete node data:",i.getLabel(),a);i.saveNodeData(r)}};var addStyleToEdge=function e(t,i){t=Object.assign(t,i.style);if(_utils2.default.isTrue(i["show-label"],true)){t.label=i.getLabel()}};var getIcon=function e(t,i){return t&&{fa:t}||i&&{tw:i}};exports.default=Adapter;
//# sourceMappingURL=./maps/felixhayashi/tiddlymap/js/services/Adapter.js.map