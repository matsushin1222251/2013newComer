enchant();

var isTouch=false;
var touchTime=0;
var touchX=109;
var touchY=214;

var machines=[];
var target=[];

var SCRX=0;
var SCRY=0;

var Lockon=false;
var Target=null;
var Score=0;
var Frame=0;
var End=0;
var WeaponName=new Array("RED","ORANGE","YELLOW","GREEN","BLUE","PURPLE","BLACK");

Machine = Class.create(Sprite,{
    initialize: function(x,y,angle,image){
      Sprite.call(this,image.width,image.height);
      this.x = x-16;
      this.y = y-16;
      this.cx = x;
      this.cy = y;
      this.rotation=angle;
      this.angle=angle-90;
      this.image = image;
      this.frame = 0;
      this.scaleX=1;
      this.scaleY=1;
      this.size=1;
      if(image.width>=image.height){
        this.size=32/image.width;
      }else{
        this.size=32/image.height;
      }
      this.scaleX=this.size;
      this.scaleY=this.size;
      //機体のステータス
      this.name="No Name";
      this.nameLabel=new Label(this.name);
      this.nameLabel.font="16px ＭＳ ゴシック";
      this.gage=new Sprite(10,10);
      this.ring=new Sprite(32,32);
      this.comment="";
      this.hp=10;//体力
      this.pow=1;//攻撃力
      this.def=1;//防御
      this.spd=0;//速度
      this.max_spd=3;//最高速度
      this.accel=0.04;//加速
      this.roll=0.1;//旋回速度
      this.color=0;
      //機体の状態
      this.level=1;//現在のレベル
      this.exp=0;//総合経験値
      this.next_exp=5;//次のレベルアップに必要な経験値
      this.skill=new Array(4,4,4,4,4,4);//ステータス上昇の偏り
      this.weapon=0;//武器の種類
      this.type=0;
      this.onAttack=false;//攻撃中かどうか
      this.attackLug=0;
      this.attackTime=0;
      this.charge=0;
      this.max_charge=15;
      this.onSpin=false;
      this.spin=0;
      this.spin_dir=0;
      this.onAttack2=true;
      this.max_hp=this.hp;
      machines.push(this);
      
      this.operatable=false;
      
      this.add=false;
      this.died=false;
      
      this.setColor();
      
    },
    setColor:function(){
      this.nameLabel.color='white';
    },
    dist:function(X,Y){
      distanse=Math.sqrt(Math.pow(this.cx-X,2)+Math.pow(this.cy-Y,2));
      return distanse;
    },
    direct:function(X,Y){
      var direction;
      if(this.cx==X){
        if(this.cy<Y)direction=-90;
        else direction=90;
      }else{
        direction=Math.atan((Y-this.cy)/(X-this.cx));
        if(this.cx>X)direction+=Math.PI;
      }
      
      return direction;
    },
    directTo:function(direction){
      dir=direction/180*Math.PI;
      min=dir-360;max=dir+360;
      dmin=Math.abs(this.angle-min);
      dmid=Math.abs(this.angle-dir);
      dmax=Math.abs(this.angle-max);
      Min=Math.min(dmin,dmid,dmax);
      if(Min==dmin)dir=min;
      else if(Min==dmax)dir=max;
      if(this.angle<dir)this.angle+=this.roll;
      else if(this.angle>dir)this.angle-=this.roll;
      if(Math.abs(this.angle-dir)<this.roll)this.angle=dir;
      this.rotation=this.angle+90;
    },
    directTo:function(X,Y){
      dir=this.direct(X,Y)*180/Math.PI;
      min=dir-360;max=dir+360;
      dmin=Math.abs(this.angle-min);
      dmid=Math.abs(this.angle-dir);
      dmax=Math.abs(this.angle-max);
      Min=Math.min(dmin,dmid,dmax);
      if(Min==dmin)dir=min;
      else if(Min==dmax)dir=max;
      if(this.angle<dir)this.angle+=this.roll;
      else if(this.angle>dir)this.angle-=this.roll;
      if(Math.abs(this.angle-dir)<this.roll)this.angle=dir;
      this.rotation=this.angle+90;
    },
    speedUp:function(){
      if(this.spd<this.max_spd){
        this.spd+=this.accel;
      }
      if(this.spd>this.max_spd){
        this.spd=this.max_spd;
      }
    },
    move:function(X,Y){
      this.scaleX=this.size;
      this.angle=this.direct(X,Y)*180/Math.PI;
      this.rotation=this.angle+90;
      if(this.dist(X,Y)>this.spd){
        this.speedUp();
        this.cx+=this.spd*Math.cos(this.angle*Math.PI/180);
        this.cy+=this.spd*Math.sin(this.angle*Math.PI/180);
      }else{
        this.spd=0;
      }
    },
    attack:function(X,Y){
      this.attackEffect();
      if(this.weapon==2){
        this.NormalShot();
      }else if(this.weapon==0){
        this.BomberShot();
      }else if(this.weapon==3){
        this.DrillAttack();
      }else if(this.weapon==1){
        this.PowerShot();
      }else if(this.weapon==4){
        this.IceShot();
      }else if(this.weapon==5){
        this.CristalBeam();
      }else if(this.weapon==6){
        this.FakeWeapon();
      }
      this.charge++;
    },
    spin_start:function(spd,time,dir,dam){
      this.onAttack=false;
      this.onSpin=true;
      this.spd=spd;
      this.spin=time;
      this.spin_dir=dir;
      this.damage(dam);
      this.ring.frame=0;
    },
    spin_move:function(){
      this.angle+=70;
      this.spin--;
      this.cx+=this.spd*Math.cos(this.spin_dir);
      this.cy+=this.spd*Math.sin(this.spin_dir);
      if(this.spin<=0){
        this.onSpin=false;
        this.spd=0;
      }
    },
    levelUp:function(){
      this.level++;
      var up_skill=new Array(1,1,1,1,1,1);
      for(i in this.skill){
        up_skill[i]+=this.skill[i];
      }
      this.hp+=1*up_skill[0];
      this.pow+=1*up_skill[1];
      this.def+=1*up_skill[2];
      this.max_spd+=0.0005*up_skill[3];
      this.accel+=0.01*up_skill[4];
      this.roll+=0.05*up_skill[5];
      if(this.exp<this.next_exp)this.exp=this.next_exp;
      this.next_exp+=2.5*this.level*this.level;
      
    },
    getExp:function(EXP){
      this.exp+=EXP;
      while(this.exp>=this.next_exp){
        this.levelUp();
      }
    },
    death:function(){
      this.attackEnd();
      if(this.scaleX>this.size)this.scaleX=this.size;
      this.angle+=25;
      this.scaleX-=0.02*this.size;
      if(this.scaleX<0){this.died=true;}
    },
    
    damage:function(pow){
      dam=pow/this.def;
      if(dam<1)dam=1;
      this.hp-=dam;
    },
    basicUpdate:function(){
      //名前+レベルの表示
      this.nameLabel.x=this.cx-16;
      this.nameLabel.y=this.cy+16;
      this.nameLabel.text=this.name+" Lv"+this.level;
      //体力ゲージ
      this.gage.scaleX=3.2*this.hp/this.max_hp;
      if(this.hp<=0)this.gage.scaleX=0;
      this.gage.scaleY=0.2;
      this.gage.x=this.cx-16+5*this.gage.scaleX;
      this.gage.y=this.cy+32;
      if(Frame%3==0){
        this.gage.frame++;
        cr=0;
        if(this.hp/this.max_hp<0.25)cr=3;
        else if(this.hp/this.max_hp<0.5)cr=2;
        else if(this.hp/this.max_hp<0.75)cr=1;
        if(this.gage.frame>2*cr+1)this.gage.frame=2*cr;
      }
      //進行方向
      nx=this.cx+32*Math.cos((this.angle)*Math.PI/180);
      ny=this.cy+32*Math.sin((this.angle)*Math.PI/180);
      this.ring.x=nx-16;
      this.ring.y=ny-16;
      this.ring.rotation=this.angle+90;
      if(this.max_hp<this.hp)this.max_hp=this.hp;
      if(this.hp<0)this.hp=0;
      while(this.angle>270)this.angle-=360;
      while(this.angle<-90)this.angle+=360;
      if(this.cx<10){
        this.cx=10;
        this.spin_dir+=180;
      }
      if(this.cx>230){
        this.cx=230;
        this.spin_dir+=180;
      }
      if(this.cy<50){
        this.cy=50;
        this.spin_dir+=180;
      }
      if(this.cy>320){
        this.cy=320;
        this.spin_dir+=180;
      }
      this.x=this.cx-this.image.width/2;
      this.y=this.cy-this.image.height/2;
      this.rotation=this.angle+90;
      this.attackLug++;
      if(this.onAttack==false && this.hp>0){this.scaleX=this.size;}
    },
    update:function(){
      
    },
    attackEffect:function(){
      //攻撃前のエフェクト
      this.ring.frame=this.weapon+1;
    },
    attackEnd:function(){
      this.onAttack=false;
      //Lockon=false;
      //Target=null;
      this.ring.frame=0;
    },
    //通常弾連射（直進弾）
    NormalShot:function(){
      this.max_charge=15;
      this.scaleX+=0.2;
      if(this.charge%2==0){
        if(this.charge>5){
          max=0;
          if(this.attackLug>250)max=1;
          shot=new Shot(this.cx,this.cy,this.angle,2,0.5*this.pow*(1+4*max),5+5*max);
          shot.master=this.operatable;
          shot.scaleX+=max;
        }
        this.scaleX=this.size;
      }
      if(this.charge>=this.max_charge){
        if(this.attackLug>250){
          var bomb=new Bomb(this.cx,this.cy,this.angle,2,this.pow*5,0);
          bomb.master=this.operatable;
        }
        this.scaleX=this.size;
        this.attackLug=0;
        this.attackEnd();
      }
    },
    PowerShot:function(){
      this.max_charge=50;
      this.scaleX+=0.2*this.size;
      if(this.scaleX>this.size*2)this.scaleX=this.size;
      if(this.charge>=this.max_charge){
        
        for(var i=-1;i<=1;i++){
          nx=this.cx+10*Math.cos((this.angle+90*i)*Math.PI/180);
          ny=this.cy+10*Math.sin((this.angle+90*i)*Math.PI/180);
          shot=new superShot(nx,ny,this.angle,1,this.pow*3,15);
          shot.master=this.operatable;
        }
        this.scaleX=this.size;
        this.attackLug=0;
        this.attackEnd();
      }
    },
    //爆炎弾（移動せず、広範囲に爆発。高威力。）
    BomberShot:function(){
      this.max_charge=40;
      if(this.scaleX<3*this.size)this.scaleX+=0.02*this.size;
      if(this.charge>=this.max_charge){
        for(var i=-1;i<=1;i++){
          nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
          ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
          var bomb=new Bomb(nx,ny,this.angle+15*i,0,this.pow*5,3);
          bomb.master=this.operatable;
        }
        this.attackEnd();
      }
    },
    //氷弾（直進。着弾すると低威力の青い通常弾を拡散）
    IceShot:function(){
      this.max_charge=40;
      if(this.charge==0){this.spin_dir=this.angle;}
      this.angle+=72+36;
      if(this.charge>=this.max_charge){
        this.angle=this.spin_dir;
        var level=1;
        if(this.attackLug>250)level=2;
        var ice=new Ice(this.cx,this.cy,this.angle,4,this.pow*2,2,level);
        ice.master=this.operatable;
        this.scaleX=this.size;
        this.attackLug=0;
        this.attackEnd();
      }
    },
    DrillAttack:function(){
      this.max_charge=100;
      if(this.charge==0){this.spin_dir=this.angle;}
      if(this.charge<72){
        this.angle+=5;
      }else{
        if(this.charge==72){
          this.angle=this.spin_dir;
          
        }else if(this.charge%2==0){
          
            nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
            ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
            var bomb=new Bomb(nx,ny,this.angle,3,this.pow*7,0);
            bomb.master=this.operatable;
          
        }
        this.spd=this.max_spd;
        nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
        ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
        for(var i=0;i<3;i++)this.move(nx,ny);
        if(this.charge>=this.max_charge){
          this.attackLug=0;
          this.attackEnd();
        }
      }
    },
    CristalBeam:function(){
      this.max_charge=100;
      this.angle+=this.charge;
      if(this.charge==50){
        for(var i=0;i<6;i++){
        for(var j=0;j<3;j++){
           dir=60*i+this.angle;
           nx=this.cx+30*Math.cos(dir*Math.PI/180);
           ny=this.cy+30*Math.sin(dir*Math.PI/180);
           shot=new Shot(nx,ny,180+dir,5,this.pow*3,1+j);
           shot.scaleX=shot.scaleY=0.3;
           shot.hp=150;
           shot.roll=5;
           shot.master=this.operatable;
        }
        }
      }
      if(this.charge>=this.max_charge){
        this.attackLug=0;
        this.attackEnd();
        this.opacity=1;
      }
    },
    
    FakeWeapon:function(){
      this.max_charge=100;
      if(this.attackTime==0){
        if(this.charge<60){
          if(this.scaleX<3*this.size)this.scaleX+=0.02*this.size;
          this.angle+=1;
        }else{
          this.angle-=2;
          if(this.charge%7==0){
            nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
            ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
            var bomb=new Bomb(nx,ny,this.angle,6,this.pow*7,10);
            bomb.master=this.operatable;
          }
        }
      }
      if(this.attackTime==1){
        this.scaleX+=0.2;
        if(this.charge>30 && this.charge%5==0){
          dir=rand(10)-5;
          shot=new superShot(this.cx,this.cy,this.angle+dir,6,this.pow,20);
          shot.master=this.operatable;
          this.scaleX=this.size;
        }
      }
      if(this.attackTime==2){
        if(this.charge==0){
          this.spin_dir=this.angle;
        }
        if(this.charge<36){
          this.angle+=20;
        }else{
          if(this.charge==36){
            this.angle=this.spin_dir; 
          }else if(this.charge%2==0){
             nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
             ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
             var bomb=new Bomb(nx,ny,this.angle,6,this.pow*10,0);
             bomb.master=this.operatable;
          }
          this.spd=this.max_spd;
          if(this.charge>=72 && this.charge<81)this.angle+=20;
          nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
          ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
          for(var i=0;i<3;i++)this.move(nx,ny);
        }
      }
      if(this.charge>=this.max_charge){
        this.attackLug=0;
        this.attackEnd();
        this.attackTime++;
        if(this.attackTime>2)this.attackTime=0;
      }
    },
});

Player = Class.create(Machine,{
    initialize: function(x,y,angle,image){
      Machine.call(this,x,y,angle,image);
      this.def=1;
      this.hitLug=0;
      this.weapon=2;
      this.name="Player";
      this.operatable=true;
      this.addEventListener('touchstart', function(e){
        
      });
    },
    setColor:function(){
      this.nameLabel.color='white';
    },
    attackEnd:function(){
      this.onAttack=false;
      Lockon=false;
      Target=null;
      this.ring.frame=0;
    },
    update:function(){
      this.basicUpdate();
      
      if(this.hp<=0){
        this.death();
      }else if(this.onSpin==true){
        this.spin_move();
      }else if(this.onAttack==true){
        this.spd=0;
        this.attack(touchX,touchY);
        if(Lockon==true){
          this.directTo(Target.cx,Target.cy);
        }else{
          this.directTo(touchX,touchY);
        }
      }else{
        if(isTouch==false){
	  if(Lockon==true){
	    this.onAttack=true;
	    this.angle=this.direct(Target.cx,Target.cy)/Math.PI*180;
	    
	    this.charge=0;
	    touchTime=0;
	  }else if(touchTime>0 && touchTime<=15){
            this.onAttack=true;
            this.charge=0;
            touchTime=0;
          }else{
            this.scaleX=this.size;
       	    this.charge=0;
	    this.spd=0;
	  }
        }else{
          this.move(touchX,touchY);
        }
      }
    }
});

Enemy = Class.create(Machine,{
    initialize: function(x,y,angle,image){
      Machine.call(this,x,y,angle,image);
      this.addEventListener('touchstart', function(e) {
        if(Target!=this){
          Lockon=true;
          Target=this;
        }else{
          Lockon=false;
          Target=null;
        }
      });
      this.weapon=rand(6);
      this.action=1;
      this.wait=100;
      this.move_lug=0;
    },
    setColor:function(){
      this.nameLabel.color='white';
    },
    waitAttack:function(){
      //this.directTo(machines[0].cx,machines[0].cy);
      this.attackEffect();
      this.wait-=1+this.accel+this.roll;
      if(this.wait>200)
        this.directTo(machines[0].cx,machines[0].cy);
      if(this.wait<=0){
        this.move_lug=100;
        this.onAttack=true;
        this.charge=0;
        this.wait=400;
        this.action=1;
        if(rand(10)==0){
          this.action=4;
          this.move_lug=300;
        }
      }
    },
    moveToPlayer:function(){//自機への接近
      var dir=Math.abs(this.angle-this.direct(machines[0].cx,machines[0].cy)*180/Math.PI);
      if(dir>90){
        this.directTo(machines[0].cx,machines[0].cy);
      }else{
        this.directTo(machines[0].cx,machines[0].cy);
        nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
        ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
        this.move(nx,ny);
      }
      if(this.dist(machines[0].cx,machines[0].cy)<100){
        this.wait=400;
        this.move_lug=200;
        this.action=0;
        if(rand(4)==0){this.action=2;}
        else if(rand(3)==0){this.action=3;}
      }
    },
    leavePlayer:function(){//自機から離れる
      var dir=Math.abs(this.angle-this.direct(machines[0].cx,machines[0].cy)*180/Math.PI);
      if(this.dist(machines[0].cx,machines[0].cy)<250 && this.move_lug>0){
        this.angle=this.direct(machines[0].cx,machines[0].cy)*180/Math.PI+180;
        nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
        ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
        this.move(nx,ny);
      }
      else{
        if(dir>10){
          this.directTo(machines[0].cx,machines[0].cy);
        }else{
          this.action=0;
          this.wait=400;
          this.move_lug=70;
        }
      }
    },
    arroundPlayer:function(){//自機の後ろに回り込む
      cx=machines[0].cx+100*Math.cos((machines[0].angle+90)*Math.PI/180);
      cy=machines[0].cy+100*Math.sin((machines[0].angle+90)*Math.PI/180);
      this.directTo(cx,cy);
      nx=this.cx+30*Math.cos((this.angle)*Math.PI/180);
      ny=this.cy+30*Math.sin((this.angle)*Math.PI/180);
      this.move(nx,ny);
      if(this.move_lug<=0){
        this.action=0;
        this.wait=400;
        this.move_lug=70;
      }
    },
    shout:function(){//叫ぶ
      
      if(this.move_lug<=0){
        this.action=0;
        this.wait=400;
        this.move_lug=70;
      }
    },
    update:function(){
      this.basicUpdate();
      if(this.hp<=0){
        this.death();
        if(Target==this){
          Target=null;
          Lockon=false;
        }
        if(this.died==true)Score+=this.exp;
      }else if(this.onSpin==true){
        this.spin_move();
      }else if(this.onAttack==true){
        this.spd=0;
        this.attack(touchX,touchY);
      }else{
        /*独自モーション*/
        this.move_lug-=(this.accel+this.roll)/2;
        if(this.action==0){
          this.waitAttack();
        }else if(this.action==1){
          this.moveToPlayer();
        }else if(this.action==2){
          this.leavePlayer();
        }else if(this.action==3){
          this.arroundPlayer();
        }else if(this.action==4){
          this.shout();
        }
      }
    }
});


shots=[];

Shot=Class.create(Sprite,{
    initialize:function(x,y,direct,color,power,speed){
      Sprite.call(this,46,46);
      this.hp=1000;
      this.cx = x;
      this.cy = y;
      this.scaleX=0.2;
      this.scaleY=0.2;
      this.x=this.cx-23*0.2;
      this.y=this.cy-23*0.2;
      this.direct=direct;
      this.frame=color;
      this.speed=speed;
      this.power=power;
      this.master=true;
      shots.push(this);
      
      this.roll=0;
      
      this.parts=new Array();
      
      this.add=false;
      this.died=false;
    },
    move:function(){
      this.direct+=this.roll;
      this.cx+=this.speed*Math.cos(this.direct*Math.PI/180);
      this.cy+=this.speed*Math.sin(this.direct*Math.PI/180);
    },
    dist:function(obj){
      dx=this.cx-obj.cx;
      dy=this.cy-obj.cy;
      dr=Math.sqrt(dx*dx+dy*dy);
      return dr;
    },
    clash:function(){
      if(this.master==true){
        for(var i=1;i<machines.length;i++){
          if(this.dist(machines[i])<16 && machines[i].hp>0){
            machines[i].damage(2*this.power);
            machines[i].spin_start(5,5,machines[i].direct(this.cx,this.cy)+Math.PI,0);
            this.died=true;
          }
        }
      }else{
        if(this.dist(machines[0])<16 && machines[0].hp>0){
          machines[0].damage(this.power);
          machines[0].spin_start(2,5,machines[0].direct(this.cx,this.cy)+Math.PI,0);
          this.died=true;
        }
      }
    },
    update:function(){
      this.hp--;
      if(this.hp<=0)this.died=true;
      this.move();
      this.clash();
      this.rotation=this.direct;
      this.x=this.cx-23;
      this.y=this.cy-23;
      if(this.x<-100 || this.x>340 || this.y<-100 || this.y>460)this.died=1;
    }
});

Bomb=Class.create(Shot,{
    initialize:function(x,y,direct,color,power,speed){
      Shot.call(this,x,y,direct,color,power,speed);
      this.scaleX=0;
      this.scaleY=0;
      this.x=x;
      this.y=y;
    },
    move:function(){
      if(this.scaleX<2)this.scaleX+=0.2;
      if(this.scaleX>=1.5){
        this.opacity-=0.4;
        if(this.speed>0){
          nx=this.cx+30*Math.cos((this.direct)*Math.PI/180);
          ny=this.cy+30*Math.sin((this.direct)*Math.PI/180);
          var b=new Bomb(nx,ny,this.direct,this.frame,this.power*0.9,this.speed-1);
          b.master=this.master;
          this.speed=0;
        }
      }  
    },
    
    clash:function(){
      if(this.master==true){
        for(var i=1;i<machines.length;i++){
          if(this.dist(machines[i])<8+20*this.scaleX && machines[i].onSpin==false && machines[i].hp>0){
            machines[i].damage(2*this.power);
            machines[i].spin_start(5,20,machines[i].direct(this.cx,this.cy)+Math.PI,this.power);
          }
        }
      }else{
        if(this.dist(machines[0])<8+20*this.scaleX && machines[0].onSpin==false && machines[0].hp>0){
          machines[0].damage(this.power);
          machines[0].spin_start(5,80,machines[0].direct(this.cx,this.cy)+Math.PI,this.power);
        }
      }
    },
    update:function(){
      this.move();
      if(this.opacity>0)this.clash();
      this.scaleY=this.scaleX;
      this.x=this.cx-23;//*this.scaleX;
      this.y=this.cy-23;//*this.scaleX;
      if(this.opacity<=0)this.died=1;
    }
});

Ice=Class.create(Shot,{
    initialize:function(x,y,direct,color,power,speed,level){
      Shot.call(this,x,y,direct,color,power,speed);
      this.level=level;
      this.scaleX=0.4;
      this.scaleY=0.4;
      this.mode=0;
      this.opacity=1;
    },
    move:function(){
      if(this.mode==0){
        this.cx+=this.speed*Math.cos(this.direct/180*Math.PI);
        this.cy+=this.speed*Math.sin(this.direct/180*Math.PI);
        this.speed-=0.02;
        if(this.speed<=0){
          this.mode=1;
          for(i=-this.level;i<=this.level;i++){
            for(j=-1;j<=1;j++){
              dir=this.direct+2*j+10*i;
              nx=this.cx+(20-Math.abs(20*j))*Math.cos((dir+180)/180*Math.PI);
              ny=this.cy+(20-Math.abs(20*j))*Math.sin((dir+180)/180*Math.PI);
              s=new Shot(nx,ny,dir,4,this.power*2,-2);
              s.scaleX=0.4;
              s.scaleY=0.1;
              s.master=this.master;
            }
          }
        }
      }else{
        this.scaleX+=0.1;
        this.opacity-=0.1;
      }
    },
    dist:function(obj){
      dx=this.cx-obj.cx;
      dy=this.cy-obj.cy;
      dr=Math.sqrt(dx*dx+dy*dy);
      return dr;
    },
    clash:function(){
      if(this.master==true){
        for(var i=1;i<machines.length;i++){
          if(this.dist(machines[i])<8+20*this.scaleX && machines[i].onSpin==false && machines[i].hp>0){
            machines[i].damage(2*this.power);
            machines[i].spin_start(5,20,machines[i].direct(this.cx,this.cy)+Math.PI,this.power);
          }
        }
      }else{
        if(this.dist(machines[0])<8+20*this.scaleX && machines[0].onSpin==false && machines[0].hp>0){
          machines[0].damage(this.power);
          machines[0].spin_start(5,40,machines[0].direct(this.cx,this.cy)+Math.PI,this.power);
        }
      }
    },
    update:function(){
      this.move();
      if(this.opacity>0)this.clash();
      this.scaleY=this.scaleX;
      if(this.direct>270)this.direct=-90;
      if(this.direct<-90)this.direct=270;
      this.x=this.cx-23;
      this.y=this.cy-23;
      if(this.opacity<=0)this.died=1;
    }
});

superShot=Class.create(Shot,{
    initialize:function(x,y,direct,color,power,speed,level){
      Shot.call(this,x,y,direct,color,power,speed);
      this.scaleX=0.8;
      this.scaleY=0.2;
      for(var i=0;i<10;i++){
        s=new Sprite(46,46);
        s.x=this.x;
        s.y=this.y;
        s.image=this.image;
        s.frame=this.frame;
        s.scaleX=0.8;
        s.scaleY=0.2;
        s.opacity=0.1*i+0.05;
        s.rotation=this.rotation;
        this.parts.push(s);
      }
    },
    move:function(){
      this.cx+=this.speed*Math.cos(this.direct/180*Math.PI);
      this.cy+=this.speed*Math.sin(this.direct/180*Math.PI);
      
    },
    update:function(){
      for(var i=0;i<10;i++){
        this.parts[i].image=this.image;
      }
      this.clash();
      this.x=this.cx-23;
      this.y=this.cy-23;
      this.speed-=0.3;
      if(this.speed<=0){
        var b=new Bomb(this.cx,this.cy,this.direct,this.frame,this.power*2,0);
        b.master=this.master;
        this.died=true;
      }
      if(Frame%1==0){
      for(var i=0;i<9;i++){
        this.parts[i].x=this.parts[i+1].x;
        this.parts[i].y=this.parts[i+1].y;
        this.parts[i].rotation=this.parts[i+1].rotation;
      }
      this.parts[9].x=this.x;
      this.parts[9].y=this.y;
      this.parts[9].rotation=this.rotation;
      }
      this.move();
      this.rotation=this.direct;
      if(this.cx<10){
        this.cx=10;
        this.direct=180-this.direct;
        
      }else if(this.cx>230){
        this.cx=230;
        this.direct=180-this.direct;
        
      }else if(this.cy<10){
        this.cy=10;
        this.direct=-this.direct;
        
      }else if(this.cy>350){
        this.cy=350;
        this.direct=-this.direct;
        
      }
    }
});



window.onload = function() {
    game = new Core(240,360);
    game.twitterRequest('account/verify_credentials');
    game.twitterRequest('statuses/friends');
    game.fps=64;
    game.preload('vbg1.png','title.png','message.png','next.png','bear1.png', 'shot.png', 'hp.png', 'direct.png','ring.png','target.png','check.png');
    game.input.left=false;
    game.input.right=false;
    
    
    var pGage,playerName;
    var set=new Scene();
    var stage=new Scene();
    stage.addEventListener('touchstart', function(e) {
        isTouch=true;
        touchTime=0;
        touchX=e.localX;
        touchY=e.localY;
    });
    stage.addEventListener('touchend', function(e) {
        isTouch=false;
        touchX=e.localX;
        touchY=e.localY;
    });
    stage.addEventListener('touchmove', function(e) {
        touchX=e.localX;
        touchY=e.localY;
    });
    stage.addEventListener('enterframe', function() {
        if(isTouch==true)touchTime++;
    });
    game.addEventListener('enterframe',function(){
      Frame++;
    });
    var cursol;
    game.onload = function() {
      //setStage();
      var Page=0,Next=false;
      var next=new Sprite(236,48);
      next.image=game.assets['next.png'];
      next.y=312;
      next.addEventListener('touchend',function(e){
        Next=true;
        this.scaleX=0.25;
      });
      next.addEventListener('enterframe',function(e){
        this.y=312+5*Math.sin(10*Frame/180*Math.PI);
        if(this.scaleX<1)this.scaleX+=0.1;
      });
      var title=new Sprite(240,57);
      title.image=game.assets['title.png'];
      title.y=100;
      set.addChild(next);
      set.addChild(title);
      var player=game.twitterAssets['account/verify_credentials'][0];
      var friends=new Array();
      for(var i in game.twitterAssets['statuses/friends']){
        friends.push(game.twitterAssets['statuses/friends'][i]);
      }
      var text1=new Sprite(240,19);
      text1.x=0;text1.y=10;text1.image=game.assets['message.png'];
      var text2=new Sprite(240,19);
      text2.x=0;text2.y=150;text2.image=game.assets['message.png'];text2.frame=1;
      var text3=new Sprite(240,19);
      text3.x=0;text3.y=10;text3.image=game.assets['message.png'];text3.frame=2;
      var f_num=friends.length;
      var f_page=0;
      var p_status=new Array();
      var p=new Player(120,180,0,player.toSprite().image);
      makeStatus(p,player,p_status);
      var wlabel=new Label("WEAPON");
      wlabel.color='white';
      wlabel.x=10;
      wlabel.y=180;
      p_status.push(wlabel);
      var w=new Sprite(46,46);
      w.image=game.assets['shot.png'];
      w.x=20;
      w.y=185;
      w.scaleX=0.5;
      w.scaleY=0.5;
      w.frame=2;
      var wl=new Label("YELLOW");
      wl.x=60;
      wl.y=200;
      wl.color='white';
      var right=new Sprite(32,32);
      right.image=game.assets['direct.png'];
      right.x=208;
      right.y=185+9;
      right.rotation=90;
      right.frame=3;
      var left=new Sprite(32,32);
      left.image=game.assets['direct.png'];
      left.x=0;
      left.y=185+9;
      left.rotation=-90;
      left.frame=3;
      right.addEventListener('enterframe',function(e){
        this.x=208+5*Math.sin(Frame/Math.PI);
      });
      right.addEventListener('touchstart',function(e){
        if(Page==2){
          p.weapon++;
          if(p.weapon>5)p.weapon=0;
          w.frame=p.weapon;
          wl.text=WeaponName[w.frame];
          right.frame=left.frame=w.frame+1;
        }else if(Page==3){
          f_page++;
          if(f_page>Math.ceil(f_num/6))f_page=Math.ceil(f_num/6);
        }
      });
      left.addEventListener('enterframe',function(e){
        this.x=-5*Math.sin(Frame/Math.PI);
      });
      left.addEventListener('touchstart',function(e){
        if(Page==2){
          p.weapon--;
          if(p.weapon<0)p.weapon=5;
          w.frame=p.weapon;
          wl.text=WeaponName[w.frame];
          right.frame=left.frame=w.frame+1;
        }else if(Page==3){
          f_page--;
          if(f_page<0)f_page=0;
        }
      });
      p_status.push(w);
      p_status.push(wl);
      p_status.push(right);
      p_status.push(left);
      
      var enemies=new Array();
      for(var i in friends){
        var status=new Array();
        var e=new Enemy(0,0,0,friends[i].toSprite().image);
        makeStatus(e,friends[i],status);
        enemies.push(e);
      }
      var d=rand(friends.length);
      var fake=new Enemy(0,0,0,friends[d].toSprite().image);
      
      while(fake.level<100){
        fake.levelUp();
      }
      while(fake.level<p.level+20){
        fake.levelUp();
      }
      fake.gage.opacity=0;
      fake.weapon=6;
      fake.name="Fake";fake.nameLabel.opacity=0;
      fake.ring.opacity=0;
      var e_icon=new Array();
      var e_name=new Array();
      var check=new Array();
      var t_num=0;
      for(var i=0;i<enemies.length;i++){
        var s=new Sprite(enemies[i].width,enemies[i].height);
        s.image=enemies[i].image;
        s.x=40+240*Math.floor(i/5);s.y=100+40*(i%5);
        if(enemies[i].width>=enemies[i].height){
          size=24/enemies[i].width;
        }else{
          size=24/enemies[i].height;
        }
        s.scaleX=s.scaleY=size;
        var l=new Label(enemies[i].name);
        l.x=85+240*Math.floor(i/5);l.y=100+40*(i%5);
        l.color='white';
        var lv=new Label("LV:"+enemies[i].level);
        lv.x=85+240*Math.floor(i/5);lv.y=120+40*(i%5);
        lv.color='yellow';
        if(enemies[i].level>=p.level+10)lv.color='red';
        if(enemies[i].level<=p.level-10)lv.color='blue';
        var c=new Sprite(36,36);
        c.image=game.assets['check.png'];
        c.x=20+240*Math.floor(i/5);c.y=100+40*(i%5);
        c.opacity=0;
        e_icon.push(s);
        e_name.push(l);
        e_name.push(lv);
        check.push(c);
        s.act=0;
        s.addEventListener('touchend',function(e){
            
            if(this.opacity<=1){
              //target.push(enemies[i]);
              this.opacity=2+(t_num++);
              this.scaleX*=5/3;
              this.scaleY*=5/3;
            }else{
              t_num--;
              this.opacity=1;
              this.scaleX/=5/3;
              this.scaleY/=5/3;
            }
          
        });
        s.addEventListener('enterframe',function(e){
          if(Frame%36==0){
            if(rand(10)==0){
              this.act=1;
            }else if(rand(9)==0){
              this.act=2;
            }else if(rand(8)==0){
              this.act=3;
            }else{
              this.act=0;
              this.rotation=0;
              this.scaleY=size;
            }
            
          }
          if(this.opacity>1){
              this.act=0;
              this.rotation=0;
              this.scaleY=size*5/3;
          }
          if(this.act==1){
            this.rotate(10);
            
          }else if(this.act==2){
            this.rotation=20*Math.sin(10*Frame/180*Math.PI);
            
          }else if(this.act==3){
            this.scaleY=size+0.5*size*Math.sin(10*Frame/180*Math.PI);
            
          }
        });
      }
      set.addEventListener('enterframe',function(e){
        if(Page==0){
          //タイトル
          if(Next==true){
            Page=1;
            Next=false;
            set.removeChild(title);
          }
        }else if(Page==1){
          //遊び方
          if(1){
            set.addChild(text1);
            set.addChild(text2);
            for(var i in p_status){
              set.addChild(p_status[i]);
            }
            Page=2;
            Next=false;
          }
        }else if(Page==2){
          //自機のステータス + 武器の選択
          if(Next==true){
            set.removeChild(text1);
            set.removeChild(text2);
            for(var i in p_status){
              set.removeChild(p_status[i]);
            }
            for(var i in e_icon){
              set.addChild(e_icon[i]);
            }
            for(var i in e_name){
              set.addChild(e_name[i]);
            }
            for(var i in check){
              set.addChild(check[i]);
            }
            right.frame=0;
            left.frame=0;
            set.addChild(right);
            set.addChild(left);
            set.addChild(text3);
            Page=3;
            Next=false;
          }
        }else if(Page==3){
          //敵のステータス+数の選択
          var ox=e_icon[0].x-40;
          var cx=-f_page*240;
          for(var i in e_icon){
            if(e_icon[i].opacity<=1)check[i].opacity=0;
            else check[i].opacity=1;
            if(ox<cx){
              e_icon[i].x+=20;
              check[i].x+=20;
            }
            if(ox>cx){
              e_icon[i].x-=20;
              check[i].x-=20;
            }
          }
          for(var i in e_name){
            if(ox<cx)e_name[i].x+=20;
            if(ox>cx)e_name[i].x-=20;
          }
          if(Next==true){
            for(var i in e_icon){
              if(e_icon[i].opacity>1){
                t=enemies[i];t.opacity=e_icon[i].opacity;
                target.push(t);
              }
              set.removeChild(e_icon[i]);
            }
            if(t_num==0){
              if(rand(2)==0){
                target.push(fake);
              }else{
                target.push(enemies[rand(enemies.length)]);
              }
            }
            for(var i in e_name){
              set.removeChild(e_name[i]);
            }
            for(var i in check){
              set.removeChild(check[i]);
            }
            for(var i in target){
              if(i%3==0){
                target[i].cx=120;
                target[i].cy=16;
              }else if(i%3==1){
                target[i].cx=16;
                target[i].cy=360-16;
              }else if(i%3==2){
                target[i].cx=240-16;
                target[i].cy=360-16;
              }
            }
            function t_sort(a,b){return a.opacity-b.opacity;}
            target.sort(t_sort);
            set.removeChild(right);
            set.removeChild(left);
            Page=4;
            Next=false;
            delete enemies;
            delete e_icon;
            delete e_name;
            delete e_name;
            delete check;
            delete friends;
            delete p_status;
            makeStage();
          }
        }
        
      });
      function makeStatus(machine,account,array){
        var exp=account.statuses_count+account.friends_count+2*account.followers_count;
        machine.getExp(exp);
        machine.name=account.name;
        //machine.comment=account.status.text;
        array.push(account.toSprite());
        array.push(new Label(account.name));
        array.push(new Label("LV:"+machine.level));
        array.push(new Label("HP:"+machine.hp));
        array.push(new Label("POW:"+machine.pow));
        array.push(new Label("DEF:"+machine.def));
        array.push(new Label("SPD:"+Math.ceil(machine.max_spd)));
        for(i=0;i<7;i++){
          if(i==0){
            array[i].x=50;
            array[i].y=50;
            array[i].scaleX=1.5;
            array[i].scaleY=1.5;
          }else if(i==1){
            array[i].x=40;
            array[i].y=24;
            array[i].color='white';
          }else{
            array[i].x=150;
            array[i].y=20*i;
            array[i].color='white';
          }
        }
      }
      set.backgroundColor = 'black';
      game.pushScene(set);
      //makeStage();
      function makeStage(){
          
      machines.splice(0,machines.length);
      machines.push(p);
      game.popScene();
      stage.backgroundColor = 'black';
      bg=new Sprite(240,320);
      bg.image=game.assets['vbg1.png'];
      bg.y=40;bg.frame=rand(3);
      if(target[0].weapon==6)bg.frame=3;
      stage.addChild(bg);
      cursol=new Sprite(32,32);
      cursol.image=game.assets['target.png'];
      cursol.addEventListener('enterframe', function() {
        if(Lockon==true){
          this.frame=1;
          this.x=Target.cx-16;
          this.y=Target.cy-16;
        }else{
          this.frame=0;
          this.x=touchX-16;
          this.y=touchY-16;
        }
      });
      
      pGage=new Sprite(10,10);
      pGage.image=game.assets['hp.png'];
      pGage.x=20;
      pGage.y=10;
      pGage.scaleY=0.25;
      pGage.addEventListener('enterframe', function(e) {
        if(Frame%5==0){
          this.frame++;
          cr=0;hp=machines[0].hp/machines[0].max_hp;
          if(hp<0.25)cr=3;
          else if(hp<0.5)cr=2;
          else if(hp<0.75)cr=1;
          if(this.frame>2*cr+1)this.frame=2*cr;
        }
        this.scaleX=22*machines[0].hp/machines[0].max_hp;
        if(this.scaleX<0)this.scaleX=0;
        this.x=5+5*this.scaleX;
      });
      playerName=new Label();
      playerName.x=10;playerName.y=0;
      playerName.color='white';
      playerName.addEventListener('enterframe', function(e) {
        this.text=machines[0].name+" Lv"+machines[0].level+" "+Math.ceil(machines[0].hp)+"/"+Math.ceil(machines[0].max_hp);
      });
      scoreLabel=new Label();
      scoreLabel.x=10;scoreLabel.y=320;
      scoreLabel.color='white';
      scoreLabel.font="24px HG正楷書体-PRO";
      scoreLabel.addEventListener('enterframe', function(e) {
        this.text="SCORE:"+Score;
      });
      game.pushScene(stage);
      
      
      stage.addEventListener('enterframe', function() {
        stageUpdate();
      });
      }
    };
    
    
    init=false;
    function stageUpdate(){
      //machineUpdate();
      if(machines.length<4 && target.length>0){
        machines.push(target[0]);
        target.splice(0,1);
      }
      for(var i in machines){
        if(machines[i].add==false){
          stage.addChild(machines[i]);
          stage.addChild(machines[i].ring);
          stage.addChild(machines[i].gage);
          stage.addChild(machines[i].nameLabel);
          for(var j in machines){/*
            stage.removeChild(machines[j].ring);
            stage.removeChild(machines[j].gage);
            stage.removeChild(machines[j].nameLabel);
            stage.addChild(machines[j].ring);
            stage.addChild(machines[j].gage);
            stage.addChild(machines[j].nameLabel);
            */
            stage.removeChild(pGage);
            stage.removeChild(playerName);
            stage.removeChild(cursol);
            stage.removeChild(scoreLabel);
            stage.addChild(pGage);
            stage.addChild(playerName);
            stage.addChild(cursol);
            stage.addChild(scoreLabel);
          }
          machines[i].gage.image=game.assets['hp.png'];
          machines[i].ring.image=game.assets['direct.png'];
          machines[i].setColor();
          machines[i].add=true;
          
        }
        machines[i].update();
        if(machines[i].died==true){
          stage.removeChild(machines[i]);
          stage.removeChild(machines[i].ring);
          stage.removeChild(machines[i].nameLabel);
          stage.removeChild(machines[i].gage);
          if(i!=0)machines.splice(i,1);
        }
      }
      //shotUpdate();
      for(var i in shots){
        if(shots[i].add==false){
          shots[i].image=game.assets['shot.png'];
          stage.addChild(shots[i]);
          for(var j in shots[i].parts)
            stage.addChild(shots[i].parts[j]);
          shots[i].add=true;
        }
        shots[i].update();
        if(shots[i].died==true){
          stage.removeChild(shots[i]);
          stage.removeChild(shots[i].nameLabel);
          for(var j in shots[i].parts)
            stage.removeChild(shots[i].parts[j]);
          shots.splice(i,1);
        }
      }
      
      if(init==false){
        stage.addChild(pGage);
        stage.addChild(playerName);
        stage.addChild(cursol);
        stage.addChild(scoreLabel);
        init = true;
      }
      if(machines[0].hp>0 && machines.length==1 && target.length==0){
        End++;
        scoreLabel.color='yellow';
      }
      if(machines[0].died==true){
        End++;
        Score=0;
        scoreLabel.color='red';
      }
      if(End>100){
        game.end(Score);
      }
    }
    
    

    game.start();
    //game.debug();
};

function rand(num){ return Math.floor(Math.random() * num) };
