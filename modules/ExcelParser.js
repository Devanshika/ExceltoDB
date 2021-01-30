 function ExcelParser() {
    this.dateFormat = require('dateformat');
    this.parser = require('xlsx');
}
//this code parses the excel sheet to get the jsonworkbookarray
ExcelParser.prototype.getWorkBookJson = function(workBookPath) {
    var workBook = this.parser.readFile(workBookPath, {
        type : 'file',
        cellDates: true,
        cellNF : false,
        cellText : false
    });
    var parsedJSONWorkBookArray = [];
    for (i in workBook.SheetNames) 
    {
        var workSheetObj = {};
        var sheetName = workBook.SheetNames[i];
        workSheetObj["table"] = sheetName.toLowerCase();
        var columnNames = [];
        var sheetObject = workBook.Sheets[sheetName];
        var range = this.parser.utils.decode_range(sheetObject['!ref']);
        var C, R = range.s.r;
        for (C = range.s.c; C <= range.e.c; ++C) {
            var cell = sheetObject[this.parser.utils.encode_cell({ c: C, r: R })];
            var column = "Not Set" + C;
            if (cell && cell.t) {
                column = this.parser.utils.format_cell(cell);
            }
            columnNames.push(column);
        }
        var dataRows = [];
        var NC,NR = range.s.r;
        ++NR;
        while(NR <= range.e.r)
        {
            for(NC = range.s.c; NC <= range.e.c; ++NC)
            {
                var cell = sheetObject[this.parser.utils.encode_cell({ c: NC, r: NR })];
                if(cell && cell.t)
                {
                    if(cell.t == 'd')
                    {
                        var date = new Date(cell.v);
                        cell.v = this.dateFormat(date,"dd/mm/yyyy");
                        cell.t = 's';
                    }
                }
            }
            ++NR;
        }
        var sheetJson = this.parser.utils.sheet_to_json(sheetObject);
        for (k = 0; k < sheetJson.length; k++) 
        {
            var singleRowObject = {};
            singleRowObject["columns"] = [];
            singleRowObject["values"] = [];
            columnNames.forEach(element => {
                if(sheetJson[k][element] != undefined)
                {
                    singleRowObject["columns"].push(element);
                    singleRowObject["values"].push(sheetJson[k][element]);
                }
            });
            dataRows.push(singleRowObject);
        }
        workSheetObj["rows"] = dataRows;
        parsedJSONWorkBookArray.push(workSheetObj);
    }
    return parsedJSONWorkBookArray;
};

module.exports = ExcelParser;