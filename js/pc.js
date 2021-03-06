'use strict';

function PC(name, cls, x, y, color, strength, hp, sp, options){
	options = options || {};
	if(typeof(options.definiteArticle === 'undefined')){
		options.definiteArticle = false;
	}

	Entity.call(this, name, 'pc', x, y, 0, '@', color, strength, hp, options);
	world.pcs.push(this);

	this.cls = cls;
	this.maxHP = hp;
	this.sp = sp || 0;
	this.maxSP = this.sp;

	this.fov = new ROT.FOV.PreciseShadowcasting(function(x, y){
		if(x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT){
			return true;
		}
		return world.mapData[this.z][x][y] !== MAP.WALL;
	}.bind(this));
	this.fovData = createArray(WORLD_LEVELS, WORLD_WIDTH, WORLD_HEIGHT);
	this.updateFOV();

	this.description = '';
};

PC.prototype = Object.create(Entity.prototype);

PC.prototype.updateFOV = function(){
	// Zero out...
	this.fovData = createArray(WORLD_LEVELS, WORLD_WIDTH, WORLD_HEIGHT);
	// ...and recompute
	this.fov.compute(this.x, this.y, VIEW_DISTANCE, function(x, y, distance, visibility){
		this.fovData[this.z][x][y] = true;
		world.seenData[this.z][x][y] = true;
	}.bind(this));
}

PC.prototype.turn = function(done){
	this.done = done;
	this.movesRemaining = 3;
	controller.getAction(this.action.bind(this));
}

PC.prototype.action = function(action){
	switch(action){
		case 'north':
			this.tryMove(this.x, this.y-1);
			break;
		case 'northeast':
			this.tryMove(this.x+1, this.y-1);
			break;
		case 'east':
			this.tryMove(this.x+1, this.y);
			break;
		case 'southeast':
			this.tryMove(this.x+1, this.y+1);
			break;
		case 'south':
			this.tryMove(this.x, this.y+1);
			break;
		case 'southwest':
			this.tryMove(this.x-1, this.y+1);
			break;
		case 'west':
			this.tryMove(this.x-1, this.y);
			break;
		case 'northwest':
			this.tryMove(this.x-1, this.y-1);
			break;

		case 'down':
			if(world.mapData[this.z][this.x][this.y] === MAP.STAIR_DOWN){
				this.tryMove(
					world.maps[this.z + 1].stairUp.x,
					world.maps[this.z + 1].stairUp.y,
					this.z + 1
				);
			}
			break;
		case 'up':
			if(world.mapData[this.z][this.x][this.y] === MAP.STAIR_UP){
				if(this.z === 0){
					controller.dialog('You wouldn\'t abandon your quest so soon!');
					break;
				}
				this.tryMove(
					world.maps[this.z - 1].stairDown.x,
					world.maps[this.z - 1].stairDown.y,
					this.z - 1
				);
			}
			break;

		case 'wait':
			this.movesRemaining = 0;
			break;

		case 'describe':
			controller.getCoordinate(this.x, this.y, function(x, y){
				if(!world.pcCanSee(x, y, this.z)){
					return;
				}
				var entity = world.entityData[this.z][x][y];
				if(entity){
					controller.dialog('%c{%s}%s%c{} - %s\nStrength: %s\nHP: %s\n\n%s'.format(
						entity.color,
						entity.char,
						entity.name,
						entity.strength,
						entity.hp,
						entity.description
					));
				}
			}.bind(this));
			break;
	}

	if(this.movesRemaining === 0){
		this.done();
	}else{
		controller.getAction(this.action.bind(this));
	}
}

PC.prototype.hit = function(other){
	switch(other.type){
		case 'pc':
			var tx = this.x;
			var ty = this.y;
			var tz = this.z;
			this.x = other.x;
			this.y = other.y;
			this.z = other.z;
			other.x = tx;
			other.y = ty;
			other.z = tz;
			world.entityData[this.z][this.x][this.y] = this;
			world.entityData[other.z][other.x][other.y] = other;
			this.movesRemaining--;
			this.updateFOV();
			other.updateFOV();
			world.draw(this.z);
			break;

		case 'mob':
			this.meleeAttack(other);
			break;
		
		case 'goal':
			other.kill();
			alert('Congratulations, %s has found the amulet! You win!'.format(this.name));
			log.message('Congratulations, %s has found the amulet! You win!'.format(this.name));
			controller.dialog('A winner is you!');
			break;
	}
}

PC.prototype.kill = function(source){
	world.pcs.remove(this);
	Entity.prototype.kill.call(this, source);
	if(world.pcs.length === 0){
		var restart = confirm('Game over! All your PCs have died. Restart?');
		if(restart){
			window.location.reload();
		}
	}
}

PC.prototype.levelUp = function(){}
