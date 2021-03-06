'use strict';

function Assassin(name, x, y){
	PC.call(this, name, 'Assassin', x, y, '#444', 12, 12, 0, {
		attackMultiplier: 2,
		defenseMultiplier: .25
	});
	this.stealth = .3;
}

Assassin.prototype = Object.create(PC.prototype);

Assassin.prototype.levelUp = function(){
	this.strength += Math.floor(Math.max(ROT.RNG.getNormal(5, 2), 1));
	this.maxHP += Math.floor(Math.max(ROT.RNG.getNormal(6, 2), 1));
	if(this.stealth < .85){
		this.stealth += .025;
	}
	this.hp = this.maxHP;
	this.sp = this.maxSP;
}
