var dropboxClient = new Dropbox.Client({ key: 'asz5juc1q10mhtg' });
dropboxClient.authenticate(function (error, client) {
  if (error) {
    console.error('Error: ' + error);
  }
});

/**
 * Writes a single file where the filename is the current datetime.
 * @param {string}
 */
function writeTimeStampedFile(data, ext) {
  if (ext === undefined) {
    ext = ".png";
  }
  dateTimeString = (new Date()).toLocaleString();
  dropboxClient.writeFile(dateTimeString + ext, data, function (error) {
    if (error) {
      alert('Error: ' + error);
    } else {
      console.log('File written successfully => ', dateTimeString);
    }
  });
}

/**
* Allows one to convert base64 image data to a blob.
*/
function convertDataURLToBlob(dataURL) {
  var string_base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  var binary_string = window.atob(string_base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      var ascii = binary_string.charCodeAt(i);
      bytes[i] = ascii;
  }
  return bytes.buffer;
}

/**
 * All motion triggering images are appended to the page as a thumbnail.
 */
var snapshotContainer = $("#snapshotContainer");
var snapshotsAdded = 0;
function writeImageThumbnail(data) {
  var current = "";
  if (snapshotsAdded < 32) {
    current = snapshotContainer.html();
    snapshotsAdded++;
  } else {
    snapshotsAdded = 0;
  }
  snapshotContainer.html(current + "<img width='160px' height='120px' src='" + data +  "'></img>");
}

/**
 * Flip the "Record" button from green to red.
 */
var startButton = $("#startButton");
function startButtonToggle() {
  startButton.toggleClass("btn-success");
  startButton.toggleClass("btn-danger");
}

var motionDetector = new Motion.Detector("webcam", "source");

/**
 * Creates a thumbnail and saves images to Dropbox on motion events.
 */
var ext = "image/png";
$(motionDetector).bind("motion", function() {
  var dataURL = motionDetector.canvas.toDataURL(ext, 0.7);
  writeImageThumbnail(dataURL, ".png");
  writeTimeStampedFile(convertDataURLToBlob(dataURL));  
});

/**
 * Start/Stop detection on button clicks.
 */
var detectionRunning = false;
startButton.on("click", function() {
  if (detectionRunning === false) {
    startButtonToggle();
    console.log("Starting Detection....");
    detectionRunning = true;
    motionDetector.init(); 
  } else {
    startButtonToggle();
    console.log("Stopping Detection....");
    detectionRunning = false;
    motionDetector.stop();
  }     
});
