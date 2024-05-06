import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@latest";

const demosSection = document.getElementById("demos");

let poseLandmarker = undefined;
let runningMode = "VIDEO";
let enableWebcamButton;
let webcamRunning = false;
let streamReference;
const videoHeight = "360px";
const videoWidth = "480px";

//fps
// let fpsDisplay = document.createElement("div");
// document.body.appendChild(fpsDisplay);
// fpsDisplay.style.position = "absolute";
// fpsDisplay.style.top = "150px";
// fpsDisplay.style.left = "20px";
// fpsDisplay.style.color = "red";
// fpsDisplay.style.padding = "5px";
// fpsDisplay.style.zIndex = "100";
// fpsDisplay.innerText = "FPS: ";

let frameCount = 0;
let prevTime = performance.now();
let playerName = "";
let ranking = [];

let startFlag = false;
let endGame = false;
let endTimer = null;
let modelDBName = "pullups";

let model;

const upSound = new Audio("./sounds/up.mp3");
const beepSound = new Audio("./sounds/beep.mp3");
const countdownSound = new Audio("./sounds/arcadecountdown.mp3");
const winSound = new Audio("./sounds/tada-fanfare.mp3");

const exerciseDisplay = document.getElementById("exerciseText");
exerciseDisplay.textContent = "Exercise: Pull-Ups";

model = await tf.loadLayersModel("./custommodels/pullups.json");

getLeaderboard(modelDBName);

document
  .getElementById("modelSelector")
  .addEventListener("change", async function (event) {
    const modelName = event.target.value;
    let modelPath;
    let exerciseText = "Exercise";

    switch (modelName) {
      case "squats":
        modelPath = "./custommodels/squats.json";
        exerciseDisplay.textContent = "Exercise: Squats";
        modelDBName = "squats";
        getLeaderboard("squats");
        exerciseText = "Squat";
        break;
      case "pullups":
        modelPath = "./custommodels/pullups.json";
        exerciseDisplay.textContent = "Exercise: Pull-Ups";
        modelDBName = "pullups";
        getLeaderboard("pullups");
        exerciseText = "Pull up";
        break;
      case "situps":
        modelPath = "./custommodels/situps.json";
        exerciseDisplay.textContent = "Exercise: Sit-Ups";
        modelDBName = "situps";
        getLeaderboard("situps");
        exerciseText = "Sit up";
        break;
      case "pushups":
        modelPath = "./custommodels/pushups.json";
        exerciseDisplay.textContent = "Exercise: Push-Ups";
        modelDBName = "pushups";
        getLeaderboard("pushups");
        exerciseText = "Push up";
        break;
      case "jumpingjacks":
        modelPath = "./custommodels/jumpingjacks.json";
        exerciseDisplay.textContent = "Exercise: Jumping Jacks";
        modelDBName = "jumping_jacks";
        getLeaderboard("jumping_jacks");
        exerciseText = "Jumping Jack";
        break;
      default:
        console.error("Unknown model: ", modelName);
        return;
    }

    // Update the display text and the model
    exerciseDisplay.textContent = `Exercise: ${exerciseText}`;
    document.getElementById(
      "labelStart"
    ).textContent = `${exerciseText} - Start`;
    document.getElementById("labelMid").textContent = `${exerciseText} - Mid`;
    document.getElementById("labelEnd").textContent = `${exerciseText} - End`;

    document.querySelector(
      ".LeaderboardText"
    ).textContent = `${exerciseText} Leaderboard`;

    // Load the model if applicable and update the leaderboard
    try {
      model = await tf.loadLayersModel(modelPath);
    } catch (error) {
      console.error("Error loading the model:", error);
    }
  });

// Function to update playerName based on input
function updatePlayerName() {
  const inputElement = document.getElementById("playerName");

  const playerDisplay = document.getElementById("playerDisplay");

  inputElement.addEventListener("keydown", function (event) {
    // Check if the key pressed is Enter
    if (event.key === "Enter") {
      playerName = event.target.value;
      event.preventDefault();
      document.getElementById("playerNameDisplay").textContent = playerName;
      inputElement.value = "";
      event.preventDefault();
    }
  });
}
updatePlayerName();

// initialize pose landmarker
const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `./mediapipemodels/pose_landmarker_full.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numPoses: 1,
  });
  demosSection.classList.remove("invisible");
};
createPoseLandmarker();

// **** Continuously grab image from webcam stream and detect it.
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

// Check if webcam access is supported
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

document.getElementById("startButton").addEventListener("click", function () {
  $("#endChallengeModal").modal("hide");
  let countdownValue = 3;
  const countdownOverlay = document.getElementById("countdownOverlay");
  const countdownText = document.getElementById("countdownText");

  document.getElementById("repsCounter").classList.remove("hidden");
  document.querySelector(".centered-div").classList.remove("hidden");

  // Make the overlay visible
  countdownOverlay.style.display = "flex";

  // Disable the start button
  this.disabled = true;

  const countdownInterval = setInterval(function () {
    if (countdownValue == 3) {
      playSound(countdownSound, 0.5);
    }
    countdownText.textContent = countdownValue > 0 ? countdownValue : "GO!";
    if (countdownValue == 0) {
      startFlag = true;
    }
    if (countdownValue < 0) {
      // Hide the overlay and reset the countdown text
      countdownOverlay.style.display = "none";
      countdownText.textContent = "";
      clearInterval(countdownInterval);
      // Re-enable the start button
      document.getElementById("startButton").disabled = false;
    }
    countdownValue--;
  }, 1000);
});

function setupEventListeners() {
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.addEventListener("click", startChallenge);
  } else {
    console.error("Start button not found!");
  }

  // if you want to add more event listeners
}
setupEventListeners();

function startChallenge() {
  updateCounter();
}

function resetEndTimer() {
  if (endTimer !== null) {
    clearTimeout(endTimer);
  }
  endTimer = setTimeout(endChallenge, 3000); // how long time after each part of the exercise should you allow before the challenge ends? 3 seconds right now
}

function triggerConfetti() {
  confetti({
    zIndex: 1000,
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

function endChallenge() {
  console.log("Challenge ended due to inactivity.");
  endGame = true;
  startFlag = false;

  // Update the leaderboard with the playerName and the number of reps
  recordExercise(playerName, reps, modelDBName);

  // Display the final reps in the popup
  document.getElementById("finalRepsCount").textContent = reps;
  document.getElementById("username").textContent = playerName;

  // Show the popup
  $("#endChallengeModal").modal("show");
  setTimeout(triggerConfetti, 100);
  playSound(winSound, 0.3);

  reps = 0;
  updateCounter();
}

function updateBar(prediction) {
  const increaseSpeed = "0.2s"; // Speed for the bar to go up lower value faster for both
  const decreaseSpeed = "0.3s"; // Speed for the bar to go down

  const progressBarElements = {
    up: document.getElementById("progressBar3"),
    middle: document.getElementById("progressBar2"),
    down: document.getElementById("progressBar1"),
  };

  prediction.forEach((stage) => {
    const element = progressBarElements[stage.name];
    const newWidth = stage.probability * 100 + "%";

    if (parseFloat(element.style.width) < stage.probability * 100) {
      element.style.transition = `width ${increaseSpeed} ease-out`;
    } else {
      element.style.transition = `width ${decreaseSpeed} ease-out`;
    }

    element.style.width = newWidth;
  });
}

function playSound(audioElement, volume = 1.0) {
  if (!audioElement.paused) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  audioElement.volume = volume;
  audioElement.play();
}

// To record an exercise count
function recordExercise(name, count, exerciseType) {
  fetch("http://localhost:3000/record-exercise", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, count, exerciseType }),
  })
    .then((response) => response.json())
    .then((data) => {
      getLeaderboard(exerciseType); // Fetch and update the leaderboard immediately after recording
    })
    .catch((error) => console.error("Error:", error));
}

// To get the leaderboard
function getLeaderboard(exerciseType) {
  fetch(`http://localhost:3000/leaderboard/${exerciseType}`)
    .then((response) => response.json())
    .then((data) => {
      updateLeaderboardUI(data);
    })
    .catch((error) => console.error("Error:", error));
}

function updateLeaderboardUI(data) {
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = ""; // Clear the current leaderboard

  // Loop through each item in the data and create list items
  data.forEach((item, index) => {
    let listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${item.name}: ${item.count} reps`;
    leaderboardList.appendChild(listItem);
  });
}

// function updatePlayerName(name) {
//     name = name.trim();
//     playerName = name.charAt(0).toUpperCase() + name.slice(1);
// }

function enableCam(event) {
  webcamRunning = !webcamRunning;
  enableWebcamButton.innerText = webcamRunning
    ? "DISABLE WEBCAM"
    : "ENABLE WEBCAM";
  const startButton = document.getElementById("startButton");

  if (webcamRunning) {
    // If enabling the webcam
    if (!poseLandmarker) {
      console.log("Wait! poseLandmarker not loaded yet.");
      webcamRunning = false;
      enableWebcamButton.innerText = "ENABLE WEBCAM";
      startButton.style.display = "none"; // Ensure the start button is hidden if webcam isn't ready
      return;
    }

    // getUsermedia parameters
    const constraints = {
      video: true,
    };

    // Activate the webcam stream
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        streamReference = stream;
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
        startButton.style.display = "block"; // Show the start button when the webcam is enabled
      })
      .catch((error) => {
        console.error("Error accessing the webcam: ", error);
        startButton.style.display = "none"; // Hide the start button if access to webcam fails
      });
  } else {
    // If disabling the webcam, stop all video tracks
    if (streamReference) {
      streamReference.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    startButton.style.display = "none"; // Hide the start button when the webcam is disabled
  }
}

function updateCounter() {
  counter = document.getElementById("counter");
  counter.textContent = reps;
}

let probabilityCap = 0.7;
let upStage = false;
let middleStage = false;
let startStage = false;
let reps = 0;
let counter;

const classNames = ["down", "middle", "up"];

const predictEveryNFrames = 4;
// Continuously grab image from webcam stream and detect it
let lastVideoTime = -1;


async function predictWebcam() {
  canvasElement.style.height = videoHeight;
  video.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  video.style.width = videoWidth;

  if (!webcamRunning) return;  

  window.requestAnimationFrame(predictWebcam); 

  // start detecting the stream.

  let currentTime = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;

    poseLandmarker.detectForVideo(video, currentTime, async (result) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Define the ROI coordinates
      const minX = canvasElement.width * 0.3 / canvasElement.width;  
      const maxX = canvasElement.width * 0.7 / canvasElement.width ;  
      const minY = 0.0; 
      const maxY = canvasElement.height * 1.0 / canvasElement.height; 

      drawCroppedFrameCorners(canvasElement, canvasCtx, minX, maxX, minY, maxY);

      if (result.worldLandmarks && result.worldLandmarks[0]) {
    

        let centerX = (result.landmarks[0][23].x + result.landmarks[0][24].x)/2.0
        let centerY =  result.landmarks[0][23].y

        if (centerX >= minX && centerX <= maxX) {
          
          // console.log("centerX: " + centerX + " minX: " + minX)

          for (const landmark of result.landmarks) {  
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
              radius: 0.1,
            });
          }

          if (startFlag) {
            if (frameCount % predictEveryNFrames === 0) {
              const landmarks = result.worldLandmarks[0].flatMap((l) => [
                l.x,
                l.y,
                l.z,
              ]);
  
              const inputData = tf.tensor2d([landmarks], [1, 99]);
              const prediction = model.predict(inputData);
              const predictedClassIndex = prediction.argMax(1);
              const probabilities = await prediction.data();
  
              predictedClassIndex.data().then((indices) => {
                // console.log(`Predicted class index: ${indices[0]}`);
                const classId = indices[0];
                const probability = probabilities[classId];
                const className = classNames[classId];
                if (modelDBName == "jumping_jacks") {
                  probabilityCap = 0.8;
                } else if (modelDBName == "pushups") {
                  probabilityCap = 0.6;
                } else {
                  probabilityCap = 0.7;
                }
                if (probability >= probabilityCap) {
                  if (className === "down") {
                    startStage = true;
                  }
                  if (startStage) {
                    if (className === "up" && !upStage) {
                      upStage = true;
                      playSound(upSound, 0.3);
  
                      if (reps >= 1) {
                        resetEndTimer();
                      }
                    } else if (className === "middle" && !middleStage) {
                      middleStage = true;
                    } else if (className === "down" && middleStage && upStage) {
                      reps += 1;
                      playSound(beepSound, 0.3);
                      updateCounter();
  
                      if (reps >= 1) {
                        resetEndTimer();
                      }
  
                      middleStage = false;
                      upStage = false;
                    }
                  }
                }
  
                // console.log(className)
                // Construct an array of predictions with their probabilities
                let predictions = classNames.map((name, index) => {
                  return { name: name, probability: probabilities[index] };
                });
  
                // Call updateBar with the sorted predictions
                updateBar(predictions);
                // // Update the prediction display div with new data
                // const predictionDisplay = document.getElementById('predictionDisplay');
                // predictionDisplay.innerText = `Stage: ${className}`;
              });
              inputData.dispose();
              prediction.dispose();
              predictedClassIndex.dispose();
            }
          }

        } else {
          // Person is outside the ROI
          console.log("Person out of ROI, stopping webcam.");
          initializePoseLandmarker()
        }


      } else {
        console.log("No landmarks detected or worldLandmarks[0] is undefined");
      }

      canvasCtx.restore();
    });
  }

  // frameCount++;
  // let delta = (currentTime - prevTime) / 1000; // seconds
  // if (delta >= 1) { // update every second
  //     fpsDisplay.innerText = `FPS: ${(frameCount / delta).toFixed(1)}`;
  //     frameCount = 0;
  //     prevTime = currentTime;
  // }

}


async function initializePoseLandmarker() {
  if (poseLandmarker) {
      poseLandmarker = null
  }
  const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  )
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
          modelAssetPath: `./mediapipemodels/pose_landmarker_full.task`,
          delegate: "GPU",
      },
      runningMode: runningMode,
      numPoses: 1
  });

    if (!webcamRunning) {
      webcamRunning = true;
      window.requestAnimationFrame(predictWebcam);
    }

}


function drawCroppedFrameCorners(canvas, ctx, minX, maxX, minY, maxY) {
  const cornerLength = 20; // Length of the corner lines
  const strokeWidth = 6; // Thickness of the lines
  ctx.strokeStyle = '#00FF00'; // Green colo
  ctx.lineWidth = strokeWidth;

  minX = minX * canvasElement.width
  maxX = maxX * canvasElement.width
  maxY = maxY * canvasElement.height
  // Draw four corners

  // Top left corner
  ctx.beginPath();
  ctx.moveTo(minX, minY + cornerLength);
  ctx.lineTo(minX, minY);
  ctx.lineTo(minX + cornerLength, minY);
  ctx.stroke();

  // Top right corner
  ctx.beginPath();
  ctx.moveTo(maxX, minY + cornerLength);
  ctx.lineTo(maxX, minY);
  ctx.lineTo(maxX - cornerLength, minY);
  ctx.stroke();

  // Bottom left corner
  ctx.beginPath();
  ctx.moveTo(minX, maxY - cornerLength);
  ctx.lineTo(minX, maxY);
  ctx.lineTo(minX + cornerLength, maxY);
  ctx.stroke();

  // Bottom right corner
  ctx.beginPath();
  ctx.moveTo(maxX, maxY - cornerLength);
  ctx.lineTo(maxX, maxY);
  ctx.lineTo(maxX - cornerLength, maxY);
  ctx.stroke();
}

