var Menu = new function(){

	var menuContainer = document.getElementById("gameMenu");
	var menuWidth = 32; // Width of menuItems in characters
	var currentScreen = null;
	
	var MenuScreens = {
		worldGen: {
			 title: "World"
			,menuItems:[
				 {
					 text: "Generate new"
					,func: function(){
						Terrain.clear();
						setTimeout(Terrain.init, 0)
					}
					,key: "n"
				}
				,{
					 text: "Start playing"
					,func: Game.start
					,key: "s"
				}
			]
		}
	}

	function renderMenuScreen(screen){

		currentScreen = screen;
		
		var menuElement = document.createElement("div");
		var titleElement = document.createElement("h2");
		titleElement.innerHTML = screen.title;
		menuElement.appendChild(titleElement);
		
		for(var i in screen.menuItems){
			var menuItem = document.createElement("button");
			menuItem.className = "menuItem";
			menuItem.id = "menu-"+screen.menuItems[i].key;

			var menuText = document.createElement("span");
			menuText.className = "menuText";
			menuText.innerHTML = screen.menuItems[i].text;

			var menuDots = document.createElement("span");
			menuDots.className = "menuDots";
			
			var lengthAfterText = menuWidth - screen.menuItems[i].text.length;
			if(lengthAfterText > 3){
				menuDots.innerHTML = " " + new Array(lengthAfterText - 3).join(".") + " ";
			} else {
				menuDots.innerHTML = "  "; // todo: handle longer menu texts
			}

			var menuKey = document.createElement("span");
			menuKey.className = "menuKey";
			menuKey.innerHTML = screen.menuItems[i].key;

			menuItem.appendChild(menuText);
			menuItem.appendChild(menuDots);
			menuItem.appendChild(menuKey);

			menuItem.onclick = screen.menuItems[i].func;
			
			menuElement.appendChild(menuItem);
		}

		menuContainer.appendChild(menuElement);
	}

	function init(){
		renderMenuScreen(MenuScreens.worldGen);
	}

	window.onkeydown = function(e){
		var key = e.keyCode ? e.keyCode : e.which;
		var char = String.fromCharCode(key).toLowerCase();

		if(currentScreen){
			for(var i in currentScreen.menuItems){
				var item = currentScreen.menuItems[i];

				if(item.key == char){
					var menuItem = document.getElementById("menu-"+item.key);
					if(menuItem){
						menuItem.focus();
					}
					break;
				}
			}
		}
	}

	window.onkeyup = function(e){
		var key = e.keyCode ? e.keyCode : e.which;
		var char = String.fromCharCode(key).toLowerCase();

		if(currentScreen){
			for(var i in currentScreen.menuItems){
				var item = currentScreen.menuItems[i];
			
				if(item.key == char){

					var menuItem = document.getElementById("menu-"+item.key);
					if(menuItem){
						menuItem.blur();
					}
					
					item.func();
					break;
				}
			}
		}
	}

	init();
}
