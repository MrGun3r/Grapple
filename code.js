const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.height =screen.height
canvas.width = screen.width
const players = []
const platforms = []
const bullets = []
const keys = {w:{pressed:false},s:{pressed:false},a:{pressed:false},d:{pressed:false},mouse1:{pressed:false},mouse2:{pressed:false}}
const mousepos = {x:0,y:0}
const gravity = 0.2
class Player{
  constructor(){
    this.ctx = ctx
    this.position = {
      x:200,
      y:50
    }
    this.velocity = {
      x:0,
      y:0
    }
    this.acceleration = {
      x:0,
      y:gravity
    }
    this.terminalvelocity = 10
    this.onAir = true
    this.size = 20
    this.mag = {
      active : true,
      count : 20,
      firerate : 200 //ms
    }
    this.grappleV = {
      position : {
        x:0,y:0
      },
      startlength:0,
      length : 0,
      active : false,
      angle : undefined,
      angle2 : undefined,
      startAngle:false,
      Avelocity:0,
      velocity:0
    }
    
  }
  draw(){
    this.ctx.save()
    this.ctx.fillStyle = '#00A300'
    this.ctx.fillRect(this.position.x,this.position.y,this.size,this.size)
    this.ctx.beginPath()
    this.ctx.rect(this.position.x,this.position.y,this.size,this.size)
    this.ctx.lineWidth = 2
    this.ctx.stroke()
    this.ctx.closePath()

    this.ctx.fillStyle = '#808080'
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.translate(this.position.x+this.size/2,this.position.y+this.size/2)
    this.ctx.rotate(this.angle())
    this.ctx.translate(-this.position.x-this.size/2,-this.position.y-this.size/2)
    this.ctx.rect(this.position.x+this.size/4,this.position.y+this.size/4,this.size,this.size/2)
    this.ctx.fill()
    this.ctx.stroke()
    this.ctx.restore()
  }
  grapplemouvement(){
    if (keys.d.pressed && this.grappleV.velocity < 0.1 ){this.grappleV.velocity += 0.05;}
    else if (keys.a.pressed && this.grappleV.velocity > -0.1){this.grappleV.velocity += -0.05;}
    else {this.grappleV.velocity *= 0.8;}

    if (keys.w.pressed && this.onAir && this.grappleV.length > 10){
     ;this.grappleV.length--}
     else if (keys.s.pressed && this.onAir && this.grappleV.length <= this.grappleV.startlength){
      ;this.grappleV.length++}
  }
  movement(){
    if (keys.d.pressed){this.velocity.x = 2;}
    else if (keys.a.pressed){this.velocity.x = -2;}
    else {this.velocity.x = 0;}

    if (keys.w.pressed && !this.onAir){
      this.onAir = true;this.velocity.y = -4}
  }
  shoot(){
    if (keys.mouse1.pressed && this.mag.active){
      bullets.push(new Bullet({x:this.position.x+this.size/2,y:this.position.y+this.size/2},{x:Math.cos(this.angle()),y:Math.sin(this.angle())}))
      this.mag.active = false
      this.mag.count--
      setTimeout(()=>{
         this.mag.active = true
      },this.mag.firerate)
    }
  }
  grapple(){
    if (keys.mouse2.pressed){
      if(!this.grappleV.active){
        this.grappleV.position = {x:mousepos.x,y:mousepos.y}
        this.ctx.moveTo(this.position.x+this.size/2,this.position.y+this.size/2)
        this.ctx.lineTo(this.grappleV.position.x,this.grappleV.position.y)
        this.ctx.stroke()
        this.grappleV.active = true}
      }
    else {
      if(this.grappleV.active){
        this.velocity.y = -Math.abs(this.grappleV.Avelocity + this.grappleV.velocity)*10
      }
      this.grappleV.active = false
      this.grappleV.startAngle = false
      this.grappleV.Avelocity = 0
      this.grappleV.velocity = 0
      
    }
    if (this.grappleV.active){
      this.ctx.moveTo(this.position.x+this.size/2,this.position.y+this.size/2)
        this.ctx.lineTo(this.grappleV.position.x,this.grappleV.position.y)
        this.ctx.stroke()
          if (!this.grappleV.startAngle){
          this.grappleV.startlength = this.grappleV.length = Math.sqrt((this.position.x+this.size/2-this.grappleV.position.x)**2+(this.position.y+this.size/2-this.grappleV.position.y)**2)
          if (this.position.x+this.size/2>this.grappleV.position.x){
            this.grappleV.angle = Math.acos((this.position.y+this.size/2-this.grappleV.position.y)/this.grappleV.length)
          }
          else{
          this.grappleV.angle = -Math.acos((this.position.y+this.size/2-this.grappleV.position.y)/this.grappleV.length)}
          this.grappleV.startAngle = true
        }
        if (this.onAir){   
        let force = gravity * Math.sin(this.grappleV.angle);
        this.grappleV.Avelocity += (-force+ this.grappleV.velocity) / this.grappleV.length
        this.grappleV.angle += this.grappleV.Avelocity 
        
       this.position.x = this.grappleV.length*Math.sin(this.grappleV.angle)+this.grappleV.position.x-this.size/2
       this.position.y = this.grappleV.length*Math.cos(this.grappleV.angle)+this.grappleV.position.y-this.size/2
       this.grappleV.angle *= 0.98
      }   
      }
    
   
  }
  angle(){
    return Math.atan2(mousepos.y-this.position.y,mousepos.x-this.position.x)
  }
  update(){
    this.draw()
    this.shoot()
    this.grapple()
    if(!this.grappleV.active){
      this.movement()
      
    if (this.onAir){
      this.acceleration.y = gravity
      if ( this.velocity.y < this.terminalvelocity){
    this.velocity.y += this.acceleration.y}}
    else{
      this.acceleration.y = 0
      this.velocity.y = 0
     }
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
  else {this.velocity.y = 0;
    this.grapplemouvement()}
  }
}
class Platform{
  constructor(position,size){
    this.ctx = ctx
    this.position = position
    this.size = size
    this.noContact = false
  }
  draw(){
    this.ctx.save()
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(this.position.x,this.position.y,this.size.x,this.size.y)
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.rect(this.position.x,this.position.y,this.size.x,this.size.y)
    this.ctx.stroke()
    this.ctx.restore()
  }
  update(){
    this.draw()
  }
}
class Bullet{
  constructor(position,direction){
    this.ctx = ctx
    this.position = position
    this.startPosition = {x:position.x,y:position.y}
    this.direction = direction
    this.size = 2
    this.speed = 7
    this.travelDistance = {
      x:0,y:0
    }
    this.travelLimit = 1000
    this.index;
  }
  draw(){
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(this.position.x,this.position.y,this.size,0,Math.PI*2)
    this.ctx.fill()
    this.ctx.closePath()
    this.ctx.restore()
  }
  bounds(){
    this.travelDistance.x += Math.abs(this.direction.x * this.speed)
    this.travelDistance.y += Math.abs(this.direction.y * this.speed)
    if (this.travelDistance.x > this.travelLimit || this.travelDistance.y > this.travelLimit){
      bullets.splice(this.index,1)
      
    }
  }
  update(index){
    this.index = index
    this.draw()
    this.position.x += this.direction.x * this.speed
    this.position.y += this.direction.y * this.speed
    this.bounds()
  }
}
players.push(new Player())
platforms.push(new Platform({x:100,y:500},{x:1000,y:100}))
platforms.push(new Platform({x:200,y:450},{x:100,y:30}))
platforms.push(new Platform({x:180,y:480},{x:20,y:30}))
platforms.push(new Platform({x:280,y:220},{x:20,y:20}))
function RectCollisionCheck(player,obstacle){ 
  if(player.position.x+player.size > obstacle.position.x &&(obstacle.position.x+obstacle.size.x) > player.position.x &&   player.position.y+player.size > obstacle.position.y&&obstacle.position.y+obstacle.size.y > player.position.y){
    return true
  }
  else {
    obstacle.noContact = true
    return false 
  }
}
function toBorder(player){
  var dx, dy, py, vx, vy;
  vx = mousepos.x - player.position.x-player.size/2;
  vy = mousepos.y - player.position.y-player.size/2;
  dx = vx < 0 ? 0 : canvas.width;
  dy = py = vy < 0 ? 0 : canvas.height;
  if (vx === 0) {
    dx = player.position.x+player.size/2;
  } else if (vy === 0) {
    dy = player.position.y+player.size/2;
  } else {
    var dy = player.position.y+player.size/2 + (vy / vx) * (dx - player.position.x-player.size/2);
    if (dy < 0 || dy > canvas.height) {
      dx = player.position.x+player.size/2 + (vx / vy) * (py - player.position.y-player.size/2);
      dy = py;
    }
  }
  return {x:dx,y:dy}
}
function LineCollision(x1,y1,x2,y2,x3,y3,x4,y4){
  uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1)); 
  uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1){
    return true
  }
  
  else return 0;}
function RectCollisionCorrection(player,obstacle){
  if (Math.min(Math.abs(player.position.x+player.size-obstacle.position.x),Math.abs(player.position.x-obstacle.position.x-obstacle.size.x))
      <Math.min(Math.abs(player.position.y+player.size-obstacle.position.y),Math.abs(player.position.y-obstacle.position.y-obstacle.size.y) 
    )){
      if (Math.abs(player.position.x + player.size - obstacle.position.x)>Math.abs(player.position.x - obstacle.position.x - obstacle.size.x)){
      player.position.x = obstacle.position.x + obstacle.size.x;obstacle.noContact = true
     }
     else {player.position.x = obstacle.position.x - player.size;obstacle.noContact = true}
    }
    else {
      if (Math.abs(player.position.y + player.size - obstacle.position.y)>Math.abs(player.position.y - obstacle.position.y - obstacle.size.y)){
        player.position.y = obstacle.position.y + obstacle.size.y;player.velocity.y = 0
       }
      else if (Math.abs(player.position.y + player.size - obstacle.position.y)<Math.abs(player.position.y - obstacle.position.y - obstacle.size.y)){player.position.y = obstacle.position.y - player.size;obstacle.noContact = false;}
      else{obstacle.noContact = true;}}
}
function loop(){
  ctx.save()
   ctx.fillStyle = '#ADD8E6'
   ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.restore()
   platforms.forEach((platform)=>{
    platform.update()
   })
   players.forEach((player)=>{
     player.update()
     for (var i = 0;i<platforms.length;i++){
      if (!platforms[i].noContact){
        player.onAir = false
        break
      }
      else {player.onAir = true}
     }
   })
   players.forEach((player)=>{
    platforms.forEach((platform)=>{
      if(RectCollisionCheck(player,platform)){
        RectCollisionCorrection(player,platform)
      }
    })
   })
   bullets.forEach((bullet,index)=>{
    platforms.forEach((platform)=>{
      
        x2 = bullet.startPosition.x
        y2 = bullet.startPosition.y
        x1 = bullet.position.x
        y1 = bullet.position.y
        x3 = platform.position.x
        y3 = platform.position.y
        if (LineCollision(x1,y1,x2,y2,x3,y3,x3+platform.size.x,y3) || LineCollision(x1,y1,x2,y2,x3,y3+platform.size.y,x3+platform.size.x,y3+platform.size.y) || LineCollision(x1,y1,x2,y2,x3,y3,x3,y3+platform.size.y) || LineCollision(x1,y1,x2,y2,x3+platform.size.x,y3,x3+platform.size.x,y3+platform.size.y)){
          bullets.splice(index,1)

        }
    })
   })
   bullets.forEach((bullet,index)=>{
    bullet.update(index)
   })
  requestAnimationFrame(loop)
}
loop()

// KEYBOARD INPUTS
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
document.addEventListener('contextmenu', event => event.preventDefault());