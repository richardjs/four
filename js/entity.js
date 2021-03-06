'use strict';

function Entity(name, type, x, y, z, char, color, strength, hp, options){
	options = options || {};

	this.name = name;
	this.type = type;

	this.x = x;
	this.y = y;
	this.z = z;

	this.char = char;
	this.color = color;

	this.strength = strength;
	this.hp = hp;

	this.alive = true;

	if(typeof(options.definiteArticle) === 'undefined'){
		this.definiteArticle = true;
	}else{
		this.definiteArticle = options.definiteArticle;
	}

	if(typeof(options.attackMultiplier) === 'undefined'){
		this.attackMultiplier = 1;
	}else{
		this.attackMultiplier = options.attackMultiplier;
	}

	if(typeof(options.defenseMultiplier) === 'undefined'){
		this.defenseMultiplier = 1;
	}else{
		this.defenseMultiplier = options.defenseMultiplier;
	}

	this.xp = options.xp || 0;

	// Register entity with the game components
	world.entities.push(this);
	world.entityData[z][x][y] = this;
	scheduler.add(this, true);
}

Entity.prototype.turn = function(done){
	done();
}

Entity.prototype.tryMove = function(x, y, z){
	if(typeof(z) === 'undefined'){
		z = this.z;
	}

	if(world.mapData[z][x][y] === MAP.WALL){
		return false;
	}

	if(world.entityData[z][x][y]){
		if(!this.hit(world.entityData[z][x][y])){
			return false;
		}
	}

	world.entityData[this.z][this.x][this.y] = undefined;
	world.entityData[z][x][y] = this;

	this.x = x;
	this.y = y;
	this.z = z;
	this.movesRemaining--;

	if(this.fov){
		this.updateFOV();
	}
	world.draw(this.z);

	return true;
}

Entity.prototype.hit = function(other){
	this.meleeAttack(other);
	// Return true if movement should proceed normally
	return false;
}

Entity.prototype.meleeAttack = function(other){
	var thisRoll = Math.max(ROT.RNG.getNormal(this.strength, this.strength/3), 0) * this.attackMultiplier;
	var otherRoll = Math.max(ROT.RNG.getNormal(other.strength, other.strength/3), 0) * other.defenseMultiplier;
	var damage = Math.max(Math.floor(thisRoll - otherRoll), 0);
	if(damage > 0){
		log.message('%s attacks %s for %s damage!'.format(
			this.definiteArticle ? 'The ' + this.name : this.name,
			other.definiteArticle ? 'the ' + other.name : other.name,
			damage
		));
	}else{
		log.message('%s misses %s.'.format(
			this.definiteArticle ? 'The ' + this.name : this.name,
			other.definiteArticle ? 'the ' + other.name : other.name
		));
	}
	other.damage(damage, this);
	this.movesRemaining = 0;
}

Entity.prototype.damage = function(damage, source){
	this.hp -= damage;
	if(this.hp <= 0){
		this.kill(source);
	}
}

Entity.prototype.kill = function(source){
	log.message('%s dies!'.format(
		this.definiteArticle ? 'The ' + this.name : this.name
	));
	this.alive = false;
	world.entities.remove(this);
	world.entityData[this.z][this.x][this.y] = undefined;
	scheduler.remove(this);
	world.draw(this.z);

	if(this.xp){
		world.gainXP(this.xp);
	}
}
