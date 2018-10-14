
//note: to run from cmd: 'npm start'
//to package: 'npm run build'
// const electron = require("electron");
// const ipc = electron.ipcRenderer;
// document.addEventListener("DOMContentLoaded", function(){
//   ipc.send("mainWindowLoaded");
//   ipc.on("resultSent", function(evt, result){
//     //maybe put updateDB here for the initial run?
//     for(var i = 0; i < result.length; i++){
//       addItemToHTML(result[i].taskTitle.toString(), result[i].timeSpent);
//       //console.log(result[i].TimeSpent);
//     };
//   });
// });




var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./taskDB.sqlite3"
  },
  useNullAsDefault: true
});

//create table if it does not already exist

var urlEnd;
var user;
var subcalendar_ids = [];

var teamUpURLElem = document.getElementById("teamUpURLEnd");
var teamUpUserElem = document.getElementById("teamUpUser");
var teamUpSubcalendar_IdsElem = document.getElementById("teamUpSubcalendar_Ids");

knex.schema.hasTable('teamUpURL').then(function(exists) {
  if (!exists) {
    return knex.schema.createTable('teamUpURL', function(t) {
      t.increments('id').primary().unsigned();
      t.string('urlEnd');
      t.string('user');
      t.string('subcalendar_ids');

      knex('teamUpURL').insert({
        id: "1",
        urlEnd: "",
        user: "",
        subcalendar_ids: "",
      }).then();
    })

  } else{
    //if table exists on startup then update the HTML from the SQL data
    let myTeamUpURL = knex.where("id", "=", 1).select().from("teamUpURL");
    myTeamUpURL.then(function(data){
      //not completely sure at the moment why 'innerHTML' does not show (placeholder stays shown)
      //maybe make an 'edit' button for this later instead of having it always open
      //is data[0] really the best way to do this?
      urlEnd = data[0].urlEnd.toString();
      teamUpURLElem.value = urlEnd;

      user = data[0].user;
      teamUpUserElem.value = user;

      subcalendar_ids[0] = Number(data[0].subcalendar_ids);
      teamUpSubcalendar_IdsElem.value = subcalendar_ids;
      prepGETRequest();
    });
  }//end else
})//end then

knex.schema.createTableIfNotExists('Tasks', function(table){
  table.increments('id').primary().unsigned();
  table.string('taskTitle');
  table.integer('myDate');
  table.integer('timeSpent');
  table.string('myComments');
}).then();

//initialize page by reading sql and adding from the database
//might just make this 'SaveURL'

function toggleElemVisibility(elem){
  if (elem.style.display === "none") {
    elem.style.display = "inline-block";
  } else {
    elem.style.display = "none";
  }
}

function editTeamUpDetails(){
    var x = document.getElementById("saveTeamUpDetailsButton");
    var y = document.getElementById("editTeamUpButton");
    toggleElemVisibility(x);
    toggleElemVisibility(y);
    teamUpURLElem.disabled = false;
    teamUpUserElem.disabled = false;
    teamUpSubcalendar_IdsElem.disabled = false;

    teamUpURLElem.type = "text";

    teamUpURLElem.style.background = "#b7b7b7";
    teamUpUserElem.style.background = "#b7b7b7";
    teamUpSubcalendar_IdsElem.style.background = "#b7b7b7";

    teamUpURLElem.style.color = "black";
    teamUpUserElem.style.color = "black";
    teamUpSubcalendar_IdsElem.style.color = "black";

    //change how the items look and whether they are editable
    //stop showing as passworded?

}

function saveTeamUpDetails(){
  var x = document.getElementById("saveTeamUpDetailsButton");
  var y = document.getElementById("editTeamUpButton");



  var teamUpURLElem = document.getElementById("teamUpURLEnd");
  //changed my mind, this should always update the SQL whether the input is blank or not
  //if (teamUpURLElem.value != ""){ //dont bother doing stuff if its blank
    knex('teamUpURL')
    .where('id', '=', 1)
    .update({
      urlEnd: teamUpURLElem.value,
      user: teamUpUserElem.value,
      subcalendar_ids: teamUpSubcalendar_IdsElem.value
    })
    .then(function(){
      urlEnd = teamUpURLElem.value;
      user = teamUpUserElem.value;
      subcalendar_ids[0] = Number(teamUpSubcalendar_IdsElem.value);
      console.log(urlEnd);
      console.log(user);
      console.log(subcalendar_ids);
    });
  //}//end if
  teamUpURLElem.disabled = true;
  teamUpUserElem.disabled = true;
  teamUpSubcalendar_IdsElem.disabled = true;

  teamUpURLElem.type = "password";

  teamUpURLElem.style.background = "";
  teamUpUserElem.style.background = "";
  teamUpSubcalendar_IdsElem.style.background = "";

  teamUpURLElem.style.color = "white";
  teamUpUserElem.style.color = "white";
  teamUpSubcalendar_IdsElem.style.color = "white";

  toggleElemVisibility(x);
  toggleElemVisibility(y);
}

function prependZero(num){ //puts a 0 in front if it is less than 10 (i.e. one digit)
    if (num < 10) {
        num = "0" + num
    }
    num = num.toString();
    return num;
};

//var direction = "In";
//var user = "Josh";
//var subcalendar_ids = [4972516];


//var getURL = "https://teamup.com/ksy1mf2hkj4ubwrafa/events?startDate=2018-10-13&endDate=2018-10-13&tz=Australia%2FSydney";

  var dt = new Date();
  var formattedToday = dt.getFullYear() + "-" + prependZero((dt.getMonth() + 1)) + "-" + prependZero(dt.getDate());
  var getURL = "";

  var parsedGETResponse;
function prepGETRequest(){
  getURL = "https://teamup.com/" + urlEnd + "/events?startDate=" + formattedToday + "&endDate=" + formattedToday + "&tz=Australia%2FSydney";
}


var latestEntryTitle;
function sendGETRequest(){
  //do stuff only if getURL is ready?
  if(getURL != "" && getURL.search("teamup.com")) {
    //console.log(getURL);
    var latestIndices;
    var x = document.getElementById("signInOutLog");
    var oReq = new XMLHttpRequest();
    oReq.open("GET", getURL);
    oReq.send();

    //oReq.addEventListener("load", reqListener);

    oReq.onreadystatechange = function() {//Call a function when the state changes.
        if(oReq.readyState == 4) {
          //console.log(oReq.status);
          //console.log(oReq.responseText);
          parsedGETResponse = JSON.parse(oReq.responseText);
          latestIndices = getLastEvent(subcalendar_ids, parsedGETResponse);
          i = latestIndices[latestIndices.length - 1];
          latestEntryTitle = parsedGETResponse.events[i].title;
          //console.log(parsedGETResponse.events[latestIndex].title);
          var warningString;
          if (latestIndices.length > 1) {
            warningString = "<br>Warning: multiple entries detected at latest time.";
          } else {
            warningString = ""
          }
          x.innerHTML = "Latest entry detected: <b>" + parsedGETResponse.events[i].title + "</b> at " + parsedGETResponse.events[i].start_dt.split("T")[1].split("+")[0] + warningString;

        }
    }
  }

}

var timeStringArray = [];


function getLastEvent(subcalendar_ids, parsedGETResponse){
  timeStringArray = [];
  //console.log(subcalendar_ids[0])
  //parsedGETResponse.events
  for (var i = 0; i < parsedGETResponse.events.length; i++) {
    //console.log(parsedGETResponse.events[i].subcalendar_ids[0]);
    if (subcalendar_ids[0] == parsedGETResponse.events[i].subcalendar_ids[0]) {
      //check which is latest, then do below
      //check latest of: parsedGETResponse.events[i].start_dt
      timeStringArray.push(parsedGETResponse.events[i].start_dt)

    }
  }
  return findLatestFormattedTime(timeStringArray);
}
//var myMax;
function findLatestFormattedTime(timeStringarray){
  //[DEBUG] make sure this function works well!
  //do something for when the array is empty (i.e. there are no entries for the day)
  //expected format: YYYY-MM-DDTHH:MM:SS+HH:SS (last HH:SS is GMT timezone)
  //e.g. 2018-10-15T01:54:00+11:00
  //timeString
  //return i so we know which event was the last one
  var splits;
  var hrs;
  var mins;
  var secs;
  var timezone;
  var timeAmount = [];

  var latestIndex;

  for (var i = 0; i < timeStringArray.length; i++) {
    //split each of them here
    splits = timeStringArray[i].split("T");
    splits = splits[1].split("+");
    //console.log(splits);
    timezone = splits[1];
    splits = splits[0].split(":");
    hrs = splits[0];
    mins = splits[1];
    secs = splits[2];

    timeAmount[i] = Number(hrs) * 3600 + Number(mins) * 60 + Number(secs);
    //console.log("time amount: " + timeAmount[i]);
  }
  //[DEBUG] replace below to find all indices of max items, not just the one
  latestIndices = max(timeAmount);
  //myMax = latestIndices;
  //latestIndex = timeAmount.indexOf(Math.max(...timeAmount));
  //where x is the index of the item with the latest start date
  //var x = 0;
  //console.log("latest item detected: " + parsedGETResponse.events[latestIndex].title + " at " + parsedGETResponse.events[latestIndex].start_dt.split("T")[1].split("+")[0]);
  //return latestIndex;
  return latestIndices;
}

function max(arr) {
  var max = -Infinity;
  var maxIndices = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === max) {
      maxIndices.push(i);
    } else if (arr[i] > max) {
      maxIndices = [i];
      max = arr[i];
    }
  }
  return maxIndices;
}

function reqListener() {
    console.log(this.responseText);
    //console.log(oReq.responseText);
}


function signInRequest(){

    if (latestEntryTitle == "In") {
      //warning goes here
      console.log("Warning: already signed in!")
      if (confirm("Latest entry indicates you are already signed in. Are you sure you wish to continue?")) {
        console.log("signing in");
        signInOut("In", user, subcalendar_ids);
      }
    } else {
      console.log("signing in");
      signInOut("In", user, subcalendar_ids);
    }
}

function signOutRequest(){

    if (latestEntryTitle == "Out") {
      //warning goes here
      console.log("Warning: already signed out!")
      if (confirm("Latest entry indicates you are already signed Out. Are you sure you wish to continue?")) {
        console.log("signing out");
        signInOut("Out", user, subcalendar_ids);
      }
    } else {
      console.log("signing out");
      signInOut("Out", user, subcalendar_ids);
    }
}

function signInOut(direction, who, subcalendar_ids){

  //TODO
  //do a GET request and warn if trying to sign in when already signed in?


    var postReq = new XMLHttpRequest();
    //var params = 'title="title"&all_day=false&custom={}&end_dt="2018=10=12T11:30:00"&location="location"&notes="<p>myNote<p>"&start_dt="2018-10-12T11:00:00&0=4972516&title="title"&who="person"';
    //direction dictates: title, location, notes
    //who and subcalendar_ids are tied together?

    if (direction == "In"){
        var title = "In";
        var location = "Office";
        var notes = "Arrived to office";
    } else if (direction == "Out"){
        var title = "Out";
        var location = "Home";
        var notes = "Leaving office";
    } else {
        var title = "unspecified";
        var location = "unspecified";
        var notes = "unspecified";
    }

    var dt = new Date();
    var currentDateAndTime = dt.getFullYear() + "-" + prependZero((dt.getMonth() + 1)) + "-" + prependZero(dt.getDate()) + "T" + prependZero(dt.getHours()) + ":" + prependZero(dt.getMinutes()) + ":" + prependZero(dt.getSeconds());
    console.log(currentDateAndTime);
    //var title = "someTitle";
    //var start_dt = "2018-10-13T18:30:00";
    var start_dt = currentDateAndTime;
    //var end_dt = "2018-10-13T19:30:00";
    var end_dt = currentDateAndTime;
    var all_day = false;
    //var location = "here";
    //var who = "me";
    //var notes = "whatsHere";
    //var subcalendar_ids = [4972516];
    var custom = {};

    var params = JSON.stringify({"title":title,"start_dt":start_dt,"end_dt":end_dt,"all_day":all_day,"location":location,"who":who,"notes":notes,"subcalendar_ids":subcalendar_ids,"custom":custom});
//var url = "https://teamup.com/kszhnbki5dmm3f4nd5/events?tz=Australia%2FSydney";
    var fullURL = "https://teamup.com/" + urlEnd + "/events?tz=Australia%2FSydney";
    postReq.open("POST", fullURL, true);

    //send the proper header information along with the request
    //postReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    postReq.setRequestHeader('Content-type', 'application/json');

    postReq.onreadystatechange = function() {//Call a function when the state changes.
        //if(postReq.readyState == 4 && postReq.status == 200) {
        //if(postReq.readyState == 4 && postReq.status != 201) {
        if(postReq.readyState == 4) {
          console.log(postReq.responseText);
          var parsedResponse = JSON.parse(postReq.responseText);
          var x = document.getElementById("signInOutStatus");
          if(postReq.status == 201) {
            x.innerHTML = "Successfully created event: " + "Signing " + direction;
          } else {
            x.innerHTML = "Unexpected server response. Status: " + postReq.status + "<br>Message: " + parsedResponse.error.message;
          }
          //[DEBUG] replace this with the error element rather than console log?




        }
        //below is only for when on the teamup page really
        //window.location.reload();
    }

    postReq.send(params);
}



let myResult = knex.select().from("Tasks");
myResult.then(function(rows){
  //console.log(rows);
  for(var i = 0; i < rows.length; i++){
    addItemToHTML(rows[i].id, rows[i].taskTitle.toString(), rows[i].timeSpent, rows[i].myDate, rows[i].myComments.toString());
  };
});


//Dictionary constructor function
function Dictionary(){
  this.myTasks = [];

  //work out a way to deal with '0' as an input (doesn't AND together well?)
  //maybe just don't have it here? dunno
  this.add = function(id, taskTitle, timeSpent, myDate, myComments){
    //if(id && taskTitle && timeSpent && myDate){
    //if(id && taskTitle && myDate){
      console.log('Adding: ' + taskTitle + ', ID: ' + id);
      this.myTasks.push({
        id: id,
        taskTitle: taskTitle,
        timeSpent: timeSpent,
        myDate: myDate,
        myComments: myComments
      });
    return this.myTasks;
    //}
  };

  //remove by id
  //[DEBUG]
  //is this the problem function?
  this.removeAt = function(id){

    for (var i = 0; i < this.myTasks.length; i++){
      if(this.myTasks[i].id === id){
        console.log('Removing: ' + this.myTasks[i].taskTitle + ', ID: '  + id);
        //this.myTasks.splice(this.myTasks[i], 1);
        this.myTasks.splice(i, 1)
        return this.myTasks;
      }
    }
    return this.myTasks;
  };

  //find by id, return 'taskTitle' if found!
  this.findAt = function(id){
    for (var i = 0; i < this.myTasks.length; i++){
      if(this.myTasks[i].id === id){
        //return this.myTasks[i].taskTitle;
        //return index of that id!
        return i;
      }
    }
    return this.myTasks;
  };

  //get length of dictionary
  this.size = function(){
    return this.myTasks.length;
  };

  //note: use Dictionary.myTasks to return all objects
};

var dict1 = new Dictionary();
//dictionary1.add(1, "task1", 999, 1);
//dictionary1.add(2, "task2", 999, 1);
//dictionary1.add(3, "task3", 999, 1);
//console.log(dictionary1.size())
//for above, remember brackets or it returns the function instead of the value!
//console.log(dictionary1.myTasks);


var taskListElement = document.getElementById("listSection");
var jobItems = taskListElement.getElementsByTagName("li");
jobItems[0].addEventListener('click', function(){
  jobItems[0].getElementsByTagName("input")[0].checked = true;
  jobItems[0].className = "list-group-item list-group-item-action active";

});

//jobItems[i].className = "list-group-item list-group-item-action active";
//document.getElementById('blank').addEventListener("click", (console.log('printMe')));

var taskComments = taskListElement.getElementsByTagName("textarea");

//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database('./taskDB.sqlite3');
//db.run("insert into Tasks values(2050, 'job_raw', 92)");


//get this to work if there is no id as well!
//add another input 'id' where if 'id' = 0, it assigns a new id?
var myThing;
function addItemToDatabase(inID, taskTitle, timeSpent, myDate, myComments){
  //var myThing;
  if (inID == null){
  return myThing = knex('Tasks')
  .insert({
    //do something with date later
    taskTitle: taskTitle,
    timeSpent: timeSpent,
    myDate: myDate,
    myComments: myComments
  })
  .returning('id')
  .then(function(id){
    //inIDGlobal = id;
    //console.log('id within then():  ' + id);
    //console.log('inID within then(): ' + inIDGlobal);
    return id[0];
  });

  console.log(myThing);
  //return inIDGlobal;
} else {
  return knex('Tasks')
  .returning('id')
  .then(function(){
    return inID;
  });
  //inID;
};

}

var inIDGlobal;
function addItemToHTML(inID, taskTitle, timeSpent, myDate, myComments) {
  //set the variable equal to the text box in the html bit
  //below is replaced with the 'taskTitle' function input
  //var taskItem = document.getElementById('taskItem').value;
  //if text box has something then continue

  //if id = 0 or id not found in sql database, then add it and get what id sql comes up with
  //var tmp;
  if (taskTitle != ''){

    //adds to database if inID == null. Returns wahtever inID is afterwards
    addItemToDatabase(inID, taskTitle, timeSpent, myDate, myComments).then(function(inID){
      //console.log('inID after then(): ' + inID);

      dict1.add(inID, taskTitle, timeSpent, myDate);
      var myListItem = document.createElement('li');
      var label = document.createElement('label');
      var labelText = document.createTextNode('\xa0' + taskTitle + ":" + '\xa0' );
      var labelEditBox = document.createElement('input');
      var label_1 = document.createElement('label');

      var radioEntry = document.createElement('input');
      var editButton = document.createElement('button');
      var removeButton = document.createElement('button');


      var commentTextarea = document.createElement('textarea');
      commentTextarea.class = "form-control";
      commentTextarea.rows = "1";
      //commentTextarea.background = "#ffffff";
      commentTextarea.id = "tmpText";
      commentTextarea.style.background = "#b7b7b7";
      commentTextarea.value = myComments;
      commentTextarea.placeholder = "Notes";

      var myBreak = document.createElement('br');

      labelEditBox.style.background = "#b7b7b7";
      labelEditBox.placeholder = taskTitle;
      labelEditBox.value = taskTitle;
      labelEditBox.rows = "1";


      //editButton.type = "button";
      //editButton.className = "btn btn-primary btn-sm";
      //editButton.style = "float: right";
      //editButton.innerHTML = "Edit";

      removeButton.type = "button";
      removeButton.className = "btn btn-primary btn-sm";
      removeButton.style = "float: right";
      removeButton.innerHTML = "Delete";

      radioEntry.type = "radio";
      radioEntry.name = "selectedJob";
      //radioEntry.value = taskTitle;
      //console.log(radioEntry.checked);
      label.style = "font-weight:bold"
      label.id = "taskTitle"
      label.appendChild(labelText);

      myListItem.className = "list-group-item";

      //can't assign a string to below, list item values are for the order?
      //myListItem.value = taskTitle;
      //myListItem.value = "itsastring";
      myListItem.appendChild(radioEntry);
      myListItem.appendChild(label);
      myListItem.appendChild(label_1);
      myListItem.addEventListener("click", function(){
        radioEntry.checked = true;
        myListItem.className = "list-group-item list-group-item-action active";
        //should make the other one de-activate also?
      });
      myListItem.appendChild(removeButton);
      //myListItem.appendChild(editButton);

      taskListElement.appendChild(myListItem);
      taskListElement.appendChild(commentTextarea);
      taskListElement.appendChild(myBreak);
      removeButton.addEventListener("click", function(){deleteTask(myListItem, radioEntry, inID), myBreak.remove(), commentTextarea.remove()});
      //editButton.addEventListener("click", function(){editTask(label, labelEditBox, radioEntry)});
      label.addEventListener("click", function(){editTask(label, labelEditBox, radioEntry)});
      //labelEditBox.addEventListener("blur", saveEdit(label, labelEditBox, radioEntry));
      labelEditBox.onblur = function(){

        for (i = 0; i < dict1.size(); i++){
          if (inID == dict1.myTasks[i].id){
            dict1.myTasks[i].taskTitle = this.value
          }
        }

        //radioEntry.value = this.value;
        label.innerHTML = '\xa0' + this.value + ":" + '\xa0' ;
        this.remove();
      };

      function editTask(inLabel, inLabelEditBox, inRadioEntry){

        inRadioEntry.parentNode.insertBefore(inLabelEditBox, inRadioEntry.nextSibling);
        inLabelEditBox.focus();
        inLabel.innerHTML = ":" + '\xa0' ;
      };

      function deleteTask(inListItem, inRdButton, inID){
        //console.log('inID: ' + inID);
        //need to remove from dictionary also!

        if (inRdButton.checked == true){
          console.log('radio button checked');
          defaultRdArr = jobItems[0].getElementsByTagName("input");
          defaultRdArr[0].checked = true;
        }

        inListItem.remove();
        dict1.removeAt(inID);

        knex('Tasks')
        //.where('taskTitle = taskTitle')
        .where('id', '=', inID)
        .del()
        .then()
      };
  });

  }
}

function formatDate(inDateINT, inDayINT, inMonINT, inYearINT){
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  outString = days[inDayINT] + ", " + inDateINT + " " + months[inMonINT] + ", " + inYearINT;
  return outString;
}

// function openingTime(){
//   var myDate = new Date();
//   var h = myDate.getHours();
//   var m = myDate.getMinutes();
//   var s = myDate.getSeconds();
//   h = prettyTime(h);
//   m = prettyTime(m);
//   s = prettyTime(s);
//
//   myDayOfMonth = myDate.getDate();
//   myDay = myDate.getDay();
//   myMonth = myDate.getMonth();
//   myYear = myDate.getFullYear();
//
//   dateString = formatDate(myDayOfMonth, myDay, myMonth, myYear);
//
//   document.getElementById('openingTimeID').innerHTML = h + ":" + m + ":" + s + ", " + dateString;
// }

var loggedTimeCount = 0;
//updateInterval in ms
var updateInterval = 1000;

var totHrs = 0;
var totMins = 0;
var totSecs = 0;
var totTimeString = '';

lastLoggedTime = new Date().getTime();

//layout: all tasks show on page, but hide all besides current date with toggle? not sure right now
//may have two database files?
//one for current day and one for all previous days
//when midnight ticks, move all tasks to older one and create current task for new 'current day'?

//this function should loop through each 'list-item' and update the checked one?

//currently it is adding the time to whatever is there, might be ok to leave like this?
function writeTime(inTime){

  loggedTimeCount = 0;
  //for (i = 0; i < jobItems.length; i++){
  for (i = 0; i < dict1.size()+1; i++){
    //!= 0 because 0 is for 'no task'
    if (i > 0){
      //loggedTimeCount += jobItems[i].value;
      loggedTimeCount += dict1.myTasks[i-1].timeSpent;
      var tmpLabel = jobItems[i].getElementsByTagName("label");
      //jobTimeString = formatTime(jobItems[i].value);
      jobTimeString = formatTime(dict1.myTasks[i-1].timeSpent);
      tmpLabel[1].innerHTML = jobTimeString;
    }
    rdButton = jobItems[i].getElementsByTagName("input");
    //we look through each task and update only the 'checked' one
    //today.getTime() - lastLoggedTime is to calibrate the time since last call
    //we change the className so that only the selected item shows differently
    if (rdButton[0].checked == true){
      //existing value is added to input value (the time increment amount which is the calibrated time since last 'setTimeout' call)
      //write to dictionary time here!

      if (i > 0){
        dict1.myTasks[i-1].timeSpent += inTime;
      }
      jobItems[i].className = "list-group-item list-group-item-action active";
    }
    else{
      jobItems[i].className = "list-group-item";
    }

    //below is just to display the total logged time on the page
    //totTimeString = formatTime(loggedTimeCount);
    //document.getElementById('timePassed').innerHTML = totTimeString;
  }

}

//this function updates the times (and comments?) in the database per interval
function updateDatabaseTimes(){
  //ISSUE: times do not update for new tasks!
  //[DEBUG] fix this issue!

  //loop for each object in dictionary. Is there a more efficient way?
  for (i = 0; i < dict1.size(); i++){
    //console.log('updating database');
    //console.log(i);

    //[DEBUG]
    //fix this later on when its split up into spaces, variable, :, space
    //dict1.myTasks[i].taskTitle = jobItems[i+1].getElementsByTagName("Label")[0].innerHTML;
    dict1.myTasks[i].myComments = taskComments[i].value;


    knex('Tasks')
    .where('id', '=', dict1.myTasks[i].id)
    .update({
      taskTitle: dict1.myTasks[i].taskTitle,
      timeSpent: dict1.myTasks[i].timeSpent,
      myComments: dict1.myTasks[i].myComments
    })
    .then()
    //don't forget .then() so it runs!
  }

  //300000 for 5 minutes, 1200000 for 20 minutes?
  dbUpdateInterval = 500;
  var t = setTimeout(updateDatabaseTimes, dbUpdateInterval);
  //console.log('database updated');

}


//this function should count the time (tickTime) and call writeTime?
function tickTime() {
  //note that this will get the time when you call it
  //today will be a statis object?
    var today = new Date();
    var h = prettyTime(today.getHours());
    var m = prettyTime(today.getMinutes());
    var s = prettyTime(today.getSeconds());

    myDayOfMonth = today.getDate();
    myDay = today.getDay();
    myMonth = today.getMonth();
    myYear = today.getFullYear();

    dateString = formatDate(myDayOfMonth, myDay, myMonth, myYear);
    document.getElementById('currentTime').innerHTML = h + ":" + m + ":" + s + ", " + dateString;
    //above is fine to stay here

    //writeTime(job)
    //var selectedJob = document.querySelector('input[name = "selectedJob"]:checked').value;

    timeCalibrated = today.getTime() - lastLoggedTime;
    writeTime(timeCalibrated);
    sendGETRequest();


        lastLoggedTime = today.getTime();
        //setTimeout attempts to call this function every 'updatedInterval' Milliseconds
        //however, this fluctuates so it must be calibrated
        var t = setTimeout(tickTime, updateInterval);
}

function prettyTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

// function prettyMillisecondTime(i){
//   if (i < 10) {i = "00" + i}
//   else if (i < 100) {i = "0" + i};
//   return i;
// }

function formatTime(inMilliseconds){
  var outHours = 0;
  var outMinutes = 0;
  var outSeconds = 0;
  var outMilliseconds = 0;
  var outString = '';

  outHours = prettyTime(Math.floor(inMilliseconds / 3600000));
  outMinutes = prettyTime(Math.floor((inMilliseconds - (outHours * 3600000)) / 60000));
  outSeconds = prettyTime(Math.floor((inMilliseconds - ((outHours * 3600000) + (outMinutes * 60000)))/1000));
  //outMilliseconds = prettyMillisecondTime(inMilliseconds - ((outHours * 3600000) + (outMinutes * 60000) + (outSeconds*1000)));
  //;outString = outHours + " hrs, " + outMinutes + " m, " + outSeconds + " s, " + outMilliseconds + " ms";
  outString = outHours + " hrs, " + outMinutes + " m, " + outSeconds + " s";

  return outString;
}
