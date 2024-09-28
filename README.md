Excel To DB Readme

The code comprises of the following files: 

1. app.js: This is the main file that should be executed in order to run the code. It gets database details from the 
databaseManager.js, cleans the column values, creates an array of insertion queries and runs them.
2. DatabaseManager.js: This file gets all the data related to the database like the db name, host, username and password
from the config file. It also creates a log file with the number of records inserted in the database. 
3. ExcelParser.js: This file contains the code for parsing the Excel data into JSON so that it can be transferred into the
database. 
4. config.json: This file contains the details like excel file name and the database details.
5. package.json: This file contains the dependencies which must be installed for npm to run. 
6. Logger: This file contains the code for creating a log file that will have data regarding execution. We have 2 log files. One for app.js and verifydb.js.
7. Databaselogs: This file has the data for insertion execution.
8. Verifydatabaselogs: This file has the data for validation execution.

In order to run the code: 

1. Edit config.json with the file path and your databse details.
2. Run npm install command to install all the npm dependencies mentioned in package.json
3. In the powershell window, run command node app.js to begin execution.
4. In the powershell window, run command node verifydb.js to check for validation
5. You must check the log file for the validation
