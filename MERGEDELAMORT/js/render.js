var camera, controls, scene, renderer;

var anaglyphRenderer, dofRenderer;

var container, stats;

var cameraOrtho, sceneOrtho;

var clock;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var pointerLocked = false;

var velocity = new THREE.Vector3(0,0,0);

var canvas, context, imageData, imageDst;

var renderer_video, scene_video, camera_video;

var Menu = function() {
    this.threshold = false;
    this.controls = false;
    this.anaglyph = false;
    this.depthOfField = false;
    this.color = [255, 0, 0];
    this.tolerance = 10;
};

var menu, stats;

var x3D = 0;
var y3D = 0;
var z3D = 0;

function init() {

    canvas = document.getElementById("canvas");
    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);

    context = canvas.getContext("2d");

    imageDst = new ImageData( canvas.width, canvas.height)

    renderer_video = new THREE.WebGLRenderer();
    renderer_video.setSize(canvas.width, canvas.height);
    renderer_video.setClearColor(0xffffff, 1);
    document.getElementById("container").appendChild(renderer_video.domElement);
    scene_video = new THREE.Scene();
    camera_video = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    scene_video.add(camera_video);
    texture = createTexture();
    scene_video.add(texture);

    // GUI
    menu = new Menu();
    var gui = new dat.GUI();
    gui.add(menu, 'threshold');
    gui.add(menu, 'controls');
    gui.add(menu, 'anaglyph');
    gui.add(menu, 'depthOfField');
    gui.addColor(menu, "color").listen();
    gui.add(menu, "tolerance", 0., 100.);

    canvas.addEventListener('click', function(event){
	pixel = context.getImageData(event.layerX, event.layerY, 1, 1);
	menu.color = [pixel.data[0], pixel.data[1], pixel.data[2]];
    });

    // stats
    stats = new Stats();
    document.getElementById("container").appendChild( stats.dom );


    clock = new THREE.Clock();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // camera

    var fov = THREE.Math.radToDeg(Math.atan( displayParameters.screenSize().y/ displayParameters.distanceScreenViewer));
    camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 100000 );

    cameraOrtho = new THREE.OrthographicCamera( - window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, - window.innerHeight / 2, 1, 10 );
    cameraOrtho.position.z = 10;

    // scene

    scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 100, 100, 100 );

    var tnt1 = new THREE.TextureLoader().load( 'textures/tnt1.png' );
    var tnt2 = new THREE.TextureLoader().load( 'textures/tnt2.png' );
    var sand = new THREE.TextureLoader().load( 'textures/sand.png' );
    var stonebrick = new THREE.TextureLoader().load( 'textures/stonebrick.png' );
    var stonebrick_mossy = new THREE.TextureLoader().load( 'textures/stonebrick_mossy.png' );

    var tex_sadbatst = new THREE.TextureLoader().load("textures/sadbatst.png");

    var mat_tnt1 = new THREE.MeshBasicMaterial( { map: tnt1 } );
    var mat_tnt2 = new THREE.MeshBasicMaterial( { map: tnt2 } );
    var mat_sand = new THREE.MeshBasicMaterial( { map: sand } );
    var mat_stonebrick = new THREE.MeshBasicMaterial( { map: stonebrick } );
    var mat_stonebrick_mossy = new THREE.MeshBasicMaterial( { map: stonebrick_mossy } );

    var mat_sadbatst = new THREE.MeshBasicMaterial({map:tex_sadbatst});

    var cube_tnt = new THREE.Mesh( geometry, [mat_tnt1, mat_tnt1, mat_tnt2, mat_tnt2, mat_tnt1, mat_tnt1] );

    cube_tnt.position.y = 100;
    cube_tnt.position.z = - displayParameters.distanceScreenViewer;

    var cube_sand = new THREE.Mesh( geometry, mat_sand );
    cube_sand.position.y = -100;
    var cube_stonebrick = new THREE.Mesh( geometry, mat_stonebrick );
    var cube_stonebrick_mossy = new THREE.Mesh( geometry, mat_stonebrick_mossy );

    var color = new THREE.Color();
    for (var j = -10; j < 10; j++) {
	for (var k = -10; k < 10; k++) {
	    var cs = cube_sand.clone();
	    var geom = new THREE.BoxGeometry( 100, 100, 100 );
	    applyFaceColor( geom , cs.id );
	    cs.geometry = geom;
	    cs.position.x = j*100;
	    cs.position.z = k*100 - displayParameters.distanceScreenViewer;
	    scene.add( cs );

	    var cm;
	    if(Math.random() > 0.25) {
		cm = cube_stonebrick.clone();
	    } else {
		cm = cube_stonebrick_mossy.clone();
	    }
	    var geom = new THREE.BoxGeometry( 100, 100, 100 );
	    applyFaceColor( geom , cm.id );
	    cm.geometry = geom;
	    cm.position.x = j*100;
	    cm.position.z = k*100 - displayParameters.distanceScreenViewer;
	    scene.add( cm );
	}
    }

    applyFaceColor( cube_tnt.geometry , cube_tnt.id );
    scene.add( cube_tnt );

    // aim
    sceneOrtho = new THREE.Scene();
    var line_material = new THREE.LineBasicMaterial({ color: 0xffffff });
    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(-20, 0, 1));
    line_geometry.vertices.push(new THREE.Vector3(20, 0, 1));
    var line = new THREE.Line(line_geometry, line_material);
    sceneOrtho.add(line);
    line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(0, -20, 1));
    line_geometry.vertices.push(new THREE.Vector3(0, 20, 1));
    var line = new THREE.Line(line_geometry, line_material);
    sceneOrtho.add(line);

    // renderers
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    renderer.autoClear = false;

    anaglyphRenderer = new AnaglyphRenderer( renderer );
    dofRenderer = new DoFRenderer( renderer );

    pickingTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
    pickingTexture.texture.minFilter = THREE.LinearFilter;

    // trackball

    // controls = new THREE.TrackballControls( camera, renderer.domElement );

    controls = new THREE.PointerLockControls( camera, renderer.domElement );

    // controls = new THREE.PointerLockControls( camera, anaglyphRenderer.domElement );

    scene.add( controls.getObject() );
    controls.enabled = true;

    var onKeyDown = function ( event ) {

	switch ( event.keyCode ) {

	case 38: // up
	case 90: // z
	    moveForward = true;
	    break;

	case 37: // left
	case 81: // q
	    moveLeft = true; break;

	case 40: // down
	case 83: // s
	    moveBackward = true;
	    break;

	case 39: // right
	case 68: // d
	    moveRight = true;
	    break;

	}

    };

    var onKeyUp = function ( event ) {

	switch( event.keyCode ) {

	case 38: // up
	case 90: // z
	    moveForward = false;
	    break;

	case 37: // left
	case 81: // q
	    moveLeft = false;
	    break;

	case 40: // down
	case 83: // s
	    moveBackward = false;
	    break;

	case 39: // right
	case 68: // d
	    moveRight = false;
	    break;

	}

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // stats

    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( 'mousedown', pick, false );
    animate();
}

function applyFaceColor( geom, color ) {
    geom.faces.forEach( function( f ) {
	f.color.setHex(color);
    } );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    cameraOrtho.left = - window.innerWidth / 2;
    cameraOrtho.right = window.innerWidth / 2;
    cameraOrtho.top = window.innerHeight / 2;
    cameraOrtho.bottom = - window.innerHeight / 2;
    cameraOrtho.updateProjectionMatrix();

    dofRenderer.setSize( window.innerWidth, window.innerHeight );

    render();
}

function thresholdRGBImage(imgSrc, imgDst, threshold, tolerance){

    srcData = imgSrc.data;
    dstData = imgDst.data;
    hsvSrcData = srcData;

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

    //For rgb version
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


//Pas encore utilisé (pas fini)
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
	    if(contours.length == 0){
		x3D = 0.;
		y3D = 0.;
		z3D = 0.;
	    }
	    else{

		var biggestArea = 0;
		var biggestContour;
		var biggestContourCenterX = 0;
		var biggestContourCenterY = 0;
		var biggestContourRadius;
		
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

		var img = new Image();
		var img2 = new Image();
		img.src = 'batst_tear.png';
		img2.src = 'surprise.png';

		context.beginPath();
		context.lineWidth = 10;
		context.strokeStyle = '#ff0000';

		f = 5.0721723504492570e+02;

		postItWidth = 90;
		if(biggestContourRadius>5){//Pour eviter d'avoir des valeurs bizarres quand le postit sort de l'écran -> contours du potentiel bruit
		    x3D = biggestContourCenterX*displayParameters.pixelPitch();
		    y3D = biggestContourCenterY*displayParameters.pixelPitch();
		    z3D = ((postItWidth*f)/biggestContourRadius*displayParameters.pixelPitch())*2;
		}
		else{
		    x3D = 0.;
		    y3D = 0.;
		    z3D = 0.;		    
		} 

		//Misc
		// context.drawImage(img2, biggestContourCenterX-biggestContourRadius*2/2-40, biggestContourCenterY-biggestContourRadius*2/2+20, biggestContourRadius*3, biggestContourRadius*3);
		// context.drawImage(img, biggestContourCenterX-biggestContourRadius*2/2, biggestContourCenterY-biggestContourRadius*2/2, biggestContourRadius*2, biggestContourRadius*2);
		context.stroke();

	    }

	}
	else
	    imageDst.data.set(imageData.data);

	texture.children[0].material.map.needsUpdate = true;
	//render();
    }
    render();
}

function pick(event) {

    scene.overrideMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );

    renderer.render( scene, camera, pickingTexture );

    //create buffer for reading single pixel
    var pixelBuffer = new Uint8Array( 4 );

    //read the pixel at the center from the texture
    if(pointerLocked)
	renderer.readRenderTargetPixels(pickingTexture, pickingTexture.width/2, pickingTexture.height/2, 1, 1, pixelBuffer);
    else
	renderer.readRenderTargetPixels(pickingTexture, event.clientX, pickingTexture.height - event.clientY, 1, 1, pixelBuffer);

    //interpret the pixel as an ID

    var id = ( pixelBuffer[0] << 16 ) | ( pixelBuffer[1] << 8 ) | ( pixelBuffer[2] );

    var obj = scene.getObjectById(id);
    if(event.button === 2) {
	scene.remove(obj);
    } else if (event.button === 1) {
	var c = obj.clone();
	var geom = new THREE.BoxGeometry( 100, 100, 100 );
	applyFaceColor( geom , c.id );
	c.geometry = geom;
	c.position.y = obj.position.y + 100;
	scene.add( c );
    }

    scene.overrideMaterial = null;
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

    var delta = clock.getDelta();
    //controls.enabled = false;
    //if(pointerLocked){
    
    controls.enabled = menu.controls;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    if ( moveForward ) velocity.z -= 1500.0 * delta;
    if ( moveBackward ) velocity.z += 1500.0 * delta;

    if ( moveLeft ) velocity.x -= 1500.0 * delta;
    if ( moveRight ) velocity.x += 1500.0 * delta;

    controls.getObject().translateX( velocity.x * delta);
    controls.getObject().translateZ( velocity.z * delta);
    controls.getObject().translateX(-3*x3D);
    controls.getObject().translateY(-3*y3D);
    controls.getObject().translateZ(z3D);
    //}

    pe = new THREE.Vector3(-x3D, -y3D, z3D);
    
    
    if(!menu.anaglyph && !menu.depthOfField){
	renderer.clear();
	renderer.render( scene, camera );
    }

    if(menu.anaglyph){
	// anaglyphRenderer.clear();
	anaglyphRenderer.render(scene, camera, pe);
    }

    if(menu.depthOfField){
	dofRenderer.render(scene, camera);	
    }



    //if(pointerLocked) {
    //renderer.clearDepth();
    //renderer.render( sceneOrtho, cameraOrtho );
    //}

    renderer_video.clear();
    renderer_video.render(scene_video, camera_video);
    
    controls.getObject().translateX(3*x3D);
    controls.getObject().translateY(3*y3D);
    controls.getObject().translateZ(-z3D);
    stats.update();

}
