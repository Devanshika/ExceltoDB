//sets path for files 
var DatabaseManager = require('./modules/DatabaseManager.js');
var ExcelParser = require('./modules/ExcelParser.js');
const ConfigFile = require('./config.json');
var Logger = require('./modules/Logger.js');

const databaseManager = new DatabaseManager(ConfigFile["database_settings"]);
const excelParser = new ExcelParser();
const log = new Logger(ConfigFile["verify_database_path"]);

var verifyTableData = async function(tableName, rows)
{
	try
	{
		await databaseManager.populateTableData(tableName);
	}
	finally
	{
		//checks if the rows are matching in the database 
		log.logInfo("TableName : " + tableName + "\n");
		var rowsNotPresent = "\nRows Not Present\n";
		var matchedRows = 0;
		for(j = 0; j < rows.length; j ++)
		{
			var firstColumn = "";
			var rowColumnObject = {};
			for(l = 0; l < rows[j]["columns"].length; l ++)
			{
				var stringColumnName = JSON.stringify(rows[j]["columns"][l]);
				stringColumnName = stringColumnName.replace(/[-&\/\\#, +()$~%.":*?<>{}\']/g, "_");
				for(k = 0; k < stringColumnName.length; k ++)
				{
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
				if(l == 0)
				{
					firstColumn = stringColumnName;
				}
				rows[j]["columns"][l] = stringColumnName;
				rowColumnObject[stringColumnName] = rows[j]["values"][l];
			}
			//checks the validation
			if(databaseManager.doesRowExist(tableName,firstColumn,rowColumnObject))
			{
				matchedRows ++;
			}
			else
			{
				rowsNotPresent += "Row : " + JSON.stringify(rowColumnObject) + "\nNOT PRESENT in Database.\n";			
			}
		}
		//returns the matchedRows in verifydb log file
		matchedRows = (matchedRows/rows.length) * 100.00;
		log.logInfo("Match Percentage : " + matchedRows + "\n");
		if(rowsNotPresent.charAt(rowsNotPresent.length - 2) == '.')
		{
			log.logInfo(rowsNotPresent);
		}
	}
};


(async () => {
	var jsonDataDump = excelParser.getWorkBookJson(ConfigFile["excel_file_name"]);
	for(i in jsonDataDump)
	{
		var tableName = jsonDataDump[i]["table"];
		tableName = tableName.replace(/[-&\/\\#, +()$~%.":*?<>{}\']/g, "_");
		await verifyTableData(tableName, jsonDataDump[i]["rows"]);
	}
})()