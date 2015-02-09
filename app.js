var jsdom = require("jsdom"); 
var prettyjson = require('prettyjson');
var fs = require('fs');
var json2csv = require('json2csv');


var csvPrint = function(schedule, date) {
    json2csv({data: schedule, fields: ["time", "location", "course", "consultant", "clients"]}, function(err, csv) {
        if (err)  {
            console.log(err);
        }
        fs.writeFile("output/" + date + ".csv", csv, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        }); 
    });
}

var rawSchedule = function(myTableArray) {
    var schedule = {};
    schedule["8:00 AM"] = [];
    schedule["9:00 AM"] = [];
    schedule["10:00 AM"] = [];
    schedule["11:00 AM"] = [];
    schedule["12:00 PM"] = [];
    schedule["1:00 PM"] = [];
    schedule["2:00 PM"] = [];
    schedule["3:00 PM"] = [];
    schedule["4:00 PM"] = [];
    schedule["5:00 PM"] = [];
    schedule["6:00 PM"] = [];
    schedule["7:00 PM"] = [];

    myTableArray.forEach(function(element) {
        var temp = {};
        temp.clients = [];
        temp.clients.push(element[2]);
        temp.consultant = element[4];
        temp.course = element[5];
        temp.group = "no";
        if (schedule[element[1]]) {
            schedule[element[1]].forEach(function(e) {
                if (e.consultant === temp.consultant) {
                    temp.group = "yes";
                    e.group = "yes";
                    e.clients.push(temp.clients[0]);
                }
            });
            if (temp.group !== "yes") {
                schedule[element[1]].push(temp);
            }
        }
    });
    return schedule;
}

var finalSchedule = function(schedule) {
    var result = [];
    var action1 = function(time) {
        var Gslots = ["G1", "G2", "G3", "G4"];
        var Sslots = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

        schedule[time].forEach(function(e) {
            var temp = {};
            temp["time"] = time;
            var clients = "";
            e.clients.forEach(function(element) {
                clients += element;
                clients += ", ";
            });
            temp["clients"] = clients;
            temp["consultant"] = e.consultant;
            var location;
            if (e.group === "yes") {
                location = Gslots.shift();
            } else {
                location = Sslots.shift();
            }
            if (location) {
                temp["location"] = location;
            } else {
                temp["location"] = "N/A";
            }
            temp["course"] = e.course;
            result.push(temp);
        });

    };
    var action2 = function(time) {

        var Gslots = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11"];
        var Sslots = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
        
        schedule[time].forEach(function(e) {
            var temp = {};
            temp["time"] = time;
            var clients = "";
            e.clients.forEach(function(element) {
                clients += element;
                clients += ", ";
            });
            temp["clients"] = clients;
            temp["consultant"] = e.consultant;
            var location;
            if (e.group === "yes") {
                location = Gslots.shift();
            } else {
                location = Sslots.shift();
            }
            if (location) {
                temp["location"] = location;
            } else {
                temp["location"] = "N/A";
            }
            temp["course"] = e.course;
            result.push(temp);
        });
    };

    var mapping = {
        "8:00 AM"  : action1,  
        "9:00 AM"  : action1, 
        "10:00 AM" : action1,
        "11:00 AM" : action1,  
        "12:00 PM" : action1, 
        "1:00 PM"  : action1, 
        "2:00 PM"  : action1, 
        "3:00 PM"  : action1, 
        "4:00 PM"  : action1,
        "5:00 PM"  : action2, 
        "6:00 PM"  : action2, 
        "7:00 PM"  : action2
    };
    
    for (var k1 in schedule) {
        mapping[k1](k1);
    }
    return result;
}

var getDate = function(rawDate) {
    var temp = rawDate.split('/');
    return temp[0] + '.' + temp[1] + '.' + temp[2];
}

fs.readFile('input/input.html', {"encoding" : "utf8" }, function(err, data) {
    if (err) throw err;
    jsdom.env({
        html: data,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function (errors, window) {
            var $ = window.$;
            var myTableArray = [];
            $("table.reportListing tbody tr").each(function() {
                var arrayOfThisRow = [];
                var tableData = $(this).find('td');
                if (tableData.length > 0) {
                    tableData.each(function() { arrayOfThisRow.push($(this).text()); });
                    myTableArray.push(arrayOfThisRow);
                }
            });
            // get rid of the first element
            myTableArray.splice(0, 1);
            var schedule = rawSchedule(myTableArray);
            schedule = finalSchedule(schedule);

            var date = getDate(myTableArray[0][0]);
            csvPrint(schedule, date);
        }
    });
});
