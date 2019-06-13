function Wood_sword(){
	
	this.frame = 0;
	this.stage = 'static';
	this.img = loadImage('js/sprite/player/player.png');

	this.attack = function(angle){
		this.frame = 100;
		this.stage = 'attacking';
		if (this.frame>0){
			this.frame--;
		}
	}

	this.stage = 'static';
}