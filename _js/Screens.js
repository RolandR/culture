
function Screen(ntitle, nelement){

	var title = ntitle;
	var element = nelement;
	var tabElement = null;
	
	function show(){
		element.style.display = "block";
		tabElement.className += " active";
	}
	
	function hide(){
		element.style.display = "none";
		tabElement.className = "tab";
	}

	return {
		 show: show
		,hide: hide
		,setTabElement: function(n){tabElement = n;}
		,getTitle: function(){return title;}
		,getElement: function(){return element;}
	};
}

var Screens = {
	 worldmap: new Screen("World", document.getElementById("screen-worldmap"))
	,buildings: new Screen("Buildings", document.getElementById("screen-buildings"))
	,stocks: new Screen("Stocks", document.getElementById("screen-stocks"))
};

function buildMenu(){
	var menu = document.getElementById("tabs");
	
	for(var i in Screens){
		if(Screens.hasOwnProperty(i)){
			var menuElement = document.createElement("div");
			menuElement.className = "tab";
			menuElement.innerHTML = Screens[i].getTitle();
			menuElement.dataset.screen = Screens[i].getTitle();
			menuElement.onclick = function(){showScreen(this.dataset.screen)};
			menu.appendChild(menuElement);
			
			Screens[i].setTabElement(menuElement);
		}
	}
}

function showScreen(screen){
	for(var i in Screens){
		if(Screens.hasOwnProperty(i)){
			if(Screens[i].getTitle() == screen){
				Screens[i].show();
			} else {
				Screens[i].hide();
			}
		}
	}
}

buildMenu();
showScreen("World");
