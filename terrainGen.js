var canvas = document.getElementById("renderCanvas");
var context = canvas.getContext("2d");

canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var temperatureGradient = [];

function prepareTemperatureGradient(){
	var tgImg = document.getElementById("temperatureGradient");
	var tgCanvas = document.getElementById("temperatureGradientCanvas");
	tgCanvas.height = tgImg.height;
	tgCanvas.width = tgImg.width;
	var tgContext = tgCanvas.getContext("2d");
	tgContext.drawImage(tgImg, 0, 0);
	var tgImageData = tgContext.getImageData(0, 0, tgCanvas.width, tgCanvas.height).data;

	var i = 0;
	while(i < tgImageData.length){
		temperatureGradient.push({
			 r: tgImageData[i  ]
			,g: tgImageData[i+1]
			,b: tgImageData[i+2]
		});
		i += 4;
	}
}

var worldInfo = {
	 max: 0
	,min: 0
	,difference: 0
	,belowZero: 0
}

function calculateHeightDifferences(){
	worldInfo.max = terrainPoints[0][0].getHeight();
	worldInfo.min = terrainPoints[0][0].getHeight();
	
	var x = terrainPoints[0].length;
	while(x--){
		var y = terrainPoints.length;
		while(y--){
			if(terrainPoints[y][x] > worldInfo.max){
				worldInfo.max = terrainPoints[y][x].getHeight();
			} else if(terrainPoints[y][x].getHeight() < worldInfo.min){
				worldInfo.min = terrainPoints[y][x].getHeight();
			}
		}
	}
	
	worldInfo.difference = worldInfo.max - worldInfo.min;
	worldInfo.belowZero = 0;
	if(worldInfo.min < 0){
		worldInfo.belowZero += (0 - worldInfo.min);
		worldInfo.difference += worldInfo.belowZero;
	}
}

var shortEdge;
if(canvas.width > canvas.height){
	shortEdge = canvas.height;
} else {
	shortEdge = canvas.width;
}

var terrainPoints = [
	 [new TerrainPoint(0, 0, 0), new TerrainPoint(0, 1, 0)]
	,[new TerrainPoint(0, 0, 1), new TerrainPoint(0, 1, 1)]
];

var iterations = 7;

var worldEdge = Math.pow(2, iterations) + 1;

var heightScale = 1000;

var ruggedness = 1.5; // lower for smoother terrain, higher for more extreme
var waterLevel = 0;

var gradientMin = -10;
var gradientRange = 40;

var tempRange = 40; // Minimum to maximum temperature in degrees Celsius
var minTemp = -10;
var maxTemp = tempRange + minTemp;

var animationframe = 0;
var season = 0;

document.getElementById("temperatureGradient").onload = init;

function init(){
	prepareTemperatureGradient();

	do{
		terrainPoints = [
			 [new TerrainPoint(0, 0, 0), new TerrainPoint(0, 1, 0)]
			,[new TerrainPoint(0, 0, 1), new TerrainPoint(0, 1, 1)]
		];
		var i = iterations;
		while(i--){
			addTerrainPoints();
		}
	} while(worldIsTooBoring());
	
	biomify();
	calculateHeightDifferences();
	calculateHillshades();
	render();

	setInterval(animate, 50);
}

function animate(){
	season = Math.sin(animationframe / 50);
	biomify();
	render();
	animationframe++;
}

function worldIsTooBoring(){
	var water = 0;
	var total = terrainPoints.length * terrainPoints[0].length;
	var x = terrainPoints[0].length;
	while(x--){
		var y = terrainPoints.length;
		while(y--){
			if(terrainPoints[y][x].getHeight() < waterLevel){
				water++;
			}
		}
	}
	var ratio = water/total;
	if(ratio > 0.7 || ratio < 0.3){
		console.log("Rejected world - Too boring: "+ratio);
		return true;
	}
	return false;
}

function TerrainPoint(elevation, x, y){
	var isWater;
	var temperature;
	var hillshade;

	return {
		 getHeight: function(){return elevation;}
		,isWater: function(){return isWater;}
		,getTemperature: function(){return temperature;}
		,getHillshade: function(){return hillshade;}
		,getX: function(){return x;}
		,getY: function(){return y;}
		
		,setWater: function(w){isWater = w;}
		,setTemperature: function(t){temperature = t;}
		,setHillshade: function(h){hillshade = h;}
	};
}

function addTerrainPoints(){
	var oldWidth = terrainPoints[0].length;
	var x = terrainPoints[0].length-1;
	while(x--){
		var y = terrainPoints.length;
		while(y--){
			var newheight = (terrainPoints[y][x+1].getHeight() + terrainPoints[y][x].getHeight())/2;
			newheight += ruggedness * ((Math.random()-0.5) * (heightScale / oldWidth));
			terrainPoints[y].splice(x+1, 0, new TerrainPoint(newheight, x, y));
		}
	}
	var oldHeight = terrainPoints.length;
	var y = terrainPoints.length - 1;
	while(y--){
		var x = terrainPoints[y].length;
		var newRow = [];
		while(x--){
			var newheight = (terrainPoints[y][x].getHeight() + terrainPoints[y+1][x].getHeight())/2;
			newheight += ruggedness * ((Math.random()-0.5) * (heightScale / oldHeight));
			newRow.unshift(new TerrainPoint(newheight, x, y));
		}
		terrainPoints.splice(y+1, 0, newRow);
	}
}

function calculateHillshades(){
	
	var x = terrainPoints[0].length;
	while(x--){
		var y = terrainPoints.length;
		while(y--){

			var darken = 0;
			var brighten = 0;
			
			for(var n = 1; n < 10; n++){
				if(y >= terrainPoints.length - n || x >= terrainPoints[y].length - n){
					brighten += 0;
				} else {
					brighten += (terrainPoints[y+n][x+n].getHeight() - terrainPoints[y+n-1][x+n-1].getHeight())/n;
				}
				
				if(y <= 1+n || x <= 1+n){
					darken += 0;
				} else {
					darken += (terrainPoints[y-n+1][x-n+1].getHeight() - terrainPoints[y-n][x-n].getHeight())/n;
				}
			}

			shade = darken + brighten;
			shade = Math.round(shade * 0.45 / ruggedness * Math.sqrt(iterations));

			terrainPoints[y][x].setHillshade(shade);
			
		}
	}
	
}

function biomify(){
	
	var worldWidth = terrainPoints[0].length;
	var x = worldWidth;
	while(x--){
		var worldHeight = terrainPoints.length;
		var y = worldHeight;
		while(y--){
			var tile = terrainPoints[y][x];
			var worldEdgeLengths = terrainPoints.length
			
			if(tile.getHeight() < waterLevel){
				tile.setWater(true);
			}

			var equatorDist = 1 - (Math.abs(y - worldHeight/2) / worldHeight*2); // Distance to equator, 0 to 1
			var temp = equatorDist * tempRange + minTemp;

			temp += (y - worldHeight/2) * season/10;

			temp = temp - tile.getHeight() / 15;

			if(temp < minTemp){
				temp = minTemp;
			}

			if(temp >= maxTemp){
				temp = maxTemp;
			}
			
			tile.setTemperature(temp);
	
		}
	}
}


function render(){

	var prCanvas = document.getElementById("preRenderCanvas");
	prCanvas.height = terrainPoints.length;
	prCanvas.width = terrainPoints[0].length;
	var prContext = prCanvas.getContext("2d");
	var prImageData = prContext.createImageData(prCanvas.width, prCanvas.height);
	
	var x = terrainPoints[0].length;
	while(x--){
		var y = terrainPoints.length;
		while(y--){
			var tile = terrainPoints[y][x];
			var c = Math.round(((tile.getHeight()+worldInfo.belowZero)/worldInfo.difference)*255);

			var color = [];
			
			if(tile.isWater()){
				if(tile.getTemperature() > 0){
					color = [0, 0, c];
				} else {
					var r = Math.abs(tile.getTemperature()) * iterations + 150;
					var g = Math.abs(tile.getTemperature()) * iterations + 180;
					if(r > 210){
						r = 210;
					}
					if(g > 235){
						g = 235;
					}
					color = [r, g, 255];
				}
			} else {
				var temp = Math.floor(((tile.getTemperature() - gradientMin)/gradientRange) * 255);
				if(temp < 0){
					temp = 0;
				} else if(temp > 255){
					temp = 255;
				}
				var t = temperatureGradient[temp];
				color = [t.r, t.g, t.b];
			}

			var shade = 0;
			
			if(!tile.isWater()){
				shade = tile.getHillshade();
			}
			
			var i = 2;
			while(i--){
				color[i] += shade;
				color[i] = Math.round(color[i]);
				if(color[i] > 255){
					color[i] = 255;
				} else if(color[i] < 0){
					color[i] = 0;
				}
			}

			var a = (y * terrainPoints[0].length + x) * 4;

			prImageData.data[a  ] = color[0];
			prImageData.data[a+1] = color[1];
			prImageData.data[a+2] = color[2];
			prImageData.data[a+3] = 255;
		}
	}

	prContext.putImageData(prImageData, 0, 0);
	context.save();
	context.imageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.drawImage(prCanvas, 0, 0, shortEdge, shortEdge);
	context.restore();
}

































