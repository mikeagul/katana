function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas);
        s_oCanvas = canvas;
       
	s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
        createjs.Touch.enable(s_oStage);
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.setFPS(35);
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
    };
    
    this.preloaderReady = function(){
        this._loadImages();
		
	if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
		
	_bUpdate = true;
    };
    
    this.soundLoaded = function(){
         _iCurResource++;

         if(_iCurResource === RESOURCE_TO_LOAD){
             _oPreloader.unload();
            
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                s_oSoundTrack = createjs.Sound.play("soundtrack",{ loop:-1,volume:SOUNDTRACK_VOLUME});
            }

            this.gotoMenu();
         }
    };
    
    this._initSounds = function(){
         if (!createjs.Sound.initializeDefaultPlugins()) {
             return;
         }

        if(navigator.userAgent.indexOf("Opera")>0 || navigator.userAgent.indexOf("OPR")>0){
                createjs.Sound.alternateExtensions = ["mp3"];
                createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));

                createjs.Sound.registerSound("./sounds/click.ogg", "click");
                createjs.Sound.registerSound("./sounds/gameover.ogg", "gameover");
                createjs.Sound.registerSound("./sounds/soundtrack.ogg", "soundtrack");
                createjs.Sound.registerSound("./sounds/explosion.ogg", "explosion");
                createjs.Sound.registerSound("./sounds/fruit_slice_1.ogg", "fruit_slice_1",3);
                createjs.Sound.registerSound("./sounds/fruit_slice_2.ogg", "fruit_slice_2",3);
                createjs.Sound.registerSound("./sounds/fruit_slice_3.ogg", "fruit_slice_3",3);
                createjs.Sound.registerSound("./sounds/bomb_fuse.ogg", "bomb_fuse");
                createjs.Sound.registerSound("./sounds/boing_fruit.ogg", "boing_fruit");
                createjs.Sound.registerSound("./sounds/combo.ogg", "combo");
        }else{
                createjs.Sound.alternateExtensions = ["ogg"];
                createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));

                createjs.Sound.registerSound("./sounds/click.mp3", "click");
                createjs.Sound.registerSound("./sounds/gameover.mp3", "gameover");
                createjs.Sound.registerSound("./sounds/soundtrack.mp3", "soundtrack");
                createjs.Sound.registerSound("./sounds/explosion.mp3", "explosion");
                createjs.Sound.registerSound("./sounds/fruit_slice_1.mp3", "fruit_slice_1",3);
                createjs.Sound.registerSound("./sounds/fruit_slice_2.mp3", "fruit_slice_2",3);
                createjs.Sound.registerSound("./sounds/fruit_slice_3.mp3", "fruit_slice_3",3);
                createjs.Sound.registerSound("./sounds/bomb_fuse.mp3", "bomb_fuse");
                createjs.Sound.registerSound("./sounds/boing_fruit.mp3", "boing_fruit");
                createjs.Sound.registerSound("./sounds/combo.mp3", "combo");
        }
        
        RESOURCE_TO_LOAD += 9;
        
    };

    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("gameover_bg","./sprites/gameover_bg.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("help_bg","./sprites/help_bg.png");
        s_oSpriteLibrary.addSprite("hit_area","./sprites/hit_area.png");
        s_oSpriteLibrary.addSprite("bomb","./sprites/bomb.png");
        s_oSpriteLibrary.addSprite("bomb_ray","./sprites/bomb_ray.png");
        s_oSpriteLibrary.addSprite("life","./sprites/life.png");
        s_oSpriteLibrary.addSprite("miss","./sprites/miss.png");
        
        for(var i=0;i<NUM_FRUITS;i++){
            s_oSpriteLibrary.addSprite("fruit_"+i,"./sprites/fruit_"+i+".png");
            s_oSpriteLibrary.addSprite("stain_"+i,"./sprites/stain_"+i+".png");
        }
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        _oPreloader.refreshLoader(iPerc);
        
        if(_iCurResource === RESOURCE_TO_LOAD){
            _oPreloader.unload();
            
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                s_oSoundTrack = createjs.Sound.play("soundtrack",{ loop:-1,volume:SOUNDTRACK_VOLUME});
            }

            this.gotoMenu();
        }
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };

    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };

    this.gotoGame = function(){
        _oGame = new CGame(_oData);   
							
        _iState = STATE_GAME;
        
        $(s_oMain).trigger("game_start");
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelpPanel();
        _iState = STATE_HELP;
    };
	
    this.stopUpdate = function(){
        _bUpdate = false;
    };

    this.startUpdate = function(){
            _bUpdate = true;
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
        
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);

    };
    
    s_oMain = this;
    
    _oData = oData;
    
    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oCanvas;
var s_oSpriteLibrary;
var s_oSoundTrack;