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

## How to train your own models

Inside the MakeCustomModels folder there are two folders, exerciseDataAndTesting and createTFjsModel. In order to get data for the model go to the exerciseDataTesting folder and start by creating a video in the createvideo.py script of yourself doing the exercise (skip this step if you already have a video of an exercise).
You can do the exercise fully or just do seperate videos of parts of the exercsise.
Inside the exportcsvv.py script change the EXPORT_PATH to the desired name of the data csv file and VIDEO_PATH to the video you created.
This script exports the coordinates of the landmarks during the exercise and labeling the data. 
There are three stages when exporting, the up, middle and down. When the video is running with the skeleton landmarks, press the "w" button on your keybaord to export the up position of the exercise, labeling all that data with "up".
Press "d" on the keyboard to export the coordinates of the middle position labeling the data with "middle". Finally, press "s" on the keyboard to export the down position of the exercise, labeling the coordinate data as "down".
You can change these in the script as

            k = cv2.waitKey(1)
            if k == ord('w'):
                export_landmark(results, 'up')
            elif k == ord('d'):
                export_landmark(results, 'middle')
            elif k == ord('s'):
                export_landmark(results, 'down')
When you have the csv file, you can create the model and test in inside python, skip this step if you directly want to create a tensorflow js model running on the web.

Go to modelcreate.py and change the EXPORT_PATH to your csv file and MODEL_PATH to the desired name of the model. Run the code and you will get a model inside the models folder.

Finally test the model, by going into modeltest.py and change the MODEL_PATH, then run the code and you can test the result.

Now when creating a Tensorflow JS model, go to the createTFjsModel folder and from the script.js file you have to change the name of the model that you create at downloads://nameofmodel

  document.getElementById('downloadModel').addEventListener('click', async () => {
    await model.save('downloads://pushups');
  });

Then, inside the createTFjsModel pen the index.html in the browser. 

Now in the browser choose the csv file that you created in the choose File button, press load data to load it, then download the model, you will get the .json file and a weights.bin file. If you want to do a test prediction on the model you can put the model in the models folder inside createTFjsModel and press predict with Random Data.

Now that the model is finished you can put it in the main application. In app.js at the switch cases where the models are initialized repeat the same thing but with your model.

Now in the index.html add your model here

              <select id="modelSelector" class="form-control">
                <option value="pullups">Pullups</option>
                <option value="squats">Squats</option>
                <option value="situps">Situps</option>
                <option value="pushups">Pushups</option>
                <option value="jumpingjacks">Jumping Jacks</option>
              </select>


Now all should be set and done.




