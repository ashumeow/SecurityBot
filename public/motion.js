/**
*  JavaScript / HTML5 Motion Detection.  
*  Morgan (Reece) Phillips - winter2718@gmail.com - mrrrgn.com - @linuxpoetry
*  Borrows snippets from: http://www.adobe.com/devnet/html5/articles/javascript-motion-detection.html
*/

var Motion = Object(); // A namespace appears

/**
 *  @param {string}: videoTagId, the id of an html5 video tag.
 *  @param {string}: canvasTagId, the id of an html5 canvas.
 */
Motion.Detector = function (videoTagId, canvasTagId) {
  var self = this;
  
  self.videoSource = $("#" + videoTagId)[0];
  self.webcamInitialized = false;
  self.canvas = $("#" + canvasTagId)[0];
  self.width = self.canvas.width;
  self.height = self.canvas.height;
  self.canvasContext = self.canvas.getContext("2d");
  self.currentImageData = undefined;
  self.previousImageData = undefined;
  self.motionImageData = undefined;
  self.beginDrawing = undefined; // A timeout function.
  
  self.webcamError = function(e) {
    console.error('Webcam error!', e);
  };

  self.webcamInit = function() {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: false, video: true}, function(stream) {
        self.webcamInitialized = true;
        self.videoSource.src = stream
      }, self.webcamError);
    } else if (navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia({audio:false, video:true}, function(stream) {
        self.webcamInitialized = true;
        self.videoSource.src = window.webkitURL.createObjectURL(stream);
      }, self.webcamError);
    }
  };

  self.init = function(refreshRate) {
    if (self.webcamInitialized === false) {
      self.webcamInit();
    }
    if (refreshRate === undefined) {
      refreshRate = 500;
    }
    self.beginDrawing = setInterval(function() {
      self.draw();
      self.getDifference();
      if (self.detectMotion(self.motionImageData) === true) {
        console.log("Motion Detected.");
        $(self).trigger("motion");
      }
    }, refreshRate);

  };

  self.stop = function() {
    clearInterval(self.beginDrawing);
  };

  /**
   *  Copy a single image frame into the canvas from our video source.
   */
  self.draw = function() {
    if (self.previousImageData !== undefined) {
      self.previousImageData = self.canvasContext.getImageData(0, 0, self.width, self.height)
    }
    self.canvasContext.drawImage(self.videoSource, 0, 0, self.videoSource.width, self.videoSource.height);
    self.currentImageData = self.canvasContext.getImageData(0, 0, self.width, self.height);
    if (self.previousImageData === undefined) {
      self.previousImageData = self.currentImageData;
    }
  };

  /**
   *  Generate a diff of self.currentImageData and self.prevousImageData.
   *  Stores the result in self.motionImageData
   */
  self.getDifference = function() {
   
    function threshold(value) {
      return (value > 0x15) ? 0xFF : 0;
    };

    var imageOne = self.currentImageData;
    var imageTwo = self.previousImageData;

    result = self.canvasContext.createImageData(self.width, self.height);
    
    if (imageOne.data.length != imageTwo.data.length) return null;
    
    var i = 0;
    while (i < (imageOne.data.length * 0.25)) {
      var average1 = (imageOne.data[4*i] + imageOne.data[4*i+1] + imageOne.data[4*i+2]) / 3;
      var average2 = (imageTwo.data[4*i] + imageTwo.data[4*i+1] + imageTwo.data[4*i+2]) / 3;
      var diff = threshold(Math.abs(average1 - average2));
      result.data[4*i] = diff;
      result.data[4*i+1] = diff;
      result.data[4*i+2] = diff;
      result.data[4*i+3] = 0xFF;
      ++i;
    }
    self.motionImageData = result;
  };

  /**
  * Returns true if motion beyond the supplied threshold is detected.
  * @param {object}: blendedImageData, the difference of two image data snapshots
  * @param {integer}: threshold, a value describing how much white pixel intensity will trigger detection.
  */
  self.detectMotion = function(blendedImageData, threshold) {
    var threshold = threshold;
    if (threshold === undefined) {
      threshold = 15;
    }
    var i = 0;
    var average = 0;
    // loop over the pixels
    while (i < (blendedImageData.data.length / 4)) {
      // make an average between the color channel
      average += (blendedImageData.data[i*4] + blendedImageData.data[i*4+1] + blendedImageData.data[i*4+2]) / 3;
      ++i;
    }
    // calculate an average between of the color values of the note area
    average = Math.round(average / (blendedImageData.data.length / 4));
    if (average > threshold) {
      return true;
    }
    return false;
  };

};
