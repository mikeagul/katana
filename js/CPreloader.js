function CPreloader(){
    var _iMaskWidth;
    var _oLoadingText;
    var _oPreloaderBar;
    var _oProgressBar;
    var _oMaskPreloader;
    var _oContainer;
    
    this._init = function(){
       s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );
       s_oSpriteLibrary.addSprite("bg_preloader","./sprites/bg_menu.jpg");
       s_oSpriteLibrary.addSprite("preloader_bar","./sprites/preloader_bar.png");
       s_oSpriteLibrary.addSprite("progress_bar","./sprites/progress_bar.png");
       s_oSpriteLibrary.loadSprites();
       
       _oContainer = new createjs.Container();
       s_oStage.addChild(_oContainer); 
    };
    
    this.unload = function(){
	_oContainer.removeAllChildren();
    };
    
    this._onImagesLoaded = function(){

    };
    
    this._onAllImagesLoaded = function(){
        this.attachSprites();
        
        s_oMain.preloaderReady();
    };
    
    this.attachSprites = function(){
        var oBg = new createBitmap(s_oSpriteLibrary.getSprite('bg_preloader'));
        _oContainer.addChild(oBg);

       _oPreloaderBar = createBitmap(s_oSpriteLibrary.getSprite('preloader_bar'));
       _oPreloaderBar.x = 140;
       _oPreloaderBar.y = 950;
       _oContainer.addChild(_oPreloaderBar);
       
       _oProgressBar  = createBitmap(s_oSpriteLibrary.getSprite('progress_bar'));
       _oProgressBar.x = 141;
       _oProgressBar.y = 951;
       _oContainer.addChild(_oProgressBar);
       
       _iMaskWidth = 476;
       _oMaskPreloader = new createjs.Shape();
       _oMaskPreloader.graphics.beginFill("rgba(255,0,0,0.01)").drawRect(141, 951, 1,30);
       _oContainer.addChild(_oMaskPreloader);
       
       _oProgressBar.mask = _oMaskPreloader;
       
       _oLoadingText = new createjs.Text("","40px katanaregular", "#fff");
       _oLoadingText.x = (CANVAS_WIDTH/2);
       _oLoadingText.y = 970;
       _oLoadingText.textAlign = "center"; 
       _oLoadingText.textBaseline = "middle";
       _oContainer.addChild(_oLoadingText);
    };
    
    this.refreshLoader = function(iPerc){
        _oLoadingText.text = iPerc+"%";
        
        var iNewMaskWidth = Math.floor((iPerc*_iMaskWidth)/100);
        _oMaskPreloader.graphics.clear();
        _oMaskPreloader.graphics.beginFill("rgba(255,0,0,0.01)").drawRect(141, 951, iNewMaskWidth,30);
    };
    
    this._init();   
}