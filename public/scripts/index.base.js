!function(){
	window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60)
                }
    })();
    
    var $ = function(s){return document.querySelectorAll(s);};

    //创建canvas
	var box = $('#box')[0];
	var width,height;
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	box.appendChild(canvas);

	var xhr = (window.XMLHttpRequest != undefined) ? (new XMLHttpRequest()) : (new ActiveXObject('Microsoft.XMLHttp'));
	var ac = new (window.AudioContext || window.webkitAudioContext);//创建音频上下文
	var gainNode = ac[ac.createGain ? 'createGain' : 'createGainNode']();//控制音量大小
	gainNode.connect(ac.destination);
	
	var analyser = ac.createAnalyser();
	var size = 128;
	analyser.fftSize = 128 * 2;
	analyser.connect(gainNode);

	var changeVolumn = function(percent){gainNode.gain.value = percent * percent;};//调整音量
	
	var Dots = [];

	var random = function(m, n){
		return Math.round(Math.random() * (n - m) + m);
	}
	var getDots = function(){
		Dots.length = 0;
		for(var i=0;i<size;i++){
			var x = random(0, width);
			var y = random(0, height);
			var color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
			Dots.push({x:x, y:y , color:color});
		}
	}

	var line;
	var init = function(){
		width = box.clientWidth;
		height = box.clientHeight;
		canvas.width = width;
		canvas.height = height;
		line = ctx.createLinearGradient(0, 0, 0, height);
		line.addColorStop(0, 'red');
		line.addColorStop(0.5, 'yellow');
		line.addColorStop(1, 'green');
		getDots();
	};
	init();

	window.onresize = init;	

	var draw = function(arr){
		ctx.clearRect(0, 0, width, height);
		var w = width / size;
		ctx.fillStyle = line;
		for(var i=0,len=arr.length;i<len;i++){
			if(draw.type == 'column'){
				var h = arr[i] / 256 * height;
				ctx.fillRect(w*i, height-h, w*0.6, h);
			}else{
				ctx.beginPath();
				var o = Dots[i];
				var r = arr[i] / 256 * 50;
				ctx.arc(o.x, o.y, r, 0, Math.PI*2);
				var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
				g.addColorStop(0, '#fff');
				g.addColorStop(1, o.color);
				ctx.fillStyle = g;
				ctx.fill();
			}
		}
	}
	draw.type = 'column';
	
	//切换类型
	!function(){
		var types = document.querySelectorAll(".type li");
		for(var i = 0; i < types.length; i++){
			types[i].onclick = function(){
				for(var j = 0; j < types.length; j++){
					types[j].className = "";
				}
				this.className = "selected";
				draw.type = this.type;
			}
		}
	}();

	var visulizer = function(){
		var arr = new Uint8Array(analyser.frequencyBinCount);
		function v(){
			analyser.getByteFrequencyData(arr);
			draw(arr);
			requestAnimationFrame(v);
		}
		requestAnimationFrame(v);
	}

	var source = null;
	var count = 0;

	//请求歌曲
	var load = function(url){
		var n = ++count;
		source && source[source.stop ? 'stop' : 'noteOff']();
		xhr.abort();//结束请求
		xhr.open('GET', url);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(){
			if(n !== count) return false;//防止同时播放多首活重复请求 ？？？？？
			ac.decodeAudioData(xhr.response, function(buffer){
				if(n !== count) return false;//防止同时播放多首活重复请求
				var bufferSource = ac.createBufferSource();
				bufferSource.buffer = buffer;
				bufferSource.connect(analyser);
				bufferSource[bufferSource.start ? 'start' : 'noteOn'](0);
				source = bufferSource;
				if(count <= 1) visulizer();//只执行一次，否则重复了
			}, function(err){
				console.error(err);
			});
		}
		xhr.send();
	}

	//切换歌曲
	!function(){
		var list = $('#list li');
		for(var i=0,len=list.length;i<len;i++){
			list[i].onclick = function(){
				for(var j=0;j<len;j++) list[j].className = '';
				this.className = 'selected';
				load('/media/' + this.title)
			}
		}
	}()

	//调整音量
	$('#volume')[0].onchange = function(){
		changeVolumn(this.value / this.max);
	}
	//默认生效
	$('#volume')[0].onchange();

}();

