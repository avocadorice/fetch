var playgroundImage = new Image();
playgroundImage.src = "images/playground.png";
var treeImage = new Image(); 
treeImage.src = "images/tree.png";
var ellenSpriteSheet = new Image();
ellenSpriteSheet.src = "images/ellen_spritesheet.png";
var barneySpriteSheet = new Image();
barneySpriteSheet.src = "images/barney_spritesheet.png";
var mochiSpriteSheet = new Image();
mochiSpriteSheet.src = "images/mochi_spritesheet.png";
var ballImage = new Image();
ballImage.src = "images/tennis_ball_tiny.png";
ballTossed = false;
var afterToss;
var mochiIsRunning = false, barneyIsRunning = false;
var ballClickedPosX, ballClickedPosY; // position destination of ball
var ballStartPosX, ballStartPosY;
var vx, vy;
t = 0; // time
t_mochi = {currentElapsed:0, total:0}, t_barney = {currentElapsed:0, total:0};
var v_mochi = {x:130, y:130}, v_barney = {x:100, y:100};
bezierX = 150;  
bezierY = 200;
var ellenThrowing;
// this line was added on github web interface.
// so was this line...
// this line added locally.
//

function onLoad() {
    //sound
    var bmg = new buzz.sound( "sound/birds_chirp3", {
        formats: [ "wav" ]
    });
    bmg.setSpeed(0.8);
    bmg.setVolume(80);
    //bmg.play().loop();        

    var stage = new Kinetic.Stage({
      container: "container",
      width: 600,
      height: 440
    });
    
    var layer = new Kinetic.Layer();
    
    var playground = new Kinetic.Image({
        image: playgroundImage,
        x: 0,
        y: 0
    });
    
    var tree = new Kinetic.Path({
      x: 37,
      y: 134,
      data: "m 12.67732,86.189099 0.316933,13.945051 8.240257,15.21278 11.092655,9.82493 13.311185,5.38786 8.557191,2.53546 -6.021727,42.46902 -3.803196,35.4965 0.316933,21.86837 23.769974,-0.31693 13.945052,8.24026 10.775722,-5.38786 -0.633866,-52.92781 -2.535464,-1.9016 -1.267732,-51.02621 1.901598,-8.24026 7.923324,0.31693 2.535461,3.8032 16.48052,-0.63387 3.16933,-2.53546 6.02173,-0.9508 9.50798,-5.07093 11.09266,-11.40959 6.65559,-19.966773 2.8524,-0.633866 1.26773,-11.726521 -1.9016,-10.775721 -2.21853,-4.120129 0.31694,-5.387861 -6.6556,-11.092655 -11.40959,-10.775721 -3.48626,-0.316933 -11.40959,-6.021727 -12.99425,-0.950799 0,-3.486263 L 97.932293,7.5897175 80.184046,0.30025882 l -19.332912,0 -7.289459,3.80319588 -9.50799,5.0709278 -4.120128,5.0709275 -18.065181,6.33866 -9.507989,7.923325 -9.5079901,14.261984 -1.90159794,12.994253 0,13.311185 6.65559274,11.409588 z",
      fill: {
        image: treeImage,
        offset: [0, 0]
      }
    });

    
    playground.on("mousemove", function() {
        if($('.speech1Left').is(":visible")  || $('.speech2Left').is(":visible") ||
           $('.speech1Right').is(":visible") ||$('.speech2Right').is(":visible")) return;
        if(ellen.getAnimation() != 'idleWithBall') return;
        if(barneyIsRunning || barney.getAnimation() == 'pick' || mochiIsRunning || mochi.getAnimation() == 'idleWithBall') return;        
      
        ellen.adjustFacing();
    });
    
    playground.on("click", function() {
        console.log(stage.getMousePosition().x + "," + stage.getMousePosition().y);
        if(mochiIsRunning || barneyIsRunning || ballTossed || afterToss) return;
        if(ellen.getAnimation() != 'idleWithBall') return;
        
        var mousePos = stage.getMousePosition();            
        var pix = this.getContext('2d').getImageData(mousePos.x, mousePos.y, 1, 1).data;
        if(pix[2] != 0) return;
        
        // ellen throws the ball
        setTimeout(function() { ellen.swoosh.play(); }, 400);
        ellenThrowing = true;
        ellen.setAnimation('throwing');
        ellen.afterFrame(1, function() {
            ellen.setAnimation('idle');
            ellenThrowing = false;
            
            // ball
            ball.show();
            ballClickedPosX = mousePos.x;
            ballClickedPosY = mousePos.y;
            ballStartPosX = ball.getX();
            ballStartPosY = ball.getY();
            var bounceDistX = 0.15 * (ballClickedPosX - ballStartPosX); // ball will bounce 15% of the X distance travelled in the air
            ballEndPosX = ballClickedPosX + bounceDistX;
            ballEndPosY = ballClickedPosY;                

            if(ballStartPosX < ballClickedPosX) {
                bezierX = (ballClickedPosX - ballStartPosX) / 2 + ballStartPosX;
                ball.direction = 'e';
            }
            else {
                bezierX = (ballStartPosX - ballClickedPosX) / 2 + ballClickedPosX;
                ball.direction = 'w';
            }
            bezierY = 0;                         
            t = 0;
            ballTossed = true;
            
            // barney
            barneyStartPosX = barney.getCenterX();
            barneyStartPosY = barney.getY();
            if(barneyStartPosX > ballEndPosX) { // barney runs left
                barney.face('l');
                barneyStartPosX = barney.getCenterX() + barneyAnim['idle'][0].width / 2;
                barneyEndPosX = ballEndPosX + barneyAnim['idle'][0].width;
            }    
            else {
                barney.face('r');
                barneyStartPosX = barney.getCenterX() - barneyAnim['idle'][0].width / 2;                    
                barneyEndPosX = ballEndPosX - barneyAnim['idle'][0].width;
            }
            barneyEndPosY = ballEndPosY - barneyAnim['idle'][0].height / 2;                
            barney.setAnimation('run');
            barney.start();
            // time = distance / velocity
            t_barney.x = Math.abs(barneyStartPosX - barneyEndPosX) / v_barney.x;
            t_barney.y = Math.abs(barneyStartPosY - barneyEndPosY) / v_barney.y;
            t_barney.total = Math.sqrt(t_barney.x*t_barney.x + t_barney.y*t_barney.y);
            barneyIsRunning = true;
            barney.runThruGrass.play().loop();
        
            // mochi
            mochiStartPosX = mochi.getCenterX();
            mochiStartPosY = mochi.getY();

            if(mochiStartPosX > ballEndPosX) { // mochi runs left
                mochi.face('l');
                mochiStartPosX = mochi.getCenterX() + mochiAnim['idle'][0].width / 2;
                mochiEndPosX = ballEndPosX + mochiAnim['idle'][0].width;              
            }
            else {    
                mochi.face('r');
                mochiStartPosX = mochi.getCenterX() - mochiAnim['idle'][0].width / 2;                    
                mochiEndPosX = ballEndPosX - mochiAnim['idle'][0].width;
            }             
            mochiEndPosY = ballEndPosY - mochiAnim['idle'][0].height / 2;
            mochi.setAnimation('run');
            mochi.start();
            // time = distance / velocity
            t_mochi.x = Math.abs(mochiStartPosX - mochiEndPosX) / v_mochi.x;
            t_mochi.y = Math.abs(mochiStartPosY - mochiEndPosY) / v_mochi.y;
            t_mochi.total = Math.sqrt(t_mochi.x*t_mochi.x + t_mochi.y*t_mochi.y);
            mochiIsRunning = true;
            mochi.runThruGrass.play().loop();
            
        });            
    });
    
    var ellenAnim = {
      idle: [{
        x: 0,
        y: 0,
        width: 51,
        height: 146
      }],
      throwing: [{
        x: 53,          
        y: 0,
        width: 85,
        height: 120
      },{
        x: 53 + 85 + 1,          
        y: 0,
        width: 85,
        height: 120
      }],
      idleWithBall: [{
        x: 1,          
        y: 150,
        width: 51,
        height: 146
      }],
      sit: [{
        x: 84 + 80,          
        y: 300,
        width: 85,
        height: 150
      }],
      hurray: [{
        x: 84,          
        y: 300,
        width: 85,
        height: 150      
      },{
        x: 0,          
        y: 300,
        width: 85,
        height: 150
      }]                          
    }
    
    var barneyAnim = {
      idle: [{
        x: 0,
        y: 167,
        width: 58,
        height: 167
      }],
      run: [{
        x: 58,          
        y: 167,
        width: 94,
        height: 150
      },{
        x: 58 + 94 + 2,
        y: 167,
        width: 113,
        height: 150
      },{
        x: 58 + 94 + 113 + 3,
        y: 167,
        width: 130,
        height: 150
      },{
        x: 58 + 94 + 113 + 3 + 130,
        y: 167,
        width: 120,
        height: 150
      },{
        x: 58 + 94 + 113 + 3 + 130 + 120,
        y: 167,
        width: 120,
        height: 150
      },{
        x: 58 + 94 + 113 + 3 + 130 + 120 + 123,
        y: 167,
        width: 180,
        height: 150
      }],
      runWithBall: [{
        x: 58,          
        y: 0,
        width: 94,
        height: 150
      },{
        x: 58 + 94 + 3,
        y: 0,
        width: 113,
        height: 150
      },{
        x: 58 + 94 + 113 + 3,
        y: 0,
        width: 130,
        height: 150
      },{
        x: 58 + 94 + 113 + 3 + 130,
        y: 0,
        width: 120,
        height: 150
      },{
        x: 58 + 94 + 113 + 3 + 130 + 120,
        y: 0,
        width: 120,
        height: 150
      },{
        x: 58 + 94 + 113 + 3 + 130 + 120 + 123,
        y: 0,
        width: 180,
        height: 150
      }],      
      pick: [
//           {
//             x: 0,
//             y: 340,
//             width: 90,
//             height: 120
//           },
      {
        x: 89,
        y: 340,
        width: 90,
        height: 120         
      }]
    }
    
    var mochiAnim = {
      idle: [{
        x: 0,
        y: 0,
        width: 90,
        height: 70
      }],
      run: [ {
        x: 91,
        y: 284,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 284,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 213,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 213,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 142,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 142,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 71,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 71,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 0,
        width: 90,
        height: 70
      }],
      idleWithBall: [{
        x: 0,
        y: 360,
        width: 90,
        height: 70
      }],
      runWithBall: [{
        x: 91,
        y: 284+363,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 284+363,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 213+363,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 213+363,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 142+363,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 142+363,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 71+363,
        width: 90,
        height: 70
      }, {
        x: 0,
        y: 71+363,
        width: 90,
        height: 70
      }, {
        x: 91,
        y: 363,
        width: 90,
        height: 70
      }]
    };
    
    var ball = new Kinetic.Image({
        image: ballImage,
        x: playgroundImage.width / 2 - ballImage.width / 2,
        y: playgroundImage.height / 2 - ballImage.height / 2,
        offset: [ballImage.width / 2, ballImage.width / 2]
    });
    // initially ellen holds ball
    ball.hide();

    layer.add(playground);
    stage.add(layer);
    
    var ellen = new Kinetic.Sprite({
        x: playgroundImage.width / 2 - ellenAnim['idle'][0].width / 2,
        y: playgroundImage.height / 2 - ellenAnim['idle'][0].height / 2,
        image: ellenSpriteSheet,
        animation: 'idleWithBall',
        animations: ellenAnim,
        frameRate: 2
    });
    
    ellen.adjustFacing = function() {
        var mousePos = stage.getMousePosition();
        if(mousePos == null) return;
        var x = mousePos.x;
        var y = mousePos.y;

        if(x < playgroundImage.width/2) {
            if(ellen.curFacing == 'l') return; // already facing left, no need to re-draw
            
            ellen.curFacing = 'l'; // face left
            ellen.setScale(-Math.abs(ellen.getScale().x), ellen.getScale().y);
            ellen.setX(playgroundImage.width / 2 + ellenAnim[ellen.getAnimation()][0].width / 2 - 10);
        }
        else if(x >= playgroundImage.width/2) {
            if(ellen.curFacing == 'r') return; // already facing right, no need to re-draw
            
            ellen.curFacing = 'r'; // face right
            ellen.setScale(Math.abs(ellen.getScale().x), ellen.getScale().y);
            ellen.setX(playgroundImage.width / 2 - ellenAnim[ellen.getAnimation()][0].width / 2);
        }
        //reorderSprites([ellen, barney, mochi, ball]);
    }
    
    ellen.swoosh = new buzz.sound("sound/swoosh", {
        formats: [ "wav" ]
    });  

    // get position for barney and mochi so they stand on grass only
    getRandomPosition = function() {        
        while(true) {
            var x = Math.round(Math.random() * playgroundImage.width);
            var y = Math.round(Math.random() * playgroundImage.height / 2 + playgroundImage.height / 2 + 70);
            var pix = playground.getContext('2d').getImageData(x, y, 1, 1).data;
            if(pix[2] == 0)
                break;
        }
        return [x, y];
    }
    
    var start = getRandomPosition();
    console.log(start);
    var barney = new Kinetic.Sprite({
        x: start[0],
        y: start[1] - barneyAnim['idle'][0].height,
        image: barneySpriteSheet,
        animation: 'idle',
        animations: barneyAnim,
        frameRate: 8
    });     
    
    var start = getRandomPosition();
    console.log(start);        
    var mochi = new Kinetic.Sprite({
        x: start[0],
        y: start[1] - mochiAnim['idle'][0].height,
        image: mochiSpriteSheet,
        animation: 'idle',
        animations: mochiAnim,
        frameRate: 20
    });
    
    layer.add(ellen);                
    ellen.start(); //note: only place we call this (ellen is always animated)        
    layer.add(barney);
    layer.add(mochi);
    layer.add(ball);

    // one revolution per seconds
    var angularSpeed = 2 * Math.PI;
    var anim = new Kinetic.Animation({
      func: function(frame) {
        var angleDiff = frame.timeDiff * angularSpeed / 500;

        if(barneyIsRunning) {
            if(t_barney.currentElapsed >= t_barney.total) {
                //check if faster than mochi
                if(mochiIsRunning) {
                    //mochi doesn't need to run anymore
                    mochiIsRunning = false;
                    mochi.runThruGrass.stop();
                    mochi.setAnimation('idle');
                    mochi.stop();
                    t_mochi.currentElapsed = 0;                

                    barney.setAnimation('pick');
                    barneyIsRunning = false;
                    barney.runThruGrass.stop();

//                         barney.afterFrame(1, function() { // '2' meaning after 3 frames, '1' meaning after 2 frames, '0' meaning after 1 frame, etc...
                        //stand for .5 secs
                    setTimeout(function() {
                        //run back to ellen
                        barneyStartPosX = barney.getCenterX();
                        barneyStartPosY = barney.getY();
                        barneyEndPosX = playgroundImage.width / 2;
                        barneyEndPosY = playgroundImage.height / 2 - barneyAnim['idle'][0].height / 2;
                        if(barneyStartPosX > barneyEndPosX) {
                            barney.face('l');
                            barneyStartPosX = barney.getX();
                            barneyEndPosX += (barneyAnim['idle'][0].width);  
                        }
                        else {             
                            barney.face('r');
                            barneyStartPosX = barney.getX();
                            barneyEndPosX -= (barneyAnim['idle'][0].width + 5);
                        }  
                        
                        t_barney.currentElapsed = 0;
                        t_barney.x = Math.abs(barneyStartPosX - barneyEndPosX) / v_barney.x;
                        t_barney.y = Math.abs(barneyStartPosY - barneyEndPosY) / v_barney.y;
                        t_barney.total = Math.sqrt(t_barney.x*t_barney.x + t_barney.y*t_barney.y);                      
                        
                        barney.setAnimation('runWithBall');
                        //barney.start();
                        barneyIsRunning = true;
                        barney.runThruGrass.play().loop();
                    }, 500);
             
                    //prevent ball from being drawn
                    ball.hide();
                }
                //finish running back to ellen
                else {
                    barneyIsRunning = false;
                    barney.runThruGrass.stop();
                    barney.setAnimation('idle');
                    barney.stop();
                    t_barney.currentElapsed = 0;
                    
                    ball.setPosition(playgroundImage.width / 2 - ballImage.width / 2, playgroundImage.height / 2 - ballImage.height / 2);
                    ball.adjustScale();
                    reorderSprites([barney, ellen, mochi, ball]);
                    ellen.setAnimation('hurray');

                    if(barney.curFacing == 'r') {
                        ellen.setX(ellen.getX() + 20);             
                        $('.speech1Left').show();
                        setTimeout(function() { 
                            $('.speech1Left').hide(); 
                            ellen.setAnimation('idleWithBall');
                            ellen.setX(ellen.getX() - 20);
                            ellen.adjustFacing();
                        }, 3000);
                    }
                    else {
                        ellen.setX(ellen.getX() - 20);                   
                        $('.speech1Right').show();
                        setTimeout(function() { 
                            $('.speech1Right').hide();
                            ellen.setAnimation('idleWithBall');
                            ellen.setX(ellen.getX() + 20);
                            ellen.adjustFacing();              
                        }, 3000);                      
                    }                  
                }
            }
            else {
                
                posX = (barneyStartPosX > barneyEndPosX) 
                    ? barneyStartPosX - (t_barney.currentElapsed / t_barney.total) * (barneyStartPosX - barneyEndPosX) 
                    : barneyStartPosX + (t_barney.currentElapsed / t_barney.total) * (barneyEndPosX - barneyStartPosX);
                posY = (barneyStartPosY > barneyEndPosY) 
                    ? barneyStartPosY - (t_barney.currentElapsed / t_barney.total) * (barneyStartPosY - barneyEndPosY) 
                    : barneyStartPosY + (t_barney.currentElapsed / t_barney.total) * (barneyEndPosY - barneyStartPosY);
                barney.setPosition(posX, posY);
                barney.adjustScale();
                reorderSprites([barney, ellen, mochi, ball]);
                t_barney.currentElapsed += frame.timeDiff / 1000;
            }         
        }

        if(mochiIsRunning) {
            if(t_mochi.currentElapsed >= t_mochi.total) { //caught the ball
                 //barney doesn't need to run anymore
                if(barneyIsRunning) {
                    //stop barney
                    barneyIsRunning = false;
                    barney.runThruGrass.stop();
                    barney.setAnimation('idle');
                    barney.stop();
                    t_barney.currentElapsed = 0;
                    
                    mochi.setAnimation('idleWithBall');
                    mochi.stop();
                    mochiIsRunning = false;
                    mochi.runThruGrass.stop();                    
                    //stand for .5 secs
                    setTimeout(function() {
                        //run back to ellen
                        mochiStartPosX = mochi.getCenterX();
                        mochiStartPosY = mochi.getY();
                        mochiEndPosX = playgroundImage.width / 2;
                        mochiEndPosY = playgroundImage.height / 2 - 25;
                        if(mochiStartPosX > mochiEndPosX) {
                            mochi.face('l');
                            mochiStartPosX = mochi.getX();
                            mochiEndPosX += (mochiAnim['idle'][0].width - 30);                             
                        }
                        else {             
                            mochi.face('r');
                            mochiStartPosX = mochi.getX();
                            mochiEndPosX -= (mochiAnim['idle'][0].width - 15);                        
                        }  
                        
                        t_mochi.currentElapsed = 0;
                        t_mochi.x = Math.abs(mochiStartPosX - mochiEndPosX) / v_mochi.x;
                        t_mochi.y = Math.abs(mochiStartPosY - mochiEndPosY) / v_mochi.y;
                        t_mochi.total = Math.sqrt(t_mochi.x*t_mochi.x + t_mochi.y*t_mochi.y);                      
                        
                        mochi.setAnimation('runWithBall');
                        mochi.start();
                        mochiIsRunning = true;
                        mochi.runThruGrass.play().loop();                        
                    }, 500);
                    //prevent ball from being drawn
                    ball.hide();
                }
                //finished running back to ellen
                else {
                    mochiIsRunning = false;
                    mochi.runThruGrass.stop();                    
                    mochi.setAnimation('idle');
                    mochi.stop();
                    t_mochi.currentElapsed = 0;  
                    
                    ball.setPosition(playgroundImage.width / 2 - ballImage.width / 2, playgroundImage.height / 2 - ballImage.height / 2);
                    ball.adjustScale();
                    reorderSprites([barney, ellen, mochi, ball]);
                    ellen.setAnimation('sit');
                    ellen.setY(ellen.getY() + 20);
                    if(mochi.curFacing == 'r') {
                        ellen.setX(ellen.getX() + 20);                        
                        $('.speech2Left').show();
                        setTimeout(function() { 
                            $('.speech2Left').hide();
                            ellen.setAnimation('idleWithBall');
                            ellen.setX(ellen.getX() - 20);
                            ellen.adjustFacing();
                            ellen.setY(ellen.getY() - 20);
                        }, 3000);
                    }
                    else {
                        ellen.setX(ellen.getX() - 20);                        
                        $('.speech2Right').show();
                        setTimeout(function() { 
                            $('.speech2Right').hide();
                            ellen.setAnimation('idleWithBall');
                            ellen.setX(ellen.getX() + 20);
                            ellen.adjustFacing();
                            ellen.setY(ellen.getY() - 20);           
                        }, 3000);
                    }
                }
            }
            //running path
            else {  
                posX = (mochiStartPosX > mochiEndPosX) 
                    ? mochiStartPosX - (t_mochi.currentElapsed / t_mochi.total) * (mochiStartPosX - mochiEndPosX) 
                    : mochiStartPosX + (t_mochi.currentElapsed / t_mochi.total) * (mochiEndPosX - mochiStartPosX);
                posY = (mochiStartPosY > mochiEndPosY) 
                    ? mochiStartPosY - (t_mochi.currentElapsed / t_mochi.total) * (mochiStartPosY - mochiEndPosY) 
                    : mochiStartPosY + (t_mochi.currentElapsed / t_mochi.total) * (mochiEndPosY - mochiStartPosY);
                mochi.setPosition(posX, posY);
                mochi.adjustScale();
                reorderSprites([barney, ellen, mochi, ball]);
                t_mochi.currentElapsed += frame.timeDiff / 1000;
            }
        }
        // ball in air
        if(ballTossed) {
            if(t >= 1.0) {
                ballTossed = false;
                afterToss = true;
                t = 0;
                ball.i = 0;
            }
            else {
                var x = (1-t)*(1-t)*ballStartPosX + 2*(1-t)*t*bezierX+t*t*ballClickedPosX;
                var y = (1-t)*(1-t)*ballStartPosY + 2*(1-t)*t*bezierY+t*t*ballClickedPosY;
                t += frame.timeDiff / 500;
                
                ball.setPosition(x, y);
                //ball.setScale(ball.getScale().x, ball.getAdjustedScaleY());
                ball.adjustScale();
                reorderSprites([barney, ellen, mochi, ball]);
            }
            if(ball.direction == 'e')
                ball.rotate(angleDiff);
            else
                ball.rotate(-angleDiff);
        }
        else if(afterToss) {
            if(t >= 1.0) {
                afterToss = false;
            }
            else {
                var ballClickedPosXPlusOffset, afterTossBezierX, afterTossBezierY;
                var bounceDistX = 0.15 * (ballClickedPosX - ballStartPosX); // ball will bounce 15% of the X distance travelled in the air                    
                if(ball.direction == 'e') {
                    ballClickedPosXPlusOffset = ballClickedPosX + bounceDistX;
                    afterTossBezierX = ballClickedPosX + (ballClickedPosXPlusOffset - ballClickedPosX) / 2;
                    ball.rotate(angleDiff / 3);
                }
                else {
                    ballClickedPosXPlusOffset = ballClickedPosX + bounceDistX;
                    afterTossBezierX = ballClickedPosXPlusOffset + (ballClickedPosX - ballClickedPosXPlusOffset) / 2;
                    ball.rotate(-angleDiff / 3);
                }
                afterTossBezierY = ballClickedPosY - 35;         
                var x = (1-t)*(1-t)*ballClickedPosX + 2*(1-t)*t*afterTossBezierX+t*t*ballClickedPosXPlusOffset;
                var y = (1-t)*(1-t)*ballClickedPosY + 2*(1-t)*t*afterTossBezierY+t*t*ballClickedPosY;
                t += frame.timeDiff / 500;              
                ball.setPosition(x, y);
                ball.adjustScale();
                reorderSprites([barney, ellen, mochi, ball]);
            }
        }
      },
      node: layer
    });

    barney.face = function(dir) {
        if(dir == 'r' && barney.curFacing != 'r') {
            barney.setScale(1, barney.getScale().y);
            barney.setX(barney.getX() - barneyAnim['idle'][0].width);
        }
        else if(dir == 'l' && barney.curFacing != 'l') {
            barney.setScale(-1, barney.getScale().y);
            barney.setX(barney.getX() + barneyAnim['idle'][0].width);            
        }
        barney.curFacing = dir;
    }
    barney.getCenterX = function() {
        var centerX = barney.curFacing == 'r' ? barney.getX() + barneyAnim['idle'][0].width / 2 : barney.getX() - barneyAnim['idle'][0].width / 2;
        console.log(centerX + "," + barney.getX());
        return centerX;
    }
    barney.getCenterY = function() { return barney.getY() + barneyAnim['idle'][0].height / 2; }
    barney.face('r');
    
    barney.runThruGrass = new buzz.sound("sound/barney_running_through_grass", {
        formats: [ "wav" ]
    });

    mochi.face = function(dir) {
        if(dir == 'r' && mochi.curFacing != 'r') {
            mochi.setScale(1, mochi.getScale().y);
            mochi.setX(mochi.getX() - mochiAnim['idle'][0].width);
        }
        else if(dir == 'l' && mochi.curFacing != 'l') {
            mochi.setScale(-1, mochi.getScale().y);
            mochi.setX(mochi.getX() + mochiAnim['idle'][0].width);            
        }
        mochi.curFacing = dir;
    }
    mochi.getCenterX = function() {
        var centerX = mochi.curFacing == 'r' ? mochi.getX() + mochiAnim['idle'][0].width / 2 : mochi.getX() - mochiAnim['idle'][0].width / 2;
        console.log(centerX + "," + mochi.getX());
        return centerX;
    }
    mochi.getCenterY = function() { return mochi.getY() + mochiAnim['idle'][0].height / 2; }
    mochi.face('r');
    
    mochi.runThruGrass = new buzz.sound("sound/mochi_running_through_grass", {
        formats: [ "wav" ]
    });
    
    ellen.curFacing = 'r';
    ellen.face = function(dir) {
        if(dir == 'r' && ellen.curFacing != 'r') {
            ellen.setScale(1, ellen.getScale().y);
            ellen.setX(ellen.getX() - ellenAnim['idle'][0].width);
        }
        else if(dir == 'l' && ellen.curFacing != 'l') {
            ellen.setScale(-1, ellen.getScale().y);
            ellen.setX(ellen.getX() + ellenAnim['idle'][0].width);            
        }
        ellen.curFacing = dir;
    }
    
    $(".speech1Left").hide();
    $(".speech2Left").hide();
    $(".speech1Right").hide();
    $(".speech2Right").hide();
    
    var instructions = new Kinetic.Text({
        x: 100,
        y: 15,
        text: "Throw ball by clicking on any grass area",
        fontSize: 18,
        fontFamily: "Calibri",
        textFill: "green"
    });
    layer.add(instructions);
    setTimeout(function() {
        instructions.transitionTo({
            opacity: 0,
            duration: 1
        });
    }, 5000);
    
    adjustScale = function() {
        var oldSY = this.getScale().y;
        var newSY = (this.getY() + 200) / (playgroundImage.height + 50);
        if(this.getScale().x < 0) this.setScale(-newSY, newSY);
        else this.setScale(newSY);
    }
    
    mochi.adjustScale = barney.adjustScale = ball.adjustScale = ellen.adjustScale = adjustScale;
    
    reorderSprites = function(sprites) {
        layer.remove(tree);
        layer.remove(mochi);
        layer.remove(barney);    
        if(mochi.getY() - 70 > barney.getY()) {
            layer.add(barney);
            layer.add(mochi);

        }
        else {
            layer.add(mochi);
            layer.add(barney);
            
        }
        
        layer.add(tree);
        if(mochi.getY() > 370 - 60) {
            tree.moveDown();
        }
        if(barney.getY() > 300 - 60) {
            tree.moveDown();
        }

        
//         for(var i = 0; i < sprites.length; ++i)
//             layer.remove(sprites[i]);
        // ascending order
//         sprites.sort(function(s1, s2) {

 //            return s1.getY() - s2.getY();
//         });

//         for(var i = 0; i < sprites.length; ++i)
//             layer.add(sprites[i]);    
    }
    
    ball.adjustScale();
    mochi.adjustScale();
    barney.adjustScale();
    ellen.adjustScale();
    reorderSprites([ball, mochi, barney, ellen]);
    
    anim.start();
    layer.add(tree);
}

window.addEventListener("load", onLoad, false);