function CInterface(){
    var _oLifeText;
    var _oButExit;
    var _oScoreText;
    var _oAudioToggle;
    
    this._init = function(){
        
        var oLife = new createBitmap(s_oSpriteLibrary.getSprite('life'));
        oLife.x = 20;
        oLife.y = 20;
        s_oStage.addChild(oLife);
        
        _oLifeText = new createjs.Text("X"+NUM_LIVES,"40px katanaregular", "#FFCC00");
        _oLifeText.x = 120;
        _oLifeText.y = 40; 
        _oLifeText.textAlign = "center";
        _oLifeText.textBaseline = "middle";
        s_oStage.addChild(_oLifeText);
        
	_oScoreText = new createjs.Text(TEXT_SCORE + " 0","40px katanaregular", "#FFCC00");
        _oScoreText.x = CANVAS_WIDTH/2;
        _oScoreText.y = 45; 
        _oScoreText.textAlign = "center";
        _oScoreText.textBaseline = "middle";
        s_oStage.addChild(_oScoreText);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(CANVAS_WIDTH - (oSprite.height/2) - 6,6 + (oSprite.height/2),oSprite,true);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);      
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(CANVAS_WIDTH - (oSprite.height/2) - 80,(oSprite.height/2) + 6,oSprite,s_bAudioActive);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
    };
    
    this.unload = function(){
        _oButExit.unload();
        _oButExit = null;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
    
    };
    
    this.loseLife = function(iLives){
        _oLifeText.text = "X"+iLives;
    };

    this.refreshScore = function(iScore){
        _oScoreText.text = TEXT_SCORE+" "+iScore;
    };

    this._onAudioToggle = function(){
        createjs.Sound.setMute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        s_oGame.onExit();  
    };
    
    this._init();
    
    return this;
}