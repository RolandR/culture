var Weather = new function(){
	var canvas = document.getElementById("weatherCanvas");
	var context = canvas.getContext("2d");

	var World = null;

	var airViscosity = 0.3;

	var shortEdge;

	function windowResize(){

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		if(canvas.width > canvas.height){
			shortEdge = canvas.height;
		} else {
			shortEdge = canvas.width;
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

		var x = World.terrainPoints.length;
		while(x--){
			var y = World.terrainPoints[0].length;
			while(y--){
				World.terrainPoints[y][x].setAirPressure(1000);
				World.terrainPoints[y][x].setAirTemperature(World.terrainPoints[y][x].getTemperature());
			}
		}
		
		windowResize();
		renderer = new Renderer();

		World.terrainPoints[20][49].setAirPressure(1020);
		World.terrainPoints[20][50].setAirPressure(1020);
		World.terrainPoints[21][49].setAirPressure(1020);
		World.terrainPoints[21][50].setAirPressure(1020);
		World.terrainPoints[70][2].setAirPressure(980);
		
		World.terrainPoints[50][60].setAirPressure(980);
		World.terrainPoints[50][62].setAirPressure(1020);
		
		renderer.render();

		setInterval(animate, 00);
		
	}

	window.addEventListener('resize', function(){
		windowResize();
	});

	function updateAirPressures(){
		var w = World.terrainPoints.length;
		var x = w;
		while(x--){
			var y = World.terrainPoints[0].length;
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
				
				World.terrainPoints[y][x].setAirPressure(newAP);

				/*if(World.terrainPoints[y][x].getAirPressure() != 1000){
					console.log(World.terrainPoints[y][x].getAirPressure());
				}*/
			}
		}
	}

	function animate(){
		updateAirPressures();
		renderer.render();
	}
	
	function Renderer(){
		
		var cellSize = shortEdge / World.terrainPoints.length;
		var cell;
		var color;
		
		function render(){

			context.fillRect(0, 0, 5, 5);
			
			var x = World.terrainPoints.length;
			while(x--){
				var y = World.terrainPoints[0].length;
				while(y--){
					
					cell = World.terrainPoints[y][x];

					color = [0, 0, 0];
					
					color[0] = 0;
					color[1] = ((cell.getAirPressure() - 1000)*5) * 128;
					color[2] = ((1000 - cell.getAirPressure())*5) * 128;
					
					for(var i = 0; i <= 2; i++){
						color[i] = Math.round(color[i]);
						if(color[i] > 255){
							color[i] = 255;
						} else if(color[i] < 0){
							color[i] = 0;
						}
					}
					
					context.fillStyle = "rgb("+color[0]+", "+color[1]+", "+color[2]+")";
					context.fillRect(
						 Math.floor(x * cellSize + canvas.width / 2 - shortEdge / 2)
						,Math.floor(y*cellSize + canvas.height / 2 - shortEdge / 2)
						,Math.ceil(cellSize)
						,Math.ceil(cellSize)
					);
				}
			}
		}

		return {
			render: render
		};
	}

	return {
		getRenderer: function(){return renderer;}
	};
}
