
var Weather = new function(){
	var canvas = document.getElementById("weatherCanvas");
	var context = canvas.getContext("2d");

	var World = null;

	var airViscosity = 1;

	var shortEdge;
	var imageWidth;
	var imageHeight;

	function windowResize(){

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		
		if(World.terrainPoints[0].length  / canvas.width < World.terrainPoints.length / canvas.height){
			shortEdge = canvas.height;
			
			imageHeight = shortEdge;
			imageWidth = World.terrainPoints[0].length / World.terrainPoints.length * shortEdge;
		} else {
			shortEdge = canvas.width;

			imageWidth = shortEdge;
			imageHeight = World.terrainPoints.length / World.terrainPoints[0].length * shortEdge;
		}

		if(renderer){
			renderer.render();
		}
	}

	var renderer = null;
	
	window.addEventListener('worldCreated', function(){
		init();
	});

	function init(){
		World = Terrain.getWorld();
		
		var x = World.terrainPoints[0].length;
		while(x--){
			var y = World.terrainPoints.length;
			while(y--){
				World.terrainPoints[y][x].setAirPressure(1000);
				World.terrainPoints[y][x].setAirTemperature(World.terrainPoints[y][x].getTemperature());
			}
		}
		
		windowResize();
		renderer = new Renderer();

		var x = World.terrainPoints[0].length;
		while(x--){
			var y = World.terrainPoints.length;
			while(y--){
				if(y > World.terrainPoints.length/2){
					World.terrainPoints[y][x].setAirPressure(1020);
				} else if(y + 1 == Math.ceil(World.terrainPoints.length/2)){
					World.terrainPoints[y][x].setAirPressure(1000);
				} else {
					World.terrainPoints[y][x].setAirPressure(980);
				}
			}
		}

		//World.terrainPoints[20][40].setAirPressure(12000);
		
		renderer.render();

		setInterval(animate, 30);
		
	}

	window.addEventListener('resize', function(){
		windowResize();
	});

	var maxPressure;
	var minPressure;
	var pressureDifference;
	var pressureBelowZero;
	
	function updateAirPressures(){		
		
		var w = World.terrainPoints[0].length;
		var x = w;
		while(x--){
			var y = World.terrainPoints.length;
			while(y--){
				var surroundingAP = 0;

				if(y >= World.terrainPoints.length - 1){
					
					surroundingAP += World.terrainPoints[y-1][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y-1][(x  ).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y-1][(x+1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y][x].getAirPressure() * 3;
					surroundingAP += World.terrainPoints[y  ][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y  ][(x+1).mod(w)].getAirPressure();
					
				} else if(y <= 0){
					
					surroundingAP += World.terrainPoints[y][x].getAirPressure() * 3;
					surroundingAP += World.terrainPoints[y+1][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y+1][(x  ).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y+1][(x+1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y  ][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y  ][(x+1).mod(w)].getAirPressure();
					
				} else {
					
					surroundingAP += World.terrainPoints[y-1][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y-1][(x  ).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y-1][(x+1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y+1][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y+1][(x  ).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y+1][(x+1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y  ][(x-1).mod(w)].getAirPressure();
					surroundingAP += World.terrainPoints[y  ][(x+1).mod(w)].getAirPressure();

					
				}

				surroundingAP = surroundingAP / 8;

				var newAP = (World.terrainPoints[y][x].getAirPressure() * airViscosity + surroundingAP) / (1 + airViscosity);
				
				World.terrainPoints[y][x].setNewAirPressure(newAP);

			}
		}
		
		maxPressure = World.terrainPoints[0][0].getAirPressure();
		minPressure = World.terrainPoints[0][0].getAirPressure();
		
		var x = World.terrainPoints[0].length;
		while(x--){
			var y = World.terrainPoints.length;
			while(y--){
				World.terrainPoints[y][x].applyNewAP();

				if(World.terrainPoints[y][x].getAirPressure() > maxPressure){
					maxPressure = World.terrainPoints[y][x].getAirPressure();
				} else if(World.terrainPoints[y][x].getAirPressure() < minPressure){
					minPressure = World.terrainPoints[y][x].getAirPressure();
				}
			}
		}

		pressureDifference = maxPressure - minPressure;
		pressureBelowZero = 0;
		if(minPressure < 0){
			pressureBelowZero += (0 - minPressure);
			pressureDifference += pressureBelowZero;
		}
	}

	function animate(){
		updateAirPressures();
		renderer.render();
	}
	
	function Renderer(){

		var prCanvas = document.getElementById("weatherPreRenderCanvas");
		prCanvas.height = World.terrainPoints.length;
		prCanvas.width = World.terrainPoints[0].length;
		var prContext = prCanvas.getContext("2d");
		var prImageData;
		
		var cellSize = shortEdge / World.terrainPoints.length;
		var cell;
		var color;

		var a;
		
		function render(){

			context.imageSmoothingEnabled = false;
			context.mozImageSmoothingEnabled = false;
			context.webkitImageSmoothingEnabled = false;
			
			prImageData = prContext.createImageData(prCanvas.width, prCanvas.height);
			
			var x = World.terrainPoints[0].length;
			while(x--){
				var y = World.terrainPoints.length;
				while(y--){
					
					cell = World.terrainPoints[y][x];

					c = Math.floor(((cell.getAirPressure() - minPressure)/(pressureDifference+1))*255);

					color = [0, 0, 0];
					
					color[0] = 0;
					color[1] = c;
					color[2] = 255-c;
					
					for(var i = 0; i <= 2; i++){
						color[i] = Math.round(color[i]);
						if(color[i] > 255){
							color[i] = 255;
						} else if(color[i] < 0){
							color[i] = 0;
						}
					}

					a = (y * World.terrainPoints[0].length + x) * 4;

					prImageData.data[a  ] = color[0];
					prImageData.data[a+1] = color[1];
					prImageData.data[a+2] = color[2];
					prImageData.data[a+3] = 255;
				}
			}

			prContext.putImageData(prImageData, 0, 0);
			context.drawImage(prCanvas, canvas.width / 2 - imageWidth / 2, canvas.height / 2 - imageHeight / 2, imageWidth, imageHeight);
		}


		return {
			render: render
		};
	}

	return {
		getRenderer: function(){return renderer;}
	};
}
