function Logger(logFilePath) {
    this.fs = require("fs");
	this.dateFormat = require('dateformat');
	this.logPath = logFilePath;
}
//creates a log file
Logger.prototype.logInfo = function(infoString)
{
    var fd = this.fs.openSync(this.logPath,'a');
	infoString = this.dateFormat(Date.now(),"dd/mm/yyyy") + " -- " + infoString + "\n";
    this.fs.appendFileSync(fd,infoString,'utf8');
    this.fs.closeSync(fd);
}

module.exports = Logger;