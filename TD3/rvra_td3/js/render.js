var canvas, context, imageData, imageDst;

var renderer;

var Menu = function() {
    this.threshold = false;
    this.color = [255, 0, 0];
    this.tolerance = 0;
};

var menu, stats;

function init() {

    canvas = document.getElementById("canvas");
    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);

    context = canvas.getContext("2d");

    imageDst = new ImageData( canvas.width, canvas.height)

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvas.width, canvas.height);
    renderer.setClearColor(0xffffff, 1);
    document.getElementById("container").appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    scene.add(camera);
    texture = createTexture();
    scene.add(texture);

    // GUI
    menu = new Menu();
    var gui = new dat.GUI();
    gui.add(menu, 'threshold');
    gui.addColor(menu, "color").listen();
    gui.add(menu, "tolerance", 0., 100.);

    canvas.addEventListener('click', function(event){
	pixel = context.getImageData(event.layerX, event.layerY, 1, 1);
	menu.color = [pixel.data[0], pixel.data[1], pixel.data[2]];
    });
    
    // stats
    stats = new Stats();
    document.getElementById("container").appendChild( stats.dom );

    animate();
}

function thresholdRGBImage(imgSrc, imgDst, threshold, tolerance){

    srcData = imgSrc.data;
    dstData = imgDst.data;
    hsvSrcData = srcData;
    
    // for(i = 0 ; i < srcData.length ; i+=4){
    // 	[h, s, v] = rgb2hsv(srcData[i], srcData[i+1], srcData[i+2]);
    // 	hsvSrcData[i] = h/360;
    // 	hsvSrcData[i+1] = s;
    // 	hsvSrcData[i+2] = v;
    // }
    
    hsvThreshold = [0, 0, 0];
    [h, s, v] = rgb2hsv(threshold[0], threshold[1], threshold[2]);
    
    hsvThreshold[0] = h/360*255;
    hsvThreshold[1] = s;
    hsvThreshold[2] = v;

    // console.log("hsvThreshold[0] : "+hsvThreshold[0]);
    var dstBin = new CV.Image(imgDst.width, imgDst.height);
    
    index = 0;
    for(i = 0 ; i < srcData.length ; i+=4){
    	[h, s, v] = rgb2hsv(srcData[i], srcData[i+1], srcData[i+2]);
	
    	var value = (Math.abs(h/360*255 - hsvThreshold[0]) < tolerance  &&
    		     s > 0.4 &&
    		     v > 0.4)? 255 : 0;
	
    	dstData[i] = dstData[i+1] = dstData[i+2] = value;
    	dstBin.data[index++] = value;
    }

    
    
    // for(i = 0 ; i < srcData.length ; i+=4){
    // 	dstData[i] = dstData[i+1] = dstData[i+2] = (Math.abs(srcData[i] - threshold[0]) < tolerance &&
    // 						    Math.abs(srcData[i+1] - threshold[1]) < tolerance &&
    // 						    Math.abs(srcData[i+2] - threshold[2]) < tolerance) ? 255 : 0;
    
    // 	dstBin.data[index++] = (Math.abs(srcData[i] - threshold[0]) < tolerance &&
    // 				Math.abs(srcData[i+1] - threshold[1]) < tolerance &&
    // 				Math.abs(srcData[i+2] - threshold[2]) < tolerance) ? 255 : 0;
    // }

    return dstBin;
}

function createTexture() {
    var texture = new THREE.Texture(imageDst),
	object = new THREE.Object3D(),
	geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0),
	material = new THREE.MeshBasicMaterial( {map: texture, depthTest: false, depthWrite: false} ),
	mesh = new THREE.Mesh(geometry, material);

    texture.minFilter = THREE.NearestFilter;

    object.position.z = -1;

    object.add(mesh);

    return object;
}

function undistortPoint([u, v]){
    camera_matrix = math.matrix([[5.0721723504492570e+02, 0., 3.1950000000000000e+02],
				 [0., 5.0721723504492570e+02, 2.3950000000000000e+02],
				 [0., 0., 1.]]);

    distortion_coefficients = [-8.7835307711856409e-02, -1.2925926432930088e-01, 0., 0., 1.3808115810158292e-01];

    //http://docs.opencv.org/modules/imgproc/doc/geometric_transformations.html#initundistortrectifymap
    
    fx = 5.0721723504492570e+02;
    fy = 5.0721723504492570e+02;
    cx = 3.1950000000000000e+02;
    cy = 2.3950000000000000e+02;

    x = (u - cx)/fx;
    y = (v - cy)/fy;

    //skip the part with R as it is an identity matrix, and X/W -> x/1 -> x

    // x2 = x*(1+

    
    
}

function animate() {

    requestAnimationFrame( animate );

    if (video.readyState === video.HAVE_ENOUGH_DATA){
	context.drawImage(video, 0, 0, canvas.width, canvas.height);
	imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	var tmp = new CV.Image(canvas.width, canvas.height)

	if(menu.threshold){
	    
	    bin = thresholdRGBImage(imageData, imageDst, menu.color, menu.tolerance)
	    // CV.grayscale(imageData, imageDst);
	    
	    contours = CV.findContours(bin, tmp);

	    var biggestArea = 0;
	    var biggestContour;
	    var biggestContourCenterX = 0;
	    var biggestContourCenterY = 0;
	    var biggestContourRadius;
	    // console.log("size contours : "+contours.length);
	    // console.log("bin width : "+bin.width);
	    for(var i = 0 ; i < contours.length ; i++){
		
		minX = 10000;
		maxX = 0;
		minY = 100000;
		maxY = 0;
		c = contours[i];

		for(var j = 0 ; j < c.length ; j++){
		    currentX = c[j].x;
		    currentY = c[j].y;
		    if(currentX < minX)
			minX = currentX;
		    
		    if(currentX > maxX)
			maxX = currentX;
		    
		    if(currentY < minY)
			minY = currentY;
		    
		    if(currentY > maxY)
			maxY = currentY;
		}

		areaC = (maxX-minX)*(maxY-minY);
		
		if(areaC > biggestArea){
		    biggestArea = areaC;
		    biggestContour = c;
		    biggestContourCenterX = (maxX-minX)/2+minX;
		    biggestContourCenterY = (maxY-minY)/2+minY;
		    biggestContourRadius = Math.sqrt((maxX-minX)*(maxX-minX) + (maxY-minY)*(maxY-minY))/2;
		}
	    }

	    // console.log(biggestContourCenterX+" "+biggestContourCenterY);

	    var img = new Image();
	    img.src = 'batst_tear.png';
	    
	    context.beginPath();
	    context.lineWidth = 10;
	    context.strokeStyle = '#ff0000';
	    context.arc(biggestContourCenterX, biggestContourCenterY,biggestContourRadius,0,2*Math.PI);

	    f = 5.0721723504492570e+02;
	    
	    x3D = biggestContourCenterX*displayParameters.pixelPitch();
	    y3D = biggestContourCenterY*displayParameters.pixelPitch();
	    z3D = ((76*f)/biggestContourRadius*displayParameters.pixelPitch())*2;
	    
	    console.log("x : "+x3D+", y : "+y3D+", z3D : "+z3D);
	    
	    
	    context.drawImage(img, biggestContourCenterX-biggestContourRadius*2/2, biggestContourCenterY-biggestContourRadius*2/2, biggestContourRadius*2, biggestContourRadius*2);
	    context.stroke();
	    
	    
	}
	else
	    imageDst.data.set(imageData.data);

	texture.children[0].material.map.needsUpdate = true;
	render();
    }
}

function findCentroid(poly){

    var area = 0;
    for(var i = 0 ; i < poly.length-1 ; i++){
	var x = poly[i].x;
	var y = poly[i].y;
	var x1 = poly[i+1].x; 
	var y1 = poly[i+1].y; 
	area += (x*y1 - x1*y);	
    }

    area /= 2;

    Cx = 0;
    Cy = 0;
    
    for(var i = 0 ; i < poly.length-1 ; i++){
	var x = poly[i].x;
	var y = poly[i].y;
	var x1 = poly[i+1].x; 
	var y1 = poly[i+1].y; 

	Cx += (x+x1)*(x*y1 - x1*y);
	Cy += (y+y1)*(x*y1 - x1*y);
	
    }

    Cx /= (6*area);
    Cy /= (6*area);

    return [Cx, Cy];
}

function rgb2hsv (r,g,b) {
    
    var computedH = 0;
    var computedS = 0;
    var computedV = 0;

    //remove spaces from input RGB values, convert to int
    // var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
    // var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
    // var b = parseInt( (''+b).replace(/\s/g,''),10 ); 

    if ( r==null || g==null || b==null ||
	 isNaN(r) || isNaN(g)|| isNaN(b) ) {
	alert ('Please enter numeric RGB values!');
	return;
    }
    if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
	alert ('RGB values must be in the range 0 to 255.');
	return;
    }
    r=r/255; g=g/255; b=b/255;
    var minRGB = Math.min(r,Math.min(g,b));
    var maxRGB = Math.max(r,Math.max(g,b));

    // Black-gray-white
    if (minRGB==maxRGB) {
	computedV = minRGB;
	return [0,0,computedV];
    }

    // Colors other than black-gray-white:
    var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
    var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
    computedH = 60*(h - d/(maxRGB - minRGB));
    computedS = (maxRGB - minRGB)/maxRGB;
    computedV = maxRGB;
    return [computedH,computedS,computedV];
}


function render() {

    renderer.clear();
    renderer.render(scene, camera);

    stats.update();

}
