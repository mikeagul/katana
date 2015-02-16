function CHelpPanel(){
    var _oText;
    var _oHelpBg;
    var _oButExit;
    var _oContainer;

    this._init = function(){
        _oHelpBg = new createBitmap(s_oSpriteLibrary.getSprite('help_bg')); 
		
        var szText;
        if(s_bMobile){
            szText = TEXT_HELP_MOBILE;
        }else{
            szText = TEXT_HELP;
        }
	_oText = new createjs.Text(szText,"70px katanaregular", "#FFCC00");
        _oText.x = CANVAS_WIDTH/2;
        _oText.y = 420; 
        _oText.textAlign = "center";
        _oText.textBaseline = "alphabetic";
        _oText.lineHeight = 70;
        _oText.shadow = new createjs.Shadow("#000", 2, 2, 2);

        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButExit = new CTextButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -280,oSprite,TEXT_PLAY,"katanaregular","#ffc600",60,false);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this); 

        _oContainer = new createjs.Container();
        _oContainer.addChild(_oHelpBg,_oText,_oButExit.getSprite());
        s_oStage.addChild(_oContainer);

    };

    this.unload = function(){
        _oButExit.unload();
        
        _oContainer.removeAllChildren();
    };

    this._onExit = function(){
        this.unload();
        s_oGame.exitFromHelp();
    };

    this._init();

}