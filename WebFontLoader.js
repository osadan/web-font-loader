/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.IClass = function(){};
 
  // Create a new Class that inherits from this class
  IClass.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function IClass() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    IClass.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    IClass.prototype.constructor = IClass;
 
    // And make this class extendable
    IClass.extend = arguments.callee;
   
    return IClass;
  };
})();

var SingleFont = IClass.extend({
	init : function (object) {
		if(!object.name || (object.type == "dynamic" && !object.path)){
			throw "font family and path is required";
		}
		this.name = object.name.replace(/\'/ig,"");
		this.path = object.path;
		this.weight = object.weight || "normal";
		this.style = object.style || "normal";
		this.classname = this.name.replace('+','').replace('.','_') + '_' + this.weight + '_' + this.style;
		this.status = false;
		this.type = object.type;
	},
	getFontStyle : function (){
		var template = "\n\
			@font-face{\
font-family: '" + this.name + "';\
font-weight: " + this.weight + ";\
src : url('" + this.path + ".eot');\
src:url ('" + this.path + ".eot#iefix') format('embedded-opentype'),\
	url('"+ this.path +".woff') format('woff'),\
	url('"+ this.path +".ttf')  format('truetype'),\
	url('" + this.path +".svg?77004486#" + this.name +"') format('svg');\
	font-style: " + this.style + ";\
}\n\
			";
			return template;
	},

	getFontClass : function (){
		//@todo move the default font to parameter
		var template = "\n\
			." + this.classname + "{\n\
				font-family:'" + this.name + "',Arial !important;\n\
				font-weight:" + this.weight + ";\n\
				font-style:" + this.style + ";\n\
				border:1px solid red;\n\
			}\n\
		";
		return template;
	},
	
	createElement : function (){
		this.element = document.createElement('span');
		this.element.style.cssText = "display:block;position:absolute;top:-999px;left:-999px;font-size: 300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;";
		this.element.classList.add(this.classname);
		this.element.innerHTML = "BAa17glESbswy";
		return this.element;
	},

	getWidth : function (){
		return this.element.offsetWidth;
	},

	getHeight : function (){
		return this.element.offsetHeight;
	},

	check : function (width,height){
		if (this.getWidth() === width && this.getHeight() === height ){
			this.status = false;
		}
		else{
			this.status = true;
		}
		return this.status;
	} 
});

var FontLoader = IClass.extend({
	fontsList : [],
	
	init : function (){
	 	this.createStyle();
	 	this.container = this.createContainer();
	 	this.testingFont = this.createTestingFont();
	},
	
	load : function (fonts_list){
		for(var i = 0 ;i<fonts_list.length;i++)
		{
			this.addItem(fonts_list[i]);		
		}
	},
	
	addItem : function (object) {
		//prevent empty fonts insertion
		if(object['name'] && object['name'].length < 3) { //3 stands for empty named fonts which their length is 2 -> ''
			return;
		}

		var item = new SingleFont(object);
		this.fontsList.push(item);
		if(item.type == 'dynamic') {
			this.appendStyle(item.getFontStyle());
		}
		this.appendStyle(item.getFontClass());
		this.insertInto(this.container,item.createElement());
	},
	
	/**
	 * check by css class
	 * @param  {[type]} className [description]
	 * @return {[type]}           [description]
	 */
	addClassItem :function(className){
		var font_name = this.figureFontNameFromClass(className);
		this.addItem({
			name : font_name,
			type : 'static'
		});
	},
	
	/**
	 * check font by already exist @font-face in the css 
	 * @param  {[type]} fontName [description]
	 * @return {[type]}          [description]
	 */
	addFontNameItem : function (name, weight, style){
		this.addItem({
			name : name,
			weight: weight,
			style: style,
			type : 'static'
		})
	},
	
	figureFontNameFromClass : function(className) {
		var div = document.createElement('div');
		div.setAttribute('class',className);
		this.insertInto(this.container,div);
		var font_family = window.getComputedStyle(div,null).getPropertyValue('font-family');
		this.container.removeChild(div);
		return font_family;
	},
	
	createStyle : function (){
		this.style = document.createElement('style');
		this.style.setAttribute('rel','stylesheet');
		this.style.setAttribute('id','font_loader');
		this.style.setAttribute('type','text/css');
		document.getElementsByTagName('head')[0].appendChild(this.style);
	},
	
	createTestingFont : function(){
		var item = new SingleFont({'name' : 'Arial','path':'none'});
		this.appendStyle(item.getFontClass());
		this.insertInto(this.container,item.createElement());
		return item;
	},

	createContainer : function (){
		var container = document.createElement('div');
		container.style.cssText = "visibility:hidden";
		this.insertInto(document.getElementsByTagName('body')[0],container);
		return container;
	},
	
	appendStyle : function (style){
		this.style.appendChild(document.createTextNode(style));
	},
	
	insertInto : function (parent,node){
		parent.appendChild(node);
	},
	
	singleCheckProcess : function (){
		 var result = true;
		 if(!this.fontsList.length){
		 	return true;
		 }
		 if(!this.defaultWidth ){
		 	this.defaultWidth = this.testingFont.getWidth();
		 }
		 if(!this.defaultHeight ){
		 	this.defaultHeight = this.testingFont.getHeight();
		 }
		 for (var i = this.fontsList.length -1; i >= 0 ; i--) {
		 	var item = this.fontsList[i];
		 	if(!item.status){
				 if(item.check(this.defaultWidth,this.defaultHeight)){
				 	this.fontsList.splice(i,1);	
				 }
			}
			result = result && item.status ;
		 }
		 return result;
	},
	
	check : function (callback,timeout,period){
		var start = Date.now();
		if(!timeout){
			var timeout = 1000;
		}
		if(!period){
			var period = 25;
		}
		var tries = timeout/period;
		(function x (){
			var result = this.singleCheckProcess();
			if(!result && tries >=0 ){
				setTimeout(function (){
					x.call(this);
					tries--;
				}.bind(this),period)
			}else{
				console.log("font loading time = " + (Date.now() - start) + "miliseconds"); 
				if(typeof callback === "function"){
					callback();
				}
			}
		}.bind(this))();
	}
});












