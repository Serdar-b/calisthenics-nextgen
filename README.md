This project uses AI and computer vision to track your exercises. It is based on an original project from https://github.com/Gabbosaur and has been improved with additional features and optimizations.


## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [npm](https://npmjs.com/) (normally comes with Node.js)

## Database Setup

1. **Create the Database and Tables:**
   - Start your PostgreSQL command line client.
   - Run the following SQL commands to create your database and tables:

   ```sql
   CREATE DATABASE calisthenics;

   \c calisthenics

Then run the commands in the database.sql script located in the project folder to create all the nessecary tables for the leaderboard.


Modify Database Connection Settings:
Open the server file where the PostgreSQL pool is configured.
Adjust the user, password, host, database, and port fields to match your PostgreSQL setup.
Running the Server


Install Dependencies:
Navigate to the directory containing your server file.
Run the following command to install the necessary npm packages:
Copy code
npm install
Start the Server:

In the same directory, start the server using:
sql
Copy code
npm start
Accessing the Application:

Open index.html in your web browser to interact with the application.
The server runs on http://localhost:3000 by default, and API endpoints can be accessed through this URL.

## How to Train Your Own Models

This guide will help you create and integrate custom models for different exercises into the application. Follow the steps in the `MakeCustomModels` folder, which contains two subfolders: `exerciseDataAndTesting` and `createTFjsModel`.

### Preparing Exercise Data

1. **Video Recording:**
   - Navigate to the `exerciseDataAndTesting` folder.
   - If you don't already have a video of the exercise, use the `createvideo.py` script to record yourself performing the exercise. You can record the complete exercise or separate videos for different stages.

2. **Export Landmark Coordinates:**
   - Open the `exportcsv.py` script.
   - Set the `EXPORT_PATH` to your desired CSV filename and `VIDEO_PATH` to your video.
   - Run the script to start the video with skeleton landmarks displayed. Use your keyboard to label different stages of the exercise:
     - Press **W** to label the "up" position.
     - Press **D** to label the "middle" position.
     - Press **S** to label the "down" position.

   Example key handling code snippet:
   ```python
   k = cv2.waitKey(1)
   if k == ord('w'):
       export_landmark(results, 'up')
   elif k == ord('d'):
       export_landmark(results, 'middle')
   elif k == ord('s'):
       export_landmark(results, 'down')

## Training and Testing the Model

### Create the Model:
- Open `modelcreate.py`.
- Update `EXPORT_PATH` with your CSV file path and `MODEL_PATH` with your desired model name.
- Run the script to generate the model in the `models` folder.

### Test the Model:
- Open `modeltest.py`.
- Set `MODEL_PATH` to your new model file.
- Execute the script to test the model's performance.

## Creating a TensorFlow.js Model

### Prepare the TensorFlow.js Model:
- Go to the `createTFjsModel` folder.
- In `script.js`, replace the model name in the `model.save` method to your new model's name:
  ```javascript
  document.getElementById('downloadModel').addEventListener('click', async () => {
    await model.save('downloads://pushups');
  });


## Use the Model in a Web Browser

1. Open `index.html` in your browser.
2. Choose your CSV file and load the data, then download the model to get the `.json` file and `weights.bin` file.
3. If you want to make a test prediction, place the model in the `models` folder within `createTFjsModel` and click 'Predict with Random Data'.

## Integrating the Model into the Main Application

### Add the Model to the Application

Put the weight.bin and .json files that you downloaded inside the custommodels folder.

- In `app.js`, follow the existing examples to initialize your new model within the switch cases.

### Update the Model Selector in `index.html`

Add a new option for your model in the model selector dropdown:

```html
<select id="modelSelector" class="form-control">
  <option value="pullups">Pullups</option>
  <option value="squats">Squats</option>
  <option value="situps">Situps</option>
  <option value="pushups">Pushups</option>
  <option value="jumpingjacks">Jumping Jacks</option>
  <!-- Add new model option here -->
  <option value="newmodel">New Model</option> <!-- Add new model option here --> should be the same name in the app.js initialization.
</select>
