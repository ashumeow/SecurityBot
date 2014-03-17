/* HERE BE SPAGHETTI CODE.  TODO: Refactor this mofo once everything is minimally functional. */

var client = new Dropbox.Client({ key: 'asz5juc1q10mhtg' });
client.authenticate(function (error, client) {
  if (error) {
    console.error('Error: ' + error);
  }
});

/**
 * Writes a single file where the filename is the current datetime.
 * @param {string}
 */
function writeTimeStampedFile(data) {
  dateTimeString = (new Date()).toLocaleString();
  client.writeFile(dateTimeString, data, function (error) {
    if (error) {
      alert('Error: ' + error);
    } else {
      console.log('File written successfully => ', dateTimeString);
    }
  });
}

var snapshotContainer = $("#snapshotContainer");
var snapshotsAdded = 0;
function writeImageThumbnail(data) {
  var current = "";
  if (snapshotsAdded < 15) {
    current = snapshotContainer.html();
    snapshotsAdded++;
  } else {
    snapshotsAdded = 0;
  }
  snapshotContainer.html(current + "<img width='160px' height='120px' src='" + data +  "'></img>");
}

var startButton = $("#startButton");
function startButtonToggle() {
    startButton.toggleClass("btn-success");
    startButton.toggleClass("btn-danger");
}

var webcam = undefined;
var detectionRunning = false;
var motionDetectionLoop = undefined;

startButton.on("click", function() {
  if (detectionRunning === false) {
    startButtonToggle();
    console.log("Starting Detection....");
    detectionRunning = true;
    // Set up actual motion detection
    if (webcam === undefined) {
      webcam = new Motion.Webcam("webcam");
      webcam.init();
      motionDetector = new Motion.Detector(webcam, "source");
    } 
    motionDetectionLoop = setInterval(function() {
        var difference = motionDetector.getDifference(500);
        var detected = motionDetector.detectMotion(difference);
        console.log(detected);
        if (detected) {
          console.log("Detected Motion.");
        } else {
          writeImageThumbnail(motionDetector.canvas.toDataURL());
        }
      }, 1000
    );
  } else {
    startButtonToggle();
    console.log("Stopping Detection....");
    detectionRunning = false;
    clearInterval(motionDetectionLoop);
  }     
});
