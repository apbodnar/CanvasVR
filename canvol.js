var canvas=document.getElementById('myCanvas');
var ctx=canvas.getContext('2d');

var size = 256;

canvas.width = size*2;
canvas.height = size*2;
var contents;
var volume = {};
volume.volumeData = [];


function openRawFile(evt){
    var f = evt.target.files[0]; 
	if (f) {
		var r = new FileReader();
		r.onload = function(e) { 
			contents = e.target.result;
			//parseRawFile(contents);
		}
		r.readAsBinaryString(f);
		//r.readAsText(f);
	} else { 
		alert("Failed to load file");
	}
}

function texCoord(x,y,z){
	//return Math.round(size-x-1)+Math.round((size-y-1)*size)+Math.round(z*size*size);
	s = Math.round(x)+Math.round(y*size)+Math.round(z*size*size);
	if(s < 0)
		return 0;
	else if(s >= size*size*size)
		return size*size*size-1;
	else
		return s;
}

function getColor(s){
	if(s<40){
		return "rgba(0,0,0,0)"
	}
	else if(s < 80){
		return "rgba(0,0,0,0)"
		//return "rgba("+0+","+s*2+","+0+","+s/256+")";
	}
	else{
		return "rgba("+s+","+0+","+0+","+s/256+")";
	}
}

function parseRawFile(contents){
	//ctx.fillRect(10,10,10,10);
	var rx = parseInt(document.getElementById('xrot').value);
	var ry = parseInt(document.getElementById('yrot').value);
	var c = [128,128,128];
	var nc = rotateY(c, ry);
	var t = [c[0]-nc[0],c[1]-nc[1],c[2]-nc[2]]
	//nc = rotateX(nc, rx);
	
	volume.volumeData = []
	for(z=0; z<size; z++){
		var layer = document.createElement('canvas');
		layer.width  = size;
		layer.height = size;
		var lctx = layer.getContext('2d');
		console.log(z);
		for(x=0; x<size; x++){
			for(y=0; y<size; y++){
				var v = [x,y,z];
				var nv = rotateY(v, ry);
				nv = [nv+t[0],nv+t[1],nv+t[2]];
				//nv = rotateX(nv, rx);
				lctx.fillStyle = getColor(contents.charCodeAt(texCoord(nv[0],nv[1],nv[2])));
				lctx.fillRect(x,y,1,1)
			}
		}
		volume.volumeData.push(layer);
	}
	volume.draw();
}

function rotateX(v, theta){
	yp = v[1]*Math.cos(theta) - v[2]*Math.sin(theta);
	zp = v[1]*Math.sin(theta) + v[2]*Math.cos(theta);
	return [v[0],yp,zp];
}

function rotateY(v, theta){
	t = theta*Math.PI/180.0;
	xp = v[0]*Math.cos(t) + v[2]*Math.sin(t);
	zp = -v[0]*Math.sin(t) + v[2]*Math.cos(t);
	return [xp,v[1],zp];
}

 function bilinear(pixels, x, y, offset, width) {
        var percentX = x - (x ^ 0);
        var percentX1 = 1.0 - percentX;
        var percentY = y - (y ^ 0);
        var fx4 = (x ^ 0) * 4;
        var cx4 = fx4 + 4;
        var fy4 = (y ^ 0) * 4;
        var cy4wo = (fy4 + 4) * width + offset;
        var fy4wo = fy4 * width + offset;
    
        var top = pixels[cy4wo + fx4] * percentX1 + pixels[cy4wo + cx4] * percentX;
        var bottom = pixels[fy4wo + fx4] * percentX1 + pixels[fy4wo + cx4] * percentX;
    
        return top * percentY + bottom * (1.0 - percentY);
}


document.getElementById('fileinput').addEventListener('change', openRawFile, false);

volume.draw = function(){
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.scale(2,2);
	for(var i=0; i<this.volumeData.length; i++){
		ctx.drawImage(this.volumeData[i],0,0);
	}
	ctx.restore();
}

