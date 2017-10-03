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

float distToFrag( float z_buffer ) {
  float zndc = 2.*z_buffer-1.;

  float zview = projectionMatrix2[3][2]*(1./(zndc+projectionMatrix2[2][2]));

  return zview;
}

float computeCoC( float fragDist, float focusDist ) {
  float M = 17.0 / (focusDist - 17.0);
  float b = M*pupilDiameter*abs(focusDist - fragDist)/fragDist;
  float coc = b/pixelPitch;//Convert in pixels;
  return coc;
}

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

  return ret;

}

void main() {

  float z_buffer = texture2D(depthMap, vUv).x;
  float fragDist = distToFrag(z_buffer);
  float radius = computeCoC(fragDist, distToFrag(texture2D(depthMap, vec2(0.5,0.5)).x));
  gl_FragColor = computeBlur(radius*10.);

}
