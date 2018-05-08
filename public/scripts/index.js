!function(){
    //获取dom对象集合
    var $ = function(s){return document.querySelectorAll(s);};

    //创建canvas
	var box = $('#box')[0];
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	box.appendChild(canvas);

	/* 初始化参数 */
	var width,height,
	    size = 32,//脉冲大小
	    Dots = [],//可视化圆点集合
	    lineStyle = [];//可视化矩形样式

	var random = function(m, n){
		return Math.round(Math.random() * (n - m) + m);
	}
	var getDots = function(){
		Dots.length = 0;
		for(var i=0;i<size;i++){
			var x = random(0, width);
			var y = random(0, height);
			var color = 'rgba(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ',0)';
			Dots.push({x:x, y:y, dx:random(1,4), color:color, cap: 0});
		}
	}

	//canvas初始化
	var init = function(){
		width = box.clientWidth;
		height = box.clientHeight;
		canvas.width = width;
		canvas.height = height;
		lineStyle = ctx.createLinearGradient(0, 0, 0, height);
		lineStyle.addColorStop(0, 'red');
		lineStyle.addColorStop(0.5, 'yellow');
		lineStyle.addColorStop(1, 'green');
		getDots();
	};
	init();

	window.onresize = init;

	var draw = function(arr){
		ctx.clearRect(0, 0, width, height);
		var w = width / size;
		var cw = w * 0.6;
		var capH = cw > 10 ? 10 : cw;
		ctx.fillStyle = lineStyle;
		for(var i=0,len=arr.length;i<len;i++){
			var o = Dots[i];
			if(draw.type == 'column'){
				var h = arr[i] / 256 * height;
				ctx.fillRect(w*i, height-h, w*0.6, h);
				ctx.fillRect(w*i, height-o.cap-capH, cw, capH);
				o.cap--;
				if(o.cap < 0) o.cap = 0;
				if(h > 0 && o.cap < h + 40){
					o.cap = h + 40;
					if(o.cap > height - capH) o.cap = height - capH; 
				} 
			}else{
				ctx.beginPath();
				// var r = arr[i] / 256 * 50;
				var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10;
				ctx.arc(o.x, o.y, r, 0, Math.PI*2);
				var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
				g.addColorStop(0, '#fff');
				g.addColorStop(1, o.color);
				ctx.fillStyle = g;
				ctx.fill();
				o.x += o.dx;
				if(o.x > width) o.x = 0;
			}
		}
	}
	draw.type = 'column';


	//可视化插件对象
	var mv = new MusicVisualizer({
		size: size,
		visulizer: draw
	});
	

	//切换类型
	var types = document.querySelectorAll(".type li");
	!function(){
		for(var i = 0; i < types.length; i++){
			types[i].onclick = function(){
				for(var j = 0; j < types.length; j++){
					types[j].className = "";
				}
				this.className = "selected";
				draw.type = this.getAttribute('data-type');
			}
		}
	}();

	//切换歌曲
	var list = $('#list li');
	!function(){
		for(var i=0,len=list.length;i<len;i++){
			list[i].onclick = function(){
				for(var j=0;j<len;j++) list[j].className = '';
				this.className = 'selected';
				mv.play('/media/' + this.title)
			}
		}
	}()
	list[1].onclick();

	//调整音量
	$('#volume')[0].oninput = function(){
		mv.changeVolumn(this.value / this.max);
	}
	//默认生效
	$('#volume')[0].oninput();
}();

