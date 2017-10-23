function AnaglyphRenderer ( renderer ) {

    // left and right cameras
    this.cameraLeft  = new THREE.Camera();
    this.cameraLeft.matrixAutoUpdate = false;
    this.cameraRight = new THREE.Camera();
    this.cameraRight.matrixAutoUpdate = false;

    this.clear = function(){
	renderer.clear();
    }
    
    this.update = function ( camera ) {

	camera.updateMatrixWorld();
	
	this.cameraLeft.matrixWorld.copy(camera.matrixWorld); 
	this.cameraRight.matrixWorld.copy(camera.matrixWorld);
	
	var halfDistance = displayParameters.ipd/2;
	
	translationMatrix = new THREE.Matrix4();
	this.cameraLeft.matrixWorld.multiply(translationMatrix.makeTranslation(-halfDistance, 0, 0));
	this.cameraRight.matrixWorld.multiply(translationMatrix.makeTranslation(halfDistance, 0, 0));
	
	var ipd = displayParameters.ipd;
	
	var w = displayParameters.screenSize().x;
	var h = displayParameters.screenSize().y;
	var dScreenViewer = displayParameters.distanceScreenViewer;
	
	var znear = camera.near;
	var zfar = camera.far;
	var top = znear*(h/(2*dScreenViewer));
	var bottom = -znear*(h/(2*dScreenViewer));
	
	var rightCameraLeft  = znear*(((w+ipd)*1.)/(2*dScreenViewer));
	var leftCameraLeft  = -znear*(((w-ipd)*1.)/(2*dScreenViewer));

	var rightCameraRight = znear*(((w-ipd)*1.)/(2*dScreenViewer));
	var leftCameraRight = -znear*(((w+ipd)*1.)/(2*dScreenViewer));

	var projectionLeft = new THREE.Matrix4();
	var projectionRight = new THREE.Matrix4();

	projectionLeft.makePerspective(leftCameraLeft, rightCameraLeft, top, bottom, znear, zfar);
	projectionRight.makePerspective(leftCameraRight, rightCameraRight, top, bottom, znear, zfar); 

	this.cameraLeft.projectionMatrix = projectionLeft;
	this.cameraRight.projectionMatrix = projectionRight;
	
    }

    this.render = function ( scene, camera ) {
	this.update(camera);
	// renderer.render(scene, this.cameraRight);

	var gl = renderer.domElement.getContext( 'webgl' );
	
	gl.colorMask(true, false, false, false);
	renderer.render(scene, this.cameraLeft);
	
	renderer.clearDepth();
	
	gl.colorMask(false, true, true, false);
	renderer.render(scene, this.cameraRight);
    }

}
