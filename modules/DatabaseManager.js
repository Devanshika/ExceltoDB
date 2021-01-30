//these values are fetched from config.json
function DatabaseManager(database_settings) {
    this.database_name = database_settings['database_name'];
    this.host_name = database_settings['host_name'];
    this.user_name = database_settings['user_name'];
    if(database_settings['password'] == null)
    {
        this.password = "";
    }
    else
    {
        this.password = database_settings['password'];
    }
    this.sql_queries = [];
    this.table_data = {};
    this.MySQL = require('mysql');
	this.util = require('util');
}

DatabaseManager.prototype.addInsertQuery = function(tableName,columnNames, values) {
	var newQuery = {};
	newQuery['QUERY'] = "INSERT INTO " + tableName + "(" + columnNames + ") VALUES ?";
	newQuery['VALUES'] = [];
	newQuery['VALUES'].push(values);
	//sql queries contains the list of insert queries
    this.sql_queries.push(newQuery);
};
DatabaseManager.prototype.runDatabaseQueries = async function() {
    var connection = this.MySQL.createConnection({
        host: this.host_name,
        user: this.user_name,
        password: this.password,
        database: this.database_name
    });
	connection.connect();
	//runs insert queries and returns the number of records
	var no_of_records_inserted = await runInsertQueries(connection,this);
	return no_of_records_inserted;
};

DatabaseManager.prototype.doesRowExist = function(tableName, firstColumn, columnRowObject)
{
	//checks if table exists
	var tableData = this.table_data[tableName];
	if(tableData == undefined)
	{
		return false;
	}
	if(tableData.length == 0)
	{
		return false;
	}
	for(var i = 0; i < tableData.length; i ++)
	{
		//checks if the data is present in the database
		if(!tableData[i].hasOwnProperty(firstColumn))
		{
			continue;
		}
		if(tableData[i][firstColumn] != columnRowObject[firstColumn])
		{
			continue;
		}
		var rowPres = true;
		var keys = Object.keys(columnRowObject);
		for(var j = 0; j < keys.length; j ++)
		{
			var key = keys[j];
			if(!tableData[i].hasOwnProperty(key))
			{
				rowPres = false;
				break;
			}
			else if(tableData[i][key] != columnRowObject[key])
			{
				rowPres = false;
				break;
			}
		}
		if(rowPres == true)
		{
			return true;
		}
	}
	return false;
}
//function that runs the insert query
var runInsertQueries = async function(connection, dbObject)
{
	var query = dbObject.util.promisify(connection.query).bind(connection);
	var no_of_records_inserted = 0;
	try
	{
		for(i = 0 ;i < dbObject.sql_queries.length; i ++)
		{
			var insertQuery = await query(dbObject.sql_queries[i]['QUERY'],[dbObject.sql_queries[i]['VALUES']]);
			no_of_records_inserted += insertQuery.affectedRows;
		}
		dbObject.sql_queries = [];
	}
	finally
	{
		connection.end();
		return no_of_records_inserted;
	}
}
 
var addToTableData = async function(connection, tableName, dbObject)
{
	var query = dbObject.util.promisify(connection.query).bind(connection);
	try {
		var selectQuery = await query('SELECT * FROM ' + tableName);
		dbObject.table_data[tableName] = selectQuery;
	} finally {
		connection.end();
	}
}

DatabaseManager.prototype.populateTableData = async function (tableName) {
    
	var connection = this.MySQL.createConnection({
        host: this.host_name,
        user: this.user_name,
        password: this.password,
        database: this.database_name
    });
    connection.connect();
	await addToTableData(connection, tableName, this);
};


module.exports = DatabaseManager;