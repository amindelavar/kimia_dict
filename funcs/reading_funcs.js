const fs = require("fs");


exports.load_config_file = function(path) {
    var data = fs.readFileSync(path, 'utf-8');
    var items = [];
    //ret(data);
    var ar = data.split("\n");
    for (let i = 0; i < ar.length; i++) {
        if (ar[i].length < 2 || (ar[i][0] == '/' && ar[i][0] == '/')) {
            continue;
        }
        var ar1 = ar[i].split("*");
        if (ar1.length != 2) {
            continue;
        }
        items[ar1[0].trim()] = ar1[1].trim();
    }
    return items;
}

//***************************************************************************************
exports.load_database_file = function(path) {
        var data = fs.readFileSync(path, 'utf-8');
        var database = "";
        var ar = data.split("\n");
        for (let i = 0; i < ar.length; i++) {
            if (ar[i].length < 2 || (ar[i][0] == '/' && ar[i][0] == '/')) {
                continue;
            }
            var ar1 = ar[i].split("@");
            if (ar1.length != 2) {
                continue;
            }
            database += ar[i] + '\n';
        }
        return database;
    }
    //***************************************************************************************
exports.load_normal_file = function(path) {
    return fs.readFileSync(path, 'utf-8');
}