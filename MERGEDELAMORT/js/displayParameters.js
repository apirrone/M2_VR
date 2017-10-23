var displayParameters = {

    // parameters for stereo rendering
    // physical screen diagonal -- in mm
    screenDiagonal: 337.82,
    screenResolutionWidth: 3200,
    aspectRatio: 1.77,

    // inter pupillar distance -- in mm
    ipd: 64,

    // distance bewteen the viewer and the screen -- in mm
    distanceScreenViewer: 500,

    // TODO: amount of distance in mm between adjacent pixels
    pixelPitch: function() {
	// var h = Math.sqrt(Math.pow(this.screenDiagonal, 2)/(Math.pow(this.aspectRatio, 2)+1));
	// var w = this.aspectRatio*h;
	// return w / this.screenResolutionWidth;

	var h = this.screenResolutionWidth*this.aspectRatio;
	var diagResolution = Math.sqrt(h*h+this.screenResolutionWidth*this.screenResolutionWidth);

	return this.screenDiagonal/diagResolution;
	
    },

    //TODO: physical display width and height -- in mm
    screenSize: function() {
	var h = Math.sqrt(Math.pow(this.screenDiagonal, 2)/(Math.pow(this.aspectRatio, 2)+1));
	var w = this.aspectRatio*h;	
	return new THREE.Vector2(w,h);
    }
    
};
