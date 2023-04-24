const canvas = document.getElementById("canvas")
ctx = canvas.getContext("2d")
canvas.width = screen.width
canvas.height = screen.height
const gravity = 0.3
const players = []
const objects = []
const keys = {a:{pressed:false},d:{pressed:false},w:{pressed:false},s:{pressed:false},mouse1:{pressed:false},mouse2:{pressed:false}}
const mousepos = {x:0,y:0}

class Player{
    constructor(ctx){
      this.ctx = ctx
      this.position = {
        x:250,
        y:250
      }
      this.velocity = {
        x:0,
        y:0
      }
      this.grapple = {
        active:undefined,
        position:undefined,
        length:undefined,
        angleVelocity:undefined,
        angleMvt:undefined,
        angle:undefined,
        restlength:undefined,
        lengthVelocity:undefined,
        lengthMvt:undefined,
        lengthMax:200
      }
      
      this.accelerationY = gravity
      this.size = 20
      this.mvtSpeed = 1
      this.speedLimit =10
      this.canJump = false
    }
    draw(){
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.roundRect(this.position.x,this.position.y,this.size,this.size,14)
        this.ctx.stroke()
        this.ctx.restore()
    }
    movement(){
        if (keys.a.pressed && this.velocity.x > -4){
            this.velocity.x -= this.mvtSpeed
        }
        else if(keys.d.pressed && this.velocity.x < 4){
            this.velocity.x += this.mvtSpeed
        }
        else {
          if (!this.canJump){this.velocity.x *= 0.98}
        else {this.velocity.x *= 0.9}}
        if (keys.w.pressed && this.canJump){
            this.velocity.y = -5
        }
        if (this.velocity.y<this.speedLimit){
            this.velocity.y += this.accelerationY}
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
    }
    grappleMvt(){
     if (keys.mouse1.pressed){
        if (!this.grapple.active){
         this.grapple.position = {
            x:mousepos.x,
            y:mousepos.y
         }
         this.grapple.restlength = this.grapple.length = Math.sqrt((this.position.x+this.size/2-this.grapple.position.x)**2+(this.position.y+this.size/2-this.grapple.position.y)**2)
         this.grapple.length = this.grapple.restlength
         if(this.grapple.length > this.grapple.lengthMax){
          this.ctx.beginPath()
          this.ctx.arc(this.position.x+this.size/2,this.position.y+this.size/2,this.grapple.lengthMax,0,2*Math.PI)
          this.ctx.stroke()
          return 0;
         }
         if (this.position.x+this.size/2>this.grapple.position.x){
          this.grapple.angle = Math.acos((this.position.y+this.size/2-this.grapple.position.y)/this.grapple.length)}
          else{this.grapple.angle = -Math.acos((this.position.y+this.size/2-this.grapple.position.y)/this.grapple.length)}
          this.grapple.angleVelocity = (this.velocity.x*Math.cos(this.grapple.angle)-this.velocity.y*Math.sin(this.grapple.angle))/this.grapple.length
          this.grapple.lengthVelocity = this.velocity.y*Math.cos(this.grapple.angle)+this.velocity.x*Math.sin(this.grapple.angle)
          this.grapple.lengthMvt = 0
          this.grapple.angleMvt = 0
          
         this.grapple.active = true
        }
        if (this.grapple.length == 0){
          this.grapple.length++
        }
        if(this.grapple.angle == 0){
          this.grapple.angle += 0.1
        }
        
        this.grapple.lengthVelocity += 0.01*(this.grapple.restlength-this.grapple.length) - this.grapple.lengthVelocity*(10/this.grapple.length) + this.grapple.lengthMvt
        
        this.grapple.length += this.grapple.lengthVelocity
        
        
      

        if (this.grapple.angle>2*Math.PI){
          this.grapple.angle -= 2*Math.PI
        }
        else if (this.grapple.angle<-2*Math.PI){
          this.grapple.angle += 2*Math.PI
        }
      if (this.grapple.angleVelocity<20/this.grapple.length && this.grapple.angleVelocity>-20/this.grapple.length){
        this.grapple.angleVelocity += -(gravity)*Math.sin(this.grapple.angle)/this.grapple.length + this.grapple.angleMvt 
        }
      this.grapple.angleVelocity *= Math.cos(Math.sqrt(gravity/this.grapple.length))**2
        
        this.grapple.angle += this.grapple.angleVelocity 
        this.grapple.angle *= Math.cos(Math.sqrt(gravity/this.grapple.length))**2
        
        if(Math.cos(this.grapple.angle)>0){
        if (keys.a.pressed && this.grapple.angleMvt>-0.3/this.grapple.length){
          this.grapple.angleMvt -= 0.04/this.grapple.length
        } 
        else if (keys.d.pressed && this.grapple.angleMvt<0.3/this.grapple.length){
          this.grapple.angleMvt += 0.04/this.grapple.length
        }
        else {this.grapple.angleMvt *= 0.5}
        console.log(this.grapple.angleVelocity)
}
else {
  if (keys.a.pressed && this.grapple.angleMvt<0.2/this.grapple.length){
    this.grapple.angleMvt += 0.04/this.grapple.length
  } 
  else if (keys.d.pressed && this.grapple.angleMvt>-0.2/this.grapple.length){
    this.grapple.angleMvt -= 0.04/this.grapple.length
  }
  else {this.grapple.angleMvt *= 0.5}
}
        if (keys.w.pressed){
          this.grapple.lengthMvt = -this.grapple.length/1000
        }
        else if (keys.s.pressed ){
          this.grapple.lengthMvt = this.grapple.length/1000
        }
        else {this.grapple.lengthMvt *= 0}
        
        this.position.x = this.grapple.length*Math.sin(this.grapple.angle)+this.grapple.position.x-this.size/2
        this.position.y = this.grapple.length*Math.cos(this.grapple.angle)+this.grapple.position.y-this.size/2
        

        // draw line
         this.ctx.beginPath()
         this.ctx.moveTo(this.position.x+this.size/2,this.position.y+this.size/2)
         this.ctx.lineTo(this.grapple.position.x,this.grapple.position.y)
         this.ctx.stroke()
         
     }
        else {
          if(this.grapple.active){
            this.velocity.x = this.grapple.angleVelocity*Math.cos(this.grapple.angle)*this.grapple.length+this.grapple.lengthVelocity*Math.sin(this.grapple.angle)
            if(Math.sin(this.grapple.angle)*this.grapple.angleVelocity<0){
            this.velocity.y = Math.abs(this.grapple.angleVelocity*Math.sin(this.grapple.angle)*this.grapple.length+this.grapple.lengthVelocity)+this.grapple.lengthVelocity*Math.cos(this.grapple.angle)
          }
            else {this.velocity.y = -Math.abs(this.grapple.angleVelocity*Math.sin(this.grapple.angle)*this.grapple.length)+this.grapple.lengthVelocity*Math.cos(this.grapple.angle)}    
            this.grapple.active = false;
          }
        }
    }
    update(){
        this.draw()
    if (!this.grapple.active){
        this.movement()
    }
        this.grappleMvt() 
    }
}

class Object{
    constructor(ctx,position,size){
       this.ctx = ctx
       this.position = position
       this.size = size
       this.contact = false
    }

    draw(){
        this.ctx.save()
        this.ctx.lineWidth = 2
        this.ctx.beginPath()
        this.ctx.rect(this.position.x,this.position.y,this.size.width,this.size.height)
        this.ctx.stroke()
        this.ctx.restore()
    }
    update(){
        this.draw()
    }
    }
players.push(new Player(ctx))
objects.push(new Object(ctx,{x:100,y:600},{width:500,height:100}))
objects.push(new Object(ctx,{x:700,y:50},{width:100,height:800}))
objects.push(new Object(ctx,{x:250,y:570},{width:20,height:50}))
objects.push(new Object(ctx,{x:250,y:520},{width:50,height:30}))

function Collision(player,object){
if(player.position.x+player.size > object.position.x &&(object.position.x+object.size.width) > player.position.x && player.position.y+player.size > object.position.y&&object.position.y+object.size.height > player.position.y){
    return true
  }
  else {
    return false 
  }}

function CollisionCorrection(player,object){
    if (Math.min(Math.abs(player.position.x+player.size-object.position.x),Math.abs(player.position.x-object.position.x-object.size.width))
      <Math.min(Math.abs(player.position.y+player.size-object.position.y),Math.abs(player.position.y-object.position.y-object.size.height) 
    )){
      if (Math.abs(player.position.x + player.size - object.position.x)>Math.abs(player.position.x - object.position.x - object.size.width)){
      player.position.x = object.position.x + object.size.width;
      if (player.grapple.active){
        player.grapple.angleVelocity /= -3
        if(player.grapple.position.x > player.position.x){
        player.grapple.angle = -Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))
        }
        else {player.grapple.angle = Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))}
      }
     }
     else {player.position.x = object.position.x - player.size;
      if (player.grapple.active){
        player.grapple.angleVelocity /= -3
        if(player.grapple.position.x > player.position.x){
          player.grapple.angle = -Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))
          }
          else {player.grapple.angle = Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))}
        
      }}
    }
    else {
      if (Math.abs(player.position.y + player.size - object.position.y)>Math.abs(player.position.y - object.position.y - object.size.height)){
        player.position.y = object.position.y + object.size.height;
        player.velocity.y *= 0.98
        if (player.grapple.active){
          player.grapple.angleVelocity /= -3
          if(player.grapple.position.x > player.position.x){
          player.grapple.angle = -Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))
          }
          else {player.grapple.angle = Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))}
        }
        
       }
      else if (Math.abs(player.position.y + player.size - object.position.y)<Math.abs(player.position.y - object.position.y - object.size.height)){player.position.y = object.position.y - player.size;
        player.velocity.y = 0;
        if (player.grapple.active){
        player.grapple.angleVelocity /= -3
        if(player.grapple.position.x > player.position.x){
        player.grapple.angle = -Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))
        }
        else {player.grapple.angle = Math.acos((player.position.y+player.size/2-player.grapple.position.y)/(Math.sqrt((player.position.y+player.size/2-player.grapple.position.y)**2+(player.position.x+player.size/2-player.grapple.position.x)**2)))}
      }
        object.contact = true
        }
       }
       
        
}
function GameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    
    players.forEach((player)=>{
        player.update()
        objects.forEach((object)=>{
            
            if(Collision(player,object)){
                CollisionCorrection(player,object)
            }
            else {object.contact = false}
            for(var i = 0 ;i < objects.length;i++){
                if (objects[i].contact){
                 player.canJump = true
                 break
                }
                else {player.canJump = false;}
                
            }
            
        })
    })
    objects.forEach((object)=>{
        object.update()
    })
      
    requestAnimationFrame(GameLoop)
}
GameLoop()



// KEYBOARD & MOUSE KEYS //
addEventListener('keydown',({keyCode})=>{
    if (keyCode == 68){keys.d.pressed = true;}
    if (keyCode == 65){keys.a.pressed = true}
    if (keyCode == 87){keys.w.pressed = true}
    if (keyCode == 83){keys.s.pressed = true}
})
addEventListener('keyup',({keyCode})=>{
 if (keyCode == 68){keys.d.pressed = false}
 if (keyCode == 65){keys.a.pressed = false}
 if (keyCode == 87){keys.w.pressed = false}
 if (keyCode == 83){keys.s.pressed = false}
})
addEventListener('mousedown',(event)=>{
 if (event.button == 0){
 keys.mouse1.pressed = true}
 if (event.button == 2){
   keys.mouse2.pressed = true
 }
})
addEventListener('mouseup',(event)=>{
 if (event.button == 0){
 keys.mouse1.pressed = false}
 if (event.button == 2){
   keys.mouse2.pressed = false
 }
})
addEventListener('mousemove',(event)=>{
    rect = canvas.getBoundingClientRect()
  mousepos.y = event.y*canvas.height/rect.bottom
  mousepos.x = event.x*canvas.width/rect.right
})