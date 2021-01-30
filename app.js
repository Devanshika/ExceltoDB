//sets path for all the files
var DatabaseManager = require('./modules/DatabaseManager.js');
var ExcelParser = require('./modules/ExcelParser.js');
var ConfigFile = require('./config.json');
var Logger = require('./modules/Logger.js');

const databaseManager = new DatabaseManager(ConfigFile["database_settings"]);
const excelParser = new ExcelParser();
const log = new Logger(ConfigFile["insert_database_path"]);

(async () => {
	//gets the data from the excel sheet
	var jsonDataDump = excelParser.getWorkBookJson(ConfigFile["excel_file_name"]);
	for(i in jsonDataDump)
	{
		var tableName = jsonDataDump[i]["table"];
		//we make sure that there are no punctuation in the table name
		tableName = tableName.replace(/[-&\/\\#, +()$~%.":*?<>{}\']/g, "_");
		for(j = 0; j < jsonDataDump[i]["rows"].length; j ++)
		{
			for(l = 0; l < jsonDataDump[i]["rows"][j]["columns"].length; l ++)
			{
				var stringColumnName = JSON.stringify(jsonDataDump[i]["rows"][j]["columns"][l]);
				//we make sure that there are no punctuation in the column name
				stringColumnName = stringColumnName.replace(/[-&\/\\#, +()$~%.":*?<>{}\']/g, "_");
				for(k = 0; k < stringColumnName.length; k ++)
				{
					//this code makes sure that there are no consecutive underscores as space
					// is replaced by underscore 
					
					if(stringColumnName.charAt(k) == '_')
					{
						k++;
						if(k == stringColumnName.length)
						{
							break;
						}
						while(stringColumnName.charAt(k) == '_')
						{
							stringColumnName = stringColumnName.slice(0,k-1) + stringColumnName.slice(k);
							if(k == stringColumnName.length)
							{
								break;
							}
						}
					}
				}
				if(stringColumnName.charAt(stringColumnName.length-1) == '_')
				{
					stringColumnName = stringColumnName.substring(0,stringColumnName.length-1);
				}
				if(stringColumnName.charAt(0) == '_')
				{
					stringColumnName = stringColumnName.substring(1);
				}
				jsonDataDump[i]["rows"][j]["columns"][l] = stringColumnName;    
			}
			var columnNameString = JSON.stringify(jsonDataDump[i]["rows"][j]["columns"]);
			columnNameString = columnNameString.substring(1,columnNameString.length-1).replace(/"/g,'');
			//this function is called from DatabaseManger.js and it inserts the value from excel to database
			databaseManager.addInsertQuery(tableName,columnNameString,jsonDataDump[i]["rows"][j]["values"]);
		}
		//this counts the number of records inserted in the database
		//this gets displayed in databaselogs file
		var no_of_records_inserted = await databaseManager.runDatabaseQueries();
		log.logInfo("Table : " + tableName + " , Number of Records : " +  no_of_records_inserted);
	}
})()