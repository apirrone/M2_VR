function StereoRenderer ( renderer ) {

  // left and right cameras
  this.cameraLeft  = new THREE.Camera();
  this.cameraLeft.matrixAutoUpdate = false;
  this.cameraRight = new THREE.Camera();
  this.cameraRight.matrixAutoUpdate = false;

  // Texture parameters for the offscreen buffer
  var _params = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    depthBuffer: true,
    stencilBuffer: false
   };

  // create offscreen buffer
  this.renderTargetLeft  = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight , _params );
  this.renderTargetRight = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight , _params );

  // Create camera & scene for the 2nd screen-space pass
  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene = new THREE.Scene();
  var quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) );
  this.scene.add( quad );

  var uniforms = {
    "colorMap": { value: this.renderTargetLeft.texture },
    "centerCoordinate": { value: new THREE.Vector2(0.5,0.5) },
    "K": { value: new THREE.Vector2(guiObj.K1, guiObj.K2) }
  };

  // Load GLSL shaders and assign them to the quad as material
  shaderLoader( 'shaders/shaderUnwarp.vert', 'shaders/shaderUnwarp.frag', function (vertex_text, fragment_text) {
      quad.material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: [ vertex_text ].join( "\n" ),
        fragmentShader: [ fragment_text ].join( "\n" )
        }
      );
    }
  );

  this.setK1 = function ( value ) {
    uniforms.K.value.x = value;
  }

  this.setK2 = function ( value ) {
    uniforms.K.value.y = value;
  }

  this.setSize = function ( width, height) {
    if ( this.renderTargetRight ) this.renderTargetRight.dispose();
    if ( this.renderTargetLeft ) this.renderTargetLeft.dispose();
    this.renderTargetLeft  = new THREE.WebGLRenderTarget( width, height , _params );
    this.renderTargetRight = new THREE.WebGLRenderTarget( width, height , _params );
  }

  this.update = function ( camera ) {

    camera.updateMatrixWorld();

    let ddeye = displayParameters.distanceScreenViewer()+displayParameters.eyeRelief;
    let w1 = displayParameters.lensMagnification()*(displayParameters.ipd/2);
    let w2 = displayParameters.lensMagnification()*((displayParameters.screenSize().x-displayParameters.ipd)/2)
    let near = camera.near;
    let far = camera.far;
    let leftL = -near*(w2/ddeye);
    let rightL = near*(w1/ddeye);
    let leftR = near*(w2/ddeye);
    let rightR = -near*(w1/ddeye);
    let top = near*(displayParameters.screenSize().y/(2*ddeye));
    let bottom = -near*(displayParameters.screenSize().y/(2*ddeye));
console.log("--------------");
    console.log(top);
console.log("--------------");

    MatrixL = new THREE.Matrix4().makePerspective(leftL,rightL,top,bottom,near,far)
    //MatrixL.lookAt(camera.position,THREE.Vector3(0,0,0),THREE.Vector3(0,-1,0));

    MatrixR = new THREE.Matrix4().makePerspective(leftR,rightR,top,bottom,near,far)
    //MatrixR.lookAt(camera.position,THREE.Vector3(0,0,0),THREE.Vector3(0,-1,0));

    this.cameraLeft = camera;
    this.cameraRight = camera;

    this.cameraLeft.projectionMatrix = MatrixL;
    this.cameraRight.projectionMatrix = MatrixR;
  }

  this.render = function ( scene, camera ) {

    scene.updateMatrixWorld();

    camera.updateMatrixWorld();

    this.update( camera );

    // Left eye
    renderer.clearTarget( this.renderTargetLeft, true, true, false);
    renderer.setViewport(0,0,displayParameters.screenSize().x/2, displayParameters.screenSize().y);
    renderer.render( scene, this.cameraLeft, this.renderTargetLeft);

    uniforms.colorMap.value = this.renderTargetLeft.texture;
    uniforms.centerCoordinate.value.x = 0.5; // TODO
    renderer.render( this.scene, this.camera );

    // Right eye
    renderer.clearTarget( this.renderTargetRight, true, true, false);
    renderer.setViewport(displayParameters.screenSize().x/2,0,displayParameters.screenSize().x/2, displayParameters.screenSize().y);
    renderer.render( scene, this.cameraRight, this.renderTargetRight);

    uniforms.colorMap.value = this.renderTargetRight.texture;
    uniforms.centerCoordinate.value.x = 0.5; // TODO
    renderer.render( this.scene, this.camera );
  }


  // Delete offscreen buffer on dispose
  this.dispose = function() {
        if ( this.renderTargetRight ) this.renderTargetRight.dispose();
        if ( this.renderTargetLeft ) this.renderTargetLeft.dispose();
    };

}
