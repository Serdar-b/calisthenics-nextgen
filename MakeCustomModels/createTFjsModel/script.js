  let model;
  let trainingData, outputData;

  // Load and parse the CSV file
  document.getElementById('loadData').addEventListener('click', () => {
      const fileInput = document.getElementById('csvFile');
      const file = fileInput.files[0];
      Papa.parse(file, {
          download: true,
          header: true,
          dynamicTyping: true,
          complete: function(results) {
              const data = results.data;
              const features = data.map(row => Object.values(row).slice(1, 100)); // Get the features from the CSV
              const labels = data.map(row => {
                if(row.class === 'down') return 0;
                if(row.class === 'middle') return 1;
                if(row.class === 'up') return 2;
            });
              trainingData = tf.tensor2d(features);
              outputData = tf.oneHot(tf.tensor1d(labels, 'int32'), 3);
              console.log('Data loaded');
          }
      });
  });

  // Define the model
  function createModel() {
      model = tf.sequential();
      model.add(tf.layers.dense({units: 64, activation: 'relu', inputShape: [99]}));
      model.add(tf.layers.dense({units: 32, activation: 'relu'}));
      model.add(tf.layers.dense({units: 3, activation: 'softmax'})); 
      model.compile({
          optimizer: 'adam',
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy'],
      });
  }

  // Function to train the model
  async function trainModel() {
    createModel();
    await model.fit(trainingData, outputData, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                const output = document.getElementById('output');
                output.innerText = `Epoch: ${epoch} - Loss: ${logs.loss}`;
            }
        }
    });
    document.getElementById('downloadModel').disabled = false;
  }

  document.getElementById('trainModel').addEventListener('click', async () => {
    await trainModel();
    console.log('Model training complete');
  });

  // Download the model to local storage
  //Make sure to change the name below in downloads://nameofmodel
  document.getElementById('downloadModel').addEventListener('click', async () => {
    await model.save('downloads://pushups');
  });




  // Function to make a prediction
  async function makePrediction(data) {

    console.log("The model have to be in the /createTFjsModel/models folder for the prediction to work, change path to model name")


    // Here you change the path to the model name you want if you want to do a test prediction on the model
    model = await tf.loadLayersModel('./models/pushups.json');

    if (!model) {
        console.log('Model not loaded.');
        return;
    }
    
    const inputData = tf.tensor2d([data], [1, 99]);
    const prediction = model.predict(inputData);
    
    prediction.print();

    prediction.data().then((predArray) => {
        document.getElementById('predictionOutput').innerText = `Prediction: ${predArray}`;
    });
  }

  // Generate random data and predict
  document.getElementById('predictRandom').addEventListener('click', () => {
    const randomData = Array.from({length: 99}, () => Math.random() * 1.4 - 0.7);
    makePrediction(randomData);
  });