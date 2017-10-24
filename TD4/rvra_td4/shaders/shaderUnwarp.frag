uniform sampler2D colorMap;

// center of lens for un-distortion (in normalized coordinates between 0 and 1)
uniform vec2 centerCoordinate;

// lens distortion parameters
uniform vec2 K; 

// texture coordinates
varying vec2 vUv;

void main() {
	// TODO

	gl_FragColor = texture2D(colorMap, vUv);
}
