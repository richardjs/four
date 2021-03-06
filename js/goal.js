'use strict';

function Goal(){
	var pos = world.findOpenSpace(WORLD_LEVELS - 1);
	Entity.call(this, 'Amulet of Asterisk', 'goal', pos.x, pos.y, WORLD_LEVELS - 1, '*', '#fd0', 0, 0);
	this.description = 'Your goal. Victory is almost upon you!\n\nIt shines with the beautiful glow of #fd0.'
}

Goal.prototype = Object.create(Entity.prototype);

Goal.prototype.kill = function(source){
	world.entities.remove(this);
	world.entityData[this.z][this.x][this.y] = undefined;
	scheduler.remove(this);
	world.draw(this.z);
}
