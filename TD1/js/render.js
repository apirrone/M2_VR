var container, stats, controls;

var zPressed = false;
var qPressed = false;
var sPressed = false;
var dPressed = false;

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // stats

    stats = new Stats();
    container.appendChild( stats.dom );

    //scene
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


    controls = new THREE.PointerLockControls( camera, renderer.domElement );

    controls.enabled = true;
    scene.add( controls.getObject() );
    // controls = new THREE.TrackballControls( camera, renderer.domElement );    

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    textureLoader = new THREE.TextureLoader();
    
    tex_tnt1 = textureLoader.load("textures/tnt1.png");
    tex_sadbatst = textureLoader.load("textures/sadbatst.png");
    tex_tnt2 = textureLoader.load("textures/tnt2.png");

    material_tnt1 = new THREE.MeshBasicMaterial({map:tex_tnt1});
    material_tnt2 = new THREE.MeshBasicMaterial({map:tex_tnt2});
    material_sadbatst = new THREE.MeshBasicMaterial({map:tex_sadbatst});
    
    texture_material_tnt = [material_tnt1, material_tnt1, material_tnt2, material_tnt2, material_tnt1, material_tnt1];
    
    // cube = new THREE.Mesh( geometry, material );
    tntCube = new THREE.Mesh( geometry, texture_material_tnt );
    scene.add( tntCube );

    tex_stoneBrick = textureLoader.load("textures/stonebrick.png");
    tex_stoneBrickMossy = textureLoader.load("textures/stonebrick_mossy.png");
    tex_sand = textureLoader.load("textures/sand.png");

    material_stoneBrick = new THREE.MeshBasicMaterial({map:tex_stoneBrick});
    material_stoneBrickMossy = new THREE.MeshBasicMaterial({map:tex_stoneBrickMossy});
    material_sand = new THREE.MeshBasicMaterial({map:tex_sand});
    
    texture_material_stoneBrick = [material_stoneBrick, material_stoneBrick, material_stoneBrick, material_stoneBrick, material_stoneBrick, material_stoneBrick]; 
    texture_material_stoneBrickMossy = [material_stoneBrickMossy, material_stoneBrickMossy, material_stoneBrickMossy, material_stoneBrickMossy, material_stoneBrickMossy, material_stoneBrickMossy];
    texture_material_sand = [material_sand, material_sand, material_sand, material_sand, material_sand, material_sand]; 

    for(var i = -7 ; i < 8 ; i++){
	for(var j = -7 ; j < 8 ; j++){
	    if(i != 0 || j != 0){
		random = Math.floor(Math.random() * 2) + 1;
		if(random == 1){
		    stoneBrick = new THREE.Mesh( geometry, texture_material_stoneBrick );		
		    stoneBrick.position.y = -1;		
		    stoneBrick.position.x = i;
		    stoneBrick.position.z = j;
		    scene.add( stoneBrick );
		}
		else{
		    stoneBrickMossy = new THREE.Mesh( geometry, texture_material_stoneBrickMossy );
		    stoneBrickMossy.position.y = -1;		
		    stoneBrickMossy.position.x = i;
		    stoneBrickMossy.position.z = j;
		    scene.add( stoneBrickMossy );
		}
		
	    }
	    sand = new THREE.Mesh( geometry, texture_material_sand );		
	    sand.position.y = -2;		
	    sand.position.x = i;
	    sand.position.z = j;
	    scene.add( sand );
	    
	}
    }
    
    

    camera.position.z = 5;

    cameraCrosshair = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

    sceneCrosshair = new THREE.Scene();
    sceneCrosshair.add( cameraCrosshair );
    
    material = new THREE.LineBasicMaterial({ color: 0xffffff });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-10, 0, -1));
    geometry.vertices.push(new THREE.Vector3(10, 0, -1));

    var geometry2 = new THREE.Geometry();
    geometry2.vertices.push(new THREE.Vector3(0, -10, -1));
    geometry2.vertices.push(new THREE.Vector3(0, 10, -1));
    // geometry.vertices.push(new THREE.Vector3(10, 0, -1));

    var line = new THREE.Line(geometry, material);
    var line2 = new THREE.Line(geometry2, material);

    sceneCrosshair.add(line); 
    sceneCrosshair.add(line2); 

    document.body.appendChild( renderer.domElement );    

    clock = new THREE.Clock();


    document.addEventListener("keypress", function(e){
	code = String.fromCharCode(e.which).toLowerCase();

	if(code == 'z')//z
	    zPressed = true;
	
	if(code == 'q')//q
	    qPressed = true;
	
	if(code == 's')//s
	    sPressed = true;
	
	if(code == 'd')//d
	    dPressed = true;
	
    });

    document.addEventListener("keyup", function(e){
	code = String.fromCharCode(e.which).toLowerCase();
	if(code == 'z')//z
	    zPressed = false;

	if(code == 'q')//q
	    qPressed = false;

	if(code == 's')//s
	    sPressed = false;

	if(code == 'd')//d
	    dPressed = false;

    });

}


function animate() {

    stats.update();


    if(zPressed)
	controls.getObject().translateZ(-0.1);
    if(sPressed) 
	controls.getObject().translateZ(0.1);
    if(qPressed)
	controls.getObject().translateX(-0.1);
    if(dPressed)
	controls.getObject().translateX(0.1);

    
    requestAnimationFrame( animate );
    
    // cube.rotation.x += 0.1;
    // cube.rotation.y += 0.1;
    renderer.clear();
    renderer.render( scene, camera );
    renderer.clearDepth();
    renderer.render( sceneCrosshair, cameraCrosshair );    
}
