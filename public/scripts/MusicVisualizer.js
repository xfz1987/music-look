/**
 * 可视化音乐插件
 * created by xfz
 */
(function(){
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

	function MusicVisualizer(options){
		if(this instanceof MusicVisualizer){
			this.init(options);
		}else{
			return new MusicVisualizer(options);
		}
	}

	MusicVisualizer.ac = new (window.AudioContext ||window.webkitAudioContext || window.mozAudioContext)();

	MusicVisualizer.prototype.init = function(options){
		//当前正在播放的bufferSource
		this.source = null;

		//选择过的资源数的累计值
		this.count = 0;

		//音频分析对象
		this.analyser = MusicVisualizer.ac.createAnalyser();

		//unit8Array的长度
		this.size = options.size;

		this.analyser.fftSize = this.size * 2;

		//控制音量的GainNode
		this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? 'createGain' : 'createGainNode']();

		//将节点连接
		this.gainNode.connect(MusicVisualizer.ac.destination);
		this.analyser.connect(this.gainNode);

		//ajax对象
		this.xhr = (window.XMLHttpRequest != undefined) ? (new XMLHttpRequest()) : (new ActiveXObject('Microsoft.XMLHttp'));

		//可视化配
		this.visulizer = options.visulizer;

	};

	//ajax请求音乐资源列表
	MusicVisualizer.prototype.load = function(url, fn){
		this.xhr.abort();//结束上一次还没相应的请求
		this.xhr.open('GET', url);
		this.xhr.responseType = 'arraybuffer';
		var self = this;
		this.xhr.onload = function(){
			fn(self.xhr.response);
		}
		this.xhr.send();
	};

	//将arraybuffer数据decode得到buffer
	//
	MusicVisualizer.prototype.decode = function(arraybuffer, fn){
		MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer){
			fn(buffer);
		}, function(err){
			console.error(err);
		});
	}

	//播放mv对象的source,mv.onended为播放结束后的回调
	MusicVisualizer.prototype.play = function(url){
		var n = ++this.count;
		var self = this;
		this.source && this.stop();
		this.load(url, function(arraybuffer){
			if(n !== self.count) return false;//防止同时播放多首活重复请求
			self.decode(arraybuffer, function(buffer){
				if(n !== self.count) return false;//防止同时播放多首活重复请求
				var bs = MusicVisualizer.ac.createBufferSource();
				bs.buffer = buffer;
				bs.connect(self.analyser);
				bs[bs.start ? 'start' : 'noteOn'](0);
				self.source = bs;
				if(self.count <=1) self.visulize();
			});
		});
	}

	//停止音乐播放
	MusicVisualizer.prototype.stop = function(){
		this.source[this.source.stop ? 'stop' : 'noteOff'](0);
	};

	//音量控制
	MusicVisualizer.prototype.changeVolumn = function(percent){
		this.gainNode.gain.value = percent * percent;
	};

	//可视化
	MusicVisualizer.prototype.visulize = function(){
		var arr = new Uint8Array(this.analyser.frequencyBinCount);
		var self = this;
		function v(){
			self.analyser.getByteFrequencyData(arr);
			self.visulizer(arr);
			requestAnimationFrame(v);
		}
		requestAnimationFrame(v);
	};

	window['MusicVisualizer'] = MusicVisualizer;
})();

