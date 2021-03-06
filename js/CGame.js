function CGame(oData){
    var _bUpdate = false;
    var _bMouseIsDown;
    var _bLineRemoving;
    var _iScore;
    var _iMouseX;
    var _iMouseY;
    var _iLives;
    var _iMaxSimultaneousFruits;
    var _iTimeFruitOccurence;
    var _iTimeElaps;
    var _iTimeDrawElaps;
    var _iTimeComboElaps;
    var _iFruitsSliced;
    var _iFruitSlicedInCombo;
    var _aActiveFruits = new Array();
    var _aFruitsToRemove = new Array();
    var _aLinesDraw;
    var _aStartX;
    var _oFirstPoint;
    var _oLastPt;
    var _oComboPt;
    var _oAttachMatrix;
    var _oAttachStain;
    var _oAttachFruit;
    var _oGameOverSfx;
    
    var _oLineShape = null;
    var _oBg;
    var _oHitArea;
    var _oInterface;
    var _oEndPanel = null;
    var _oHelp;
    
    this._init = function(){
        
        _iScore = 0;
        _iFruitsSliced = 0;
        _iFruitSlicedInCombo = 0;
        _iLives = NUM_LIVES;
        _iTimeElaps = _iTimeFruitOccurence = OCCURENCE_FRUIT;
        _iMaxSimultaneousFruits = STARTING_SIMULTANEOUS_FRUITS;
        _iTimeComboElaps = 0;
                
        _oBg = new createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(_oBg);
        
        _oAttachStain = new createjs.Container();
        s_oStage.addChild(_oAttachStain);
        
        _oAttachFruit = new createjs.Container();
        s_oStage.addChild(_oAttachFruit);
        
        _oAttachMatrix = new createjs.Container();
        s_oStage.addChild(_oAttachMatrix);
        
        _oLineShape = new createjs.Shape();
        _oAttachMatrix.addChild(_oLineShape);
        
        //TOUCH EVENTS
        if(s_bMobile) {
            //IE BROWSER
            if (window.navigator.msPointerEnabled) {
                s_oCanvas.addEventListener("MSPointerDown", this.onTouchStartMS, false);
                s_oCanvas.addEventListener("MSPointerMove", this.onTouchMoveMS, false);
                s_oCanvas.addEventListener("MSPointerUp", this.onTouchEndMS, false);
            }else{
                s_oCanvas.addEventListener( 'touchstart', this.onTouchStart, false );
                s_oCanvas.addEventListener( 'touchmove', this.onTouchMove, false );
                s_oCanvas.addEventListener( 'touchend', this.onTouchEnd, false );
            }
        }else{
            _oHitArea = new CHitArea(CANVAS_WIDTH/2,CANVAS_HEIGHT/2,s_oSpriteLibrary.getSprite('hit_area'));
            _oHitArea.addEventListener(ON_MOUSE_DOWN, this._onMouseDown, this); 
            _oHitArea.addEventListener(ON_MOUSE_UP, this._onMouseUp, this);
            _oHitArea.addEventListener(ON_MOUSE_OUT, this._onMouseOut, this);
            _oHitArea.addEventListener(ON_PRESS_MOVE, this._onMouseMoving, this);
        }
		
        _oInterface = new CInterface();
        _oEndPanel = CEndPanel();
        
        _oHelp = new CHelpPanel();
        
        _aStartX = new Array();
        var iRange = Math.floor(CANVAS_WIDTH/30);
        var iCurX = 20;
        while(iCurX < CANVAS_WIDTH-20){
            _aStartX.push(iCurX);
            iCurX += iRange;
        }
        
        _aLinesDraw = new Array();
        _bMouseIsDown = false;
        _bLineRemoving = false;
    };
    
    this.unload = function(){
        if(s_bMobile) {
            //IE BROWSER
            if (window.navigator.msPointerEnabled) {
                s_oCanvas.removeEventListener("MSPointerDown", this.onTouchStartMS, false);
                s_oCanvas.removeEventListener("MSPointerMove", this.onTouchMoveMS, false);
                s_oCanvas.removeEventListener("MSPointerUp", this.onTouchEndMS, false);
            }else{
                s_oCanvas.removeEventListener( 'touchstart', this.onTouchStart, false );
                s_oCanvas.removeEventListener( 'touchmove', this.onTouchMove, false );
                s_oCanvas.removeEventListener( 'touchend', this.onTouchEnd, false );
            }
        }else{
            _oHitArea.unload();
        }
        
        if(_oEndPanel){
            _oEndPanel.unload();
        }
        _oInterface.unload();
        
        s_oStage.removeAllChildren();  
    };
    
    this.exitFromHelp = function(){
        _bUpdate=true;
    };
    
    this.loseLife = function(oFruitMissed){
        var oSprite = s_oSpriteLibrary.getSprite('miss');
        var oMiss = createBitmap(oSprite);
        oMiss.alpha = 0;
        oMiss.x = oFruitMissed.getX();
        oMiss.y = CANVAS_HEIGHT - oSprite.height;
        oMiss.regX = oSprite.width/2;
        _oAttachMatrix.addChild(oMiss);
        
        if(oMiss.x < 0 ){
                oMiss.x = oSprite.width/2;
        }else if(oMiss.x > CANVAS_WIDTH){
                oMiss.x = CANVAS_WIDTH - oSprite.width/2;
        }
		
        createjs.Tween.get(oMiss).to({alpha:1}, 500).call(function(){
                                                    createjs.Tween.get(oMiss).wait(1500).to({alpha:0}, 500);
                                                }); 
                
        _iLives--;
        _oInterface.loseLife(_iLives);
        if(_iLives === 0){
            this.gameOver();
        }
    };

    this.gameOver = function(){  
        _bUpdate=false;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oParent = this;
            _oGameOverSfx = createjs.Sound.play("gameover");
            _oGameOverSfx.addEventListener("complete", oParent.gameOVerSfxComplete);
            s_oSoundTrack.setVolume(0);
        }
        
        this.removeAllLines();
        
        _oEndPanel.show(_iScore);
    };
    
    this.gameOVerSfxComplete = function(){
         s_oSoundTrack.setVolume(SOUNDTRACK_VOLUME);
    };
    
    this.showCombo = function(){
         if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            createjs.Sound.play("combo");
        }
        
        var iAmount = COMBO_TWO_FRUIT*_iFruitSlicedInCombo;
        _iScore += iAmount;
        _oInterface.refreshScore(_iScore);
        
        var oFade = new createjs.Shape();
        oFade.alpha = 0;
        oFade.graphics.beginFill("#fffC00").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oAttachMatrix.addChild(oFade);
        
        createjs.Tween.get(oFade).to({alpha:0.8}, 200).call(function(){
                                                    createjs.Tween.get(oFade).to({alpha:0}, 200).call(function(){_oAttachMatrix.removeChild(oFade);});
                                                });   
        
        var iRand = Math.floor(Math.random() * s_aFruitColors.length) ;
        
        var oComboText = new createjs.Text(TEXT_COMBO+"\n+"+iAmount,"60px katanaregular", s_aFruitColors[iRand]);
        oComboText.alpha = 0;
        oComboText.x = _oComboPt.x;
        oComboText.y = _oComboPt.y; 
        oComboText.shadow = new createjs.Shadow("#000", 2, 2, 2);
        oComboText.textAlign = "center";
        oComboText.textBaseline = "middle";
        _oAttachFruit.addChild(oComboText);
        
        createjs.Tween.get(oComboText).to({alpha:1}, 500).call(function(){
                                                    createjs.Tween.get(oComboText).wait(1500).to({alpha:0}, 500);
                                                }); 
    };
    
    this.launchFruit = function(){
        var iRandNum = Math.random() * (_iMaxSimultaneousFruits - 1) + 1;
        for(var i=0;i<iRandNum;i++){
            var iRandX = Math.floor(Math.random() * _aStartX.length);
            var iRandFruit = Math.floor(Math.random() * s_aFruitSpriteSheet.length) ;
            
            var oObject;
            if(iRandFruit === BOMB_SYMBOL){
                //ATTACH BOMB
                oObject = new CBomb(_aStartX[iRandX],Y_START_FRUIT,s_aFruitSpriteSheet[iRandFruit],s_aFruitSize[iRandFruit],s_aFruitSpeed[iRandFruit],iRandFruit,_oAttachFruit);
            }else{
                oObject = new CFruit(_aStartX[iRandX],Y_START_FRUIT,s_aFruitSpriteSheet[iRandFruit],s_aFruitSize[iRandFruit],s_aFruitSpeed[iRandFruit],iRandFruit,_oAttachFruit);  
            }
            _aActiveFruits.push(oObject);  
            //alert("_aStartX["+iRandX+"]: "+_aStartX[iRandX]);
        }
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oIdleSfx = createjs.Sound.play("boing_fruit");
        }
    };

    this.onExit = function(){
        this.unload();
        s_oMain.gotoMenu();
        
        $(s_oMain).trigger("restart");
    };

    //start drawing
    this._onMouseDown = function(oParam) {
        if ( _bMouseIsDown === true ){
                return;
        }
        _bMouseIsDown = true;
        _iTimeDrawElaps = 0;

        var e = oParam.event;
        if(!e){ e = window.event; }
        _iMouseX = e.stageX;
        _iMouseY = e.stageY;

        // set up the first point in the new draw
        _oLastPt = _oFirstPoint = {x:e.stageX,y:e.stageY};

        // clear the cache, so the vector data is drawn each tick:
        _oLineShape.uncache();
        _oLineShape.graphics.setStrokeStyle(10,"round",0,0).beginStroke("#fff");
        _oLineShape.graphics.moveTo(_oLastPt.x,_oLastPt.y);
    };

    //stop drawing
    this._onMouseUp = function() {
        _bMouseIsDown = false;
        _bLineRemoving = false;
        _oLineShape.graphics.clear();	
        _oLineShape.cache(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    };

    //update mouse positions
    this._onMouseMoving = function(oParam) {
        var e = oParam.event;
        if(!e){ e = window.event; }
        
        _iMouseX = e.stageX;
        _iMouseY = e.stageY;
        
    };
    
    this._onMouseOut = function(){
        if(_bMouseIsDown){
            this._onMouseUp();
        }
    };
	
    this.onTouchStart = function(event){
        _bMouseIsDown = true;
        _iTimeDrawElaps = 0;

        _iMouseX = parseInt((event.touches[0].pageX -s_oCanvasLeft)/ s_iScaleFactor);
        _iMouseY = parseInt((event.touches[0].pageY-s_oCanvasTop) / s_iScaleFactor);

        // set up the first point in the new draw, and choose a random color:
        _oLastPt = _oFirstPoint = {x:_iMouseX,y:_iMouseY};

        // clear the cache, so the vector data is drawn each tick:
        _oLineShape.uncache();
        _oLineShape.graphics.setStrokeStyle(10,"round",0,0).beginStroke("#fff");
        _oLineShape.graphics.moveTo(_oLastPt.x,_oLastPt.y);
    };
	
    this.onTouchMove = function(event){
        event.preventDefault(); 

        _iMouseX = parseInt((event.touches[0].pageX  -s_oCanvasLeft) / s_iScaleFactor);
        _iMouseY = parseInt((event.touches[0].pageY -s_oCanvasTop) / s_iScaleFactor);
    };
	
    this.onTouchEnd = function(event){
        _bMouseIsDown = false;
        _bLineRemoving = false;
        _oLineShape.graphics.clear();	
        _oLineShape.cache(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    };
    
    this.onTouchStartMS = function(event){
        if (window.navigator.msPointerEnabled && !event.isPrimary){
                return;
        }
         
        _bMouseIsDown = true;
        _iTimeDrawElaps = 0;
        
        //alert("POS: "+(event.screenX || event.targetTouches[0].screenX)+","+(event.screenY || event.targetTouches[0].screenY));
       
        _iMouseX = parseInt(((event.pageX || event.targetTouches[0].pageX) -s_oCanvasLeft )/ s_iScaleFactor);
        _iMouseY = parseInt(((event.pageY || event.targetTouches[0].pageY) -s_oCanvasTop)/ s_iScaleFactor);
        
        //alert("TOUCH: "+event.pageX+","+event.pageY);

        // set up the first point in the new draw, and choose a random color:
        _oLastPt = _oFirstPoint = {x:_iMouseX,y:_iMouseY};

        // clear the cache, so the vector data is drawn each tick:
        _oLineShape.uncache();
        _oLineShape.graphics.setStrokeStyle(10,"round",0,0).beginStroke("#fff");
        _oLineShape.graphics.moveTo(_oLastPt.x,_oLastPt.y);
    };
	
    this.onTouchMoveMS = function(event){
        if (window.navigator.msPointerEnabled && !event.isPrimary){
                return;
        }
        
        event.preventDefault(); 

        _iMouseX = parseInt(((event.pageX || event.targetTouches[0].pageX)-s_oCanvasLeft) / s_iScaleFactor);
        _iMouseY = parseInt(((event.pageY || event.targetTouches[0].pageY)-s_oCanvasTop) / s_iScaleFactor);
        
    };
	
    this.onTouchEndMS = function(event){
        _bMouseIsDown = false;
        _bLineRemoving = false;
        _oLineShape.graphics.clear();	
        _oLineShape.cache(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
    };
    
    this.showExplosion = function(){
        var oFade = new createjs.Shape();
        oFade.alpha = 0;
        oFade.graphics.beginFill("#fff").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oAttachMatrix.addChild(oFade);
        
        createjs.Tween.get(oFade).to({alpha:1}, 1000).call(function(){
                                                    s_oGame.gameOver();
                                                    _oAttachFruit.removeAllChildren();
                                                    createjs.Tween.get(oFade).to({alpha:0}, 1500).call(function(){_oAttachMatrix.removeChild(oFade);});
                                                });   
    };
    
    this.bombExplosion = function(iIndex){
        _aActiveFruits[iIndex].explode();
    };
    
    this.assignScore = function(vPos,iType){
        new CStain(vPos.getX(),vPos.getY(),iType,_oAttachStain);
        
        new CWinText(vPos.getX(),vPos.getY(),s_aFruitScore[iType],s_aFruitColors[iType]);
        _iScore += s_aFruitScore[iType];
        _oInterface.refreshScore(_iScore);
        
        _iFruitsSliced++;
        if((_iFruitsSliced%FRUIT_TO_CUT_FOR_LEVEL_UP) === 0){
            //INCREASE DIFFICULTY
            _iMaxSimultaneousFruits++;
            if(_iMaxSimultaneousFruits > MAX_SIMULTANEOUS_FRUITS){
                _iMaxSimultaneousFruits = MAX_SIMULTANEOUS_FRUITS;
            }
        }
        
        _iFruitSlicedInCombo++;
        _oComboPt = {x:vPos.getX(),y:vPos.getY()};
    };
    
    this.removeSlices = function(oFruit){
        for(var i=0;i<_aActiveFruits.length;i++){
            if(_aActiveFruits[i] === oFruit){
                _aFruitsToRemove.push(oFruit);
            }
        }  
    };
    
    this.removeAllLines = function(){
        for(var iCont=0;iCont<_aLinesDraw.length;iCont++){
            _oAttachMatrix.removeChild(_aLinesDraw[iCont].line);
        }
        
        _aLinesDraw = new Array();
    };

    this.dotProductV2 = function(v1,v2){
        return ( v1.getX()*v2.getX()+ v1.getY()*v2.getY() );
    };
    
    this.distanceV2 = function( v1, v2 ){
        return Math.sqrt( ( (v2.getX()-v1.getX())*(v2.getX()-v1.getX()) ) + ( (v2.getY()-v1.getY())*(v2.getY()-v1.getY()) ) );
    };
    
    this.distance = function( v1, v2 ){
        return  ( (v2.getX()-v1.getX())*(v2.getX()-v1.getX()) ) + ( (v2.getY()-v1.getY())*(v2.getY()-v1.getY()) ) ;
    };
    
    this.closestPointOnLine = function( vA, vB, vPoint ){
        
        var v1 = new CVector2();
        v1.setV(vPoint);
        v1.subV(vA);
        
        var v2 = new CVector2();	
        v2.setV(vB);
        v2.subV(vA);
        v2.normalize();

        var t = this.dotProductV2(v2,v1);

        if ( t <= 0){
                return vA;
        }

        if ( t >= this.distanceV2(vA,vB) ){
                return vB;
        }
        
        v2.scalarProduct(t);
        v2.addV(vA);
        return v2;
    };
    
    this.collideEdgeWithCircle = function( oPointA, oPointB, oCenter,iRadius ){
        var oPt = this.closestPointOnLine( oPointA, oPointB, oCenter );						
        var iDist = this.distanceV2( oCenter, oPt );				
        
        if(iRadius < iDist){
            return false;
        }else{
            return true;
        }
    };
    
    this.getCircleLineIntersectionPoint = function(pointA,pointB, center, radius) {
        var baX = pointB.getX() - pointA.getX();
        var baY = pointB.getY() - pointA.getY();
        var caX = center.getX() - pointA.getX();
        var caY = center.getY() - pointA.getY();

        var a = baX * baX + baY * baY;
        var bBy2 = baX * caX + baY * caY;
        var c = caX * caX + caY * caY - radius * radius;

        var pBy2 = bBy2 / a;
        var q = c / a;

        var disc = pBy2 * pBy2 - q;
        if (disc < 0) {
            return null;
        }
        // if disc == 0 ... dealt with later
        var tmpSqrt = Math.sqrt(disc);
        var abScalingFactor1 = -pBy2 + tmpSqrt;
        var abScalingFactor2 = -pBy2 - tmpSqrt;

        var p1 = new CVector2(pointA.getX() - baX * abScalingFactor1, pointA.getY() - baY * abScalingFactor1);
        if (disc === 0) {
            // abScalingFactor1 == abScalingFactor2
            return new Array(p1);
        }

        var p2 = new CVector2(pointA.getX() - baX * abScalingFactor2, pointA.getY() - baY * abScalingFactor2);
        return new Array(p1, p2);
    };

    this.angleBetweenVectors = function( v1, v2 ){
        var iAngle = Math.acos( this.dotProductV2( v1, v2 ) / (v1.length() * v2.length()) );
        if ( isNaN( iAngle ) === true ){
            return 0;
        }else{
            return iAngle;
        }
    };
    
    this.checkCollisionWithFruit = function(){
        if(_aLinesDraw.length === 0){
            return;
        }
        
        for(var i=0;i<_aActiveFruits.length;i++){
            if(_aActiveFruits[i].isSliced() === false){
                for(var j=0;j<_aLinesDraw.length;j++){
                    if(this.collideEdgeWithCircle(_aLinesDraw[j].start_point,_aLinesDraw[j].end_point,_aActiveFruits[i].getCenter(),_aActiveFruits[i].getRadius()) ){
                        var aRes = this.getCircleLineIntersectionPoint(_aLinesDraw[j].start_point,_aLinesDraw[j].end_point,_aActiveFruits[i].getCenter(),
                                                                                                                                    _aActiveFruits[i].getRadius());
                        var bContinue = true;
                        if(aRes !== null && aRes.length > 1){
                            var oFirstPoint = aRes[0];
                            for(var k=1;k<aRes.length;k++){
                                //trace("CUR DIST: "+this.distance(oFirstPoint,aRes[k]));
                                //trace("getSliceOffset(): "+_aActiveFruits[i].getSliceOffset());
                                if(this.distance(oFirstPoint,aRes[k]) > _aActiveFruits[i].getSliceOffset()){
                                    //CHECK IF IS A BOMB
                                    if(_aActiveFruits[i].getType() === BOMB_SYMBOL){
                                        _bUpdate = false;
                                        this.bombExplosion(i);
                                        return;
                                    }else{
                                        var vDir = new CVector2(aRes[k].getX(),aRes[k].getY());
                                        vDir.subV(oFirstPoint);
                                        var vDirFruit = _aActiveFruits[i].getVectorDir();
                                        //trace("vDirFruit: "+vDirFruit.getX()+","+vDirFruit.getY()+"WITH ROT "+_aActiveFruits[i].getRotation());
                                        var iAngle = this.angleBetweenVectors(vDir,vDirFruit);
                                        //trace("iAngle: "+toDegree(iAngle));
                                        iAngle = toDegree(iAngle);

                                        var vFruitCenter = _aActiveFruits[i].getCenter();
                                        if(iAngle < 30){
                                            _aActiveFruits[i].sliceVertical();
                                        }else if(iAngle <60){

                                            if(vFruitCenter.getX() > aRes[k].getX()){
                                                _aActiveFruits[i].sliceDiagonalLeft();
                                            }else{
                                                _aActiveFruits[i].sliceDiagonalRight();
                                            }
                                        }else if(iAngle < 120){
                                            _aActiveFruits[i].sliceHorizontal();
                                        }else if(iAngle < 150){
                                             if(vFruitCenter.getX() > aRes[k].getX()){
                                                 _aActiveFruits[i].sliceDiagonalRight();
                                            }else{
                                                _aActiveFruits[i].sliceDiagonalLeft();
                                            }
                                        }else{
                                            _aActiveFruits[i].sliceVertical();
                                        }

                                        this.assignScore(_aActiveFruits[i].getCenter(),_aActiveFruits[i].getType());
                                        bContinue = false;
                                    }
                                    
                                    break;
                                }
                            }
                        }
                        if(bContinue === false){
                            break;
                        }
                    }
                }
            }
            
            
            
        }
    };

    this.update = function(){
        if(_bUpdate === false){
            return;
        }

        _iTimeElaps += s_iTimeElaps;
        if(_iTimeElaps > _iTimeFruitOccurence){
            _iTimeElaps = 0;
            this.launchFruit();
        };
       
        _aFruitsToRemove = new Array();
        for(var i=0;i<_aActiveFruits.length;i++){
            _aActiveFruits[i].update();
            if(_aActiveFruits[i].isSliced() === false && _aActiveFruits[i].getY() > Y_START_FRUIT ){
                _aFruitsToRemove.push(_aActiveFruits[i]);
                if(_aActiveFruits[i].getType() !== BOMB_SYMBOL){
                    this.loseLife(_aActiveFruits[i]);
                }
            }
        }
        
        for(var k=0;k<_aFruitsToRemove.length;k++){
            for(var s=0;s<_aActiveFruits.length;s++){
                if(_aFruitsToRemove[k] === _aActiveFruits[s]){
                    _aFruitsToRemove[k].unload();
                    _aActiveFruits.splice(s,1);
                    break;
                }
            }  
        }

        if(_bMouseIsDown) {
            if(_oLastPt.x !== _iMouseX || _oLastPt.y !== _iMouseY){
                _iTimeDrawElaps += s_iTimeElaps;
                if(_iTimeDrawElaps > LINE_DRAW_INTERVAL){
                    _iTimeDrawElaps = 0;
                    _aLinesDraw.push({line:_oLineShape,start_point:new CVector2(_oFirstPoint.x,_oFirstPoint.y),end_point:new CVector2( _oLastPt.x,_oLastPt.y) });
                    
                    _oLineShape = new createjs.Shape();
                    _oAttachMatrix.addChild(_oLineShape);
                    _oLineShape.graphics.setStrokeStyle(10,"round",0,0).beginStroke("#fff");
                    _oLineShape.graphics.moveTo(_oLastPt.x,_oLastPt.y);
                    _oFirstPoint = {x:_oLastPt.x,y:_oLastPt.y};
                }
            }
            
            //REMOVE LINES DRAWN
            if(_aLinesDraw.length >0){
                if(_bLineRemoving === false){
                    _bLineRemoving = true;
                    createjs.Tween.get(_aLinesDraw[0].line).to({alpha:0}, LINE_DRAW_INTERVAL).call(function(){_oAttachMatrix.removeChild(_aLinesDraw[0].line);_aLinesDraw.splice(0,1);_bLineRemoving = false});  
                }
            }

            // calculate the new position in the shape's local coordinate space:
            _oLastPt = {x:_iMouseX,y:_iMouseY};

            // draw the line, and close the path:
            _oLineShape.graphics.lineTo(_oLastPt.x,_oLastPt.y);
	}else {
            if(_aLinesDraw.length >0 && _bLineRemoving === false){
                _bLineRemoving = true;
                var oParent = this;

                for(var iCont=0;iCont<_aLinesDraw.length;iCont++){
                    //trace(iCont+" start: "+_aLinesDraw[iCont].start_point.x+","+_aLinesDraw[iCont].start_point.y+",end: "+_aLinesDraw[iCont].end_point.x+","+_aLinesDraw[iCont].end_point.y);
                    
                    createjs.Tween.get(_aLinesDraw[iCont].line).wait(120).to({alpha:0}, 200).call(function(){
                                                                                                        oParent.removeAllLines();
                                                                                                });  
                }
            }
        }
        
        this.checkCollisionWithFruit();
        
        _iTimeComboElaps += s_iTimeElaps;
        if(_iTimeComboElaps > TIME_FOR_COMBO){
            if(_iFruitSlicedInCombo > 1){
                //WE HAVE A COMBO!
                this.showCombo();
            }
            _iFruitSlicedInCombo = 0;
            _iTimeComboElaps = 0;
        }
    };


    s_oGame=this;
    
    Y_START_FRUIT = oData.fruit_start;
    OCCURENCE_FRUIT = oData.occurence_fruit;
    MAX_FRUIT_ROT_SPEED = oData.max_fruit_rot_speed;
    NUM_LIVES = oData.num_lives;
    STARTING_SIMULTANEOUS_FRUITS = oData.start_sim_fruit;
    MAX_SIMULTANEOUS_FRUITS = oData.max_sim_fruits;
    FRUIT_TO_CUT_FOR_LEVEL_UP = oData.fruits_for_level_up;
    TIME_FOR_COMBO = oData.time_for_combo;
    COMBO_TWO_FRUIT = oData.combo_points;
    
    new CFruitSettings();
    
    this._init();
}

var s_oGame;