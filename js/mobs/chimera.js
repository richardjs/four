'use strict';

function spawnChimera(){
	var count = Math.floor(ROT.RNG.getNormal(10, 2));
	for(var i = 0; i < count; i++){
		var z;
		do{
			z = Math.floor(ROT.RNG.getNormal(WORLD_LEVELS - 1, 2));
		}while(z < 0 || z > WORLD_LEVELS - 1);
		var pos = world.findOpenSpace(z);
		new Chimera(pos.x, pos.y, z);
	}
}

function Chimera(x, y, z){
	AgroMob.call(this, 'chimera', x, y, z, 'C', '#90c', 60, 80, 225);
}

Chimera.prototype = Object.create(AgroMob.prototype);