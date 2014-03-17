/**
*  JavaScript / HTML5 Motion Detection.  
*  Refactored from: http://www.adobe.com/devnet/html5/articles/javascript-motion-detection.html
*  Morgan (Reece) Phillips - winter2718@gmail.com - mrrrgn.com - @linuxpoetry
*/

var Motion = Object(); // A namespace appears

/**
 *  Example Usage: 
 *    HTML => <video id="webcam" autoplay width="640" height="480"></video>
 *    JS => (new Motion.Webcam("webcam")).init();
 *  @param {string}: videoTagId, the id of an html5 <video> element.
 */
Motion.Webcam = function (videoTagId) {
  var self = this;
  
  self.video = $("#" + videoTagId)[0];

  self.webcamError = function(e) {
      console.error('Webcam error!', e);
  };

  self.init = function() {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: false, video: true}, function(stream) {
        self.video.src = stream
      }, self.webcamError);
    } else if (navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia({audio:false, video:true}, function(stream) {
        self.video.src = window.webkitURL.createObjectURL(stream);
      }, self.webcamError);
    }
  };
};

/**
 *  @param {object}: webcam, an initialized Motion.Webcam object.
 *  @param {string}: canvasTagId, the id of an html5 canvas.
 */
Motion.Detector = function (webcam, canvasTagId) {
  var self = this;
  
  self.videoSource = webcam.video;
  self.canvas = $("#" + canvasTagId)[0];
  self.width = self.canvas.width;
  self.height = self.canvas.height;
  self.canvasContext = self.canvas.getContext("2d");

  /**
   *  Copy a single image frame into the canvas from our video source.
   */
  self.draw = function() {
    self.canvasContext.drawImage(self.videoSource, 0, 0, self.videoSource.width, self.videoSource.height);
  };

  /**
   *  Generate a diff of two image dumps.
   *  @param {integer}: delta, the number of ms to wait between image data snapshots.
   */
  self.getDifference = function(delta) {
    
    var delta = delta;
    if (delta === undefined) {
      delta = 100;
    }

    function threshold(value) {
      return (value > 0x15) ? 0xFF : 0;
    };

    result = self.canvasContext.createImageData(self.width, self.height);
    
    self.draw();
    imageOne = self.canvasContext.getImageData(0, 0, self.width, self.height);
    
    // To put some distance between snapshot one and snapshot two 
    setTimeout(function() {
      self.draw();
      imageTwo = self.canvasContext.getImageData(0, 0, self.width, self.height);
      
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
    }, delta);
    return result;
  };

  /**
  * Returns true if motion beyond the supplied threshold is detected.
  * @param {object}: blendedImageData, the difference of two image data snapshots
  * @param {integer}: threshold, a value describing how much white pixel intensity will trigger detection.
  */
  self.detectMotion = function(blendedImageData, threshold) {
    var threshold = threshold;
    if (threshold === undefined) {
      threshold = 10;
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
