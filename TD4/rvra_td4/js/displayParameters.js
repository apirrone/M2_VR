var displayParameters = {

  // parameters for stereo rendering
  // physical screen diagonal -- in mm
  screenDiagonal: 129.54,
  screenResolutionWidth: 2560,
  aspectRatio: 1.7,

  // inter pupillar distance -- in mm
  ipd: 64,

  // lense focal length
  lensesFocalLength: 45.0,

  // distance between lense and screen -- in mm
  distanceScreenLenses: 42.0,

  // eye relief -- in mm
  eyeRelief: 10.0,

  // Amount of distance in mm between adjacent pixels
  pixelPitch: function() {
    var screenResolutionHeight = this.screenResolutionWidth / this.aspectRatio;
    var d = Math.sqrt(screenResolutionHeight * screenResolutionHeight + this.screenResolutionWidth * this.screenResolutionWidth);
    return this.screenDiagonal / d;
  },

  // physical display width and height -- in mm
  screenSize: function() {
    var screenResolutionHeight = this.screenResolutionWidth / this.aspectRatio;
    return new THREE.Vector2(this.screenResolutionWidth * this.pixelPitch(), screenResolutionHeight * this.pixelPitch());
  },

  // distance between viewer (=lenses, i.e. no eye relief) and virtual image of screen
  distanceScreenViewer: function() {
    return this.distanceScreenLenses;
  },

  // lens magnification
  lensMagnification: function() {
    return 25/(25-this.distanceScreenLenses);
  }

};
