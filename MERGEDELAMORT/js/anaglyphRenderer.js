function AnaglyphRenderer ( renderer ) {

    // left and right cameras
    this.cameraLeft  = new THREE.Camera();
    this.cameraLeft.matrixAutoUpdate = false;
    this.cameraRight = new THREE.Camera();
    this.cameraRight.matrixAutoUpdate = false;

    this.clear = function(){
	renderer.clear();
    }

    this.makeProjection = function(projectionMatrix, pe){

	pa = new THREE.Vector3(0, displayParameters.height(), 0);
	pb = new THREE.Vector3(displayParameters.width(), displayParameters.height(), 0);
	pc = new THREE.Vector3(0, 0, 0);
	
	vr = pb.clone();
	vr.sub(pa);
	vr.normalize();

	
	vu = pc.clone();
	vu.sub(pa);
	vu.normalize();

	
	vn = vr.clone();
	vn.cross(vu);
	vn.normalize();
	vn.z = -vn.z;

	
	va = pa.clone();
	va.sub(pe);

	vb = pb.clone();
	vb.sub(pe);
	
	vc = pc.clone();
	vc.sub(pe);

	// console.log("----");
	// // console.log("pe : "+pe.x+", "+pe.y+", "+pe.z);	
	// console.log("va : "+va.x+", "+va.y+", "+va.z);
	// console.log("vb : "+vb.x+", "+vb.y+", "+vb.z);
	// console.log("vc : "+vc.x+", "+vc.y+", "+vc.z);

	// console.log("----");
	// console.log("va : "+va.x+", "+va.y+", "+va.z);
	// console.log("vn : "+vn.x+", "+vn.y+", "+vn.z);
	d = va.dot(vn);
	d = -d;

	console.log("d-pe.z : "+(d-pe.z));// equals 0, everything is fine
	
	l = vr.dot(va);
	l*=camera.nea*r;
	l/=d;
	
	r = vr.dot(vb);
	r*=camera.near;
	r/=d;

	b = vu.dot(va);
	b*=camera.near;
	b/=d;
	
	t = vu.dot(vc);
	t*=camera.near;
	t/=d;

	// console.log("l : "+l+", r : "+r+", t : "+t+", b : "+b);
	
	projectionMatrix.makePerspective(l, r, t, b, camera.near, camera.far);
	// projectionMatrix.makePerspective(l, r, b, t, camera.near, camera.far);//Dans le bon sens (?)

	
	
	M = new THREE.Matrix4();

	M.set( vr.x, vr.y, vr.z, 0.,
	       vu.x, vu.y, vu.z, 0.,
	       vn.x, vn.y, vn.z, 0.,
	       0.  , 0.  , 0.  , 1. );

	
	// projectionMatrix.multiply(M);

	T = new THREE.Matrix4();

	T.set( 1., 0., 0., -pe.x,
	       0., 1., 0., -pe.y,
	       0., 0., 1., -pe.z,
	       0., 0., 0., 1. );
	
	projectionMatrix.multiply(T);
	
    }
    
    this.update = function ( camera, pe ) {

	camera.updateMatrixWorld();
	
	var projectionLeft = new THREE.Matrix4();
	var projectionRight = new THREE.Matrix4();
	
	
	this.cameraLeft.matrixWorld.copy(camera.matrixWorld); 
	this.cameraRight.matrixWorld.copy(camera.matrixWorld);
	
	var halfDistance = displayParameters.ipd/2;
	
	//---Code avant la généralisation du calcul de la matrice de projection à n'importe quel position de l'observateur---
	
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

	projectionLeft.makePerspective(leftCameraLeft, rightCameraLeft, top, bottom, znear, zfar);
	projectionRight.makePerspective(leftCameraRight, rightCameraRight, top, bottom, znear, zfar);

	//---fin---

	//---Généralisation (ne fonctionne pas)---
	// peLeft = new THREE.Vector3(pe.x-halfDistance, pe.y, pe.z);
	// peRight = new THREE.Vector3(pe.x+halfDistance, pe.y, pe.z);
	
	// this.makeProjection(projectionLeft, peLeft);
	// this.makeProjection(projectionRight, peRight);
	//---fin---
	
	this.cameraLeft.projectionMatrix = projectionLeft;
	this.cameraRight.projectionMatrix = projectionRight;
    }

    this.render = function ( scene, camera, pe ) {
	this.update(camera, pe);
	// renderer.render(scene, this.cameraRight);

	var gl = renderer.domElement.getContext( 'webgl' );
	
	gl.colorMask(true, false, false, false);
	renderer.render(scene, this.cameraLeft);
	
	renderer.clearDepth();
	
	gl.colorMask(false, true, true, false);
	renderer.render(scene, this.cameraRight);
	gl.colorMask(true, true, true, false);
    }

}
