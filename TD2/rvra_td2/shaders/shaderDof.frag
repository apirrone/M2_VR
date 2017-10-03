uniform mat4 projectionMatrix2;
uniform mat4 inverseProjectionMatrix;

uniform float focusDistance;
uniform float pupilDiameter;
uniform float pixelPitch;

uniform vec2 gazePos;

uniform sampler2D colorMap;
uniform sampler2D depthMap;
uniform vec2 textureSize;

varying vec2 vUv;

// TODO: distance to camera computation
float distToFrag( float z_buffer ) {
  // float xndc = 2.*gl_FragCoord.x-1.;
  // float yndc = 2.*gl_FragCoord.y-1.; 
  float zndc = 2.*z_buffer-1.;
  // vec4 vndc = vec4(xndc, yndc, zndc, 1.);// normalized device coordinates

  float zview = projectionMatrix2[3][2]*(1./(zndc+projectionMatrix2[2][2]));
    
  return zview;
}

// TODO: circle of confusion computation
float computeCoC( float fragDist, float focusDist ) {
  float M = 17.0 / (focusDist - 17.0);
  float b = M*pupilDiameter*abs(focusDist - fragDist)/fragDist;
  // float b = (M*abs(fragDist - focusDist)*pupilDiameter)/fragDist;
  float coc = b/pixelPitch;//Convert in pixels;
  return coc;
}

// TODO: adaptive blur computation
vec4 computeBlur( float radius ) {

  const float max_its = 10.;
  
  int radiusInt = int(radius); 

  vec4 ret = vec4(0., 0., 0., 1.);
  
  int iter = 0;
  
  int tempI = 0;
  int tempJ = 0;

  float iFloat = 0.;
  float jFloat = 0.;

  vec2 currentCoords = vec2(0., 0.);

  for(float i = -max_its ; i < max_its ; i++){
    for(float j = -max_its ; j < max_its ; j++){
      
      if(i*i+j*j <= radius*radius){

	float coordTexI = (vUv[0] + i/textureSize[0]);
	float coordTexJ = (vUv[1] + j/textureSize[1]);

	currentCoords = vec2(coordTexI, coordTexJ);
	ret += texture2D(colorMap, currentCoords);
	
	iter++;
      } 
    }
  }

  ret /= float(iter);


  
  // for(int i = 0 ; i < max_its ; i++){
  //   tempI = i - radiusInt;
  //   for(int j = 0 ; j < max_its ; j++){
  //     tempJ = j - radiusInt;

  //     // if(tempI >= radiusInt)
  //     // 	break;
  //     // if(tempJ >= radiusInt)
  //     // 	break;
	      
  //     if(tempI*tempI + tempJ*tempJ <= radiusInt*radiusInt){

  // 	iFloat = float(tempI);
  // 	jFloat = float(tempJ);

  // 	float coordTexI = (vUv[0] + iFloat/textureSize[0]);
  // 	float coordTexJ = (vUv[1] + jFloat/textureSize[1]);

  // 	if(coordTexI < 0.)
  // 	  coordTexI = 0.;
  // 	if(coordTexJ < 0.)
  // 	  coordTexJ = 0.;

  // 	// if(coordTexI >= textureSize[0])
  // 	//   coordTexI = textureSize[0]-1./textureSize[0];
	  
  // 	// if(coordTexJ >= textureSize[1])
  // 	//   coordTexJ = textureSize[1]-1./textureSize[1];	    
	  
  // 	currentCoords = vec2(coordTexI, coordTexJ);
      
  // 	// vec3 t = texture2D(colorMap, currentCoords).xyz;
  // 	// gl_FragColor.rgb.x += t.x;
  // 	// gl_FragColor.rgb.y += t.y;
  // 	// gl_FragColor.rgb.z += t.z;
	
  // 	ret.x += texture2D(colorMap, currentCoords).x;
  // 	ret.y += texture2D(colorMap, currentCoords).y;
  // 	ret.z += texture2D(colorMap, currentCoords).z;
  // 	// ret.xyz += texture2D(colorMap, currentCoords).xyz;//Element wise ?
  // 	iter++;
  //     } 
      
  //   } 
  // }

  // // if(tempI >= radiusInt && tempJ >= radiusInt){
  
  // ret.x /= float(iter);
  // ret.y /= float(iter);
  // ret.z /= float(iter);
  // ret[3] = 1.;
  
  return ret;	
    // }

  
}

void main() {
  
  float z_buffer = texture2D(depthMap, vUv).x;
  // gl_FragColor = vec4(texture2D(depthMap, vUv).xyz, 1.);
  float fragDist = distToFrag(z_buffer);
  float radius = computeCoC(fragDist, focusDistance);
  // gl_FragColor = vec4(radius/10., radius/10., radius/10., 1.);
  gl_FragColor = computeBlur(radius*10.);
  
  // gl_FragColor = vec4(1., 0., 0., 0.);
  // vec2 test = vec2(vUv[0]+50./textureSize[0], vUv[1]+50./textureSize[1]);
  // gl_FragColor = texture2D( colorMap, vUv );
}
