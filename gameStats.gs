var TEAM_1_INJURY_ROW = 2;
var TEAM_1_INJURY_COL = 1;
var TEAM_2_INJURY_ROW = 2;
var TEAM_2_INJURY_COL = 13;
var TEAM_STAT_COLS = 12;
var MAX_ROWS = 16;
var INJURY_COLS = 5;
var TEAM_1_ID_CELL = 'A15';
var TEAM_2_ID_CELL = 'M15';
var TEAM_1_NAME_CELL = 'A13';
var TEAM_2_NAME_CELL = 'M13';
var TEAM_1_TABLE_START_ROW = 18;
var TEAM_1_TABLE_START_COL = 1;
var TEAM_2_TABLE_START_ROW = 18;
var TEAM_2_TABLE_START_COL = 13;
var TEAM_1_SOS_CELL = 'E13';
var TEAM_2_SOS_CELL = 'Q13';
var TEAM_1_PA_START_ROW = 13; // PA is points allowed
var TEAM_1_PA_START_COL = 6;
var TEAM_2_PA_START_ROW = 13;
var TEAM_2_PA_START_COL = 18;
  
function processGame(){
  var gameToProcess = SpreadsheetApp.getActiveSheet().getRange('S7').getValue();

  var team1Id = SpreadsheetApp.getActiveSheet().getRange(gameToProcess, 27).getValue();
  var team2Id = SpreadsheetApp.getActiveSheet().getRange(gameToProcess, 29).getValue();
  SpreadsheetApp.getActiveSheet().getRange(TEAM_1_ID_CELL).setValue(team1Id);
  SpreadsheetApp.getActiveSheet().getRange(TEAM_2_ID_CELL).setValue(team2Id);
  
  SpreadsheetApp.getActiveSheet().getRange(TEAM_1_NAME_CELL).setValue(removeLast(SpreadsheetApp.getActiveSheet().getRange(gameToProcess, 26).getValue()));
  SpreadsheetApp.getActiveSheet().getRange(TEAM_2_NAME_CELL).setValue(removeLast(SpreadsheetApp.getActiveSheet().getRange(gameToProcess, 28).getValue()));
  getStatsTeam1(SpreadsheetApp.getActiveSheet().getRange(TEAM_1_NAME_CELL).getValue());
  getStatsTeam2(SpreadsheetApp.getActiveSheet().getRange(TEAM_2_NAME_CELL).getValue());
}

function removeLast(array) {
  var split = array.split(' ');
  split.pop();
  split = split.join(' ');
  return split;
}

function getStatsTeam1(teamName){
  clearInjuriesTeam1();
  getStatsForTeamId(
    getTeamId(TEAM_1_ID_CELL),
    'A19:L35',
    TEAM_1_TABLE_START_ROW,
    TEAM_1_TABLE_START_COL,
    TEAM_1_PA_START_ROW,
    TEAM_1_PA_START_COL,
    TEAM_1_INJURY_ROW,
    TEAM_1_INJURY_COL,
    teamName
  );
}

function getStatsTeam2(teamName){
  clearInjuriesTeam2();
  getStatsForTeamId(
    getTeamId(TEAM_2_ID_CELL),
    'M19:X35',
    TEAM_2_TABLE_START_ROW,
    TEAM_2_TABLE_START_COL,
    TEAM_2_PA_START_ROW,
    TEAM_2_PA_START_COL,
    TEAM_2_INJURY_ROW,
    TEAM_2_INJURY_COL,
    teamName
  );
}

function getStatsForTeamId(teamId, range, tableStartRow, tableStartCol, paStartRow, paStartCol, injuryRow, injuryCol, teamName){ // god this param list is ridic :3
  SpreadsheetApp.getActive().getSheetByName('team stats').getRange(range).clearContent();
  writeGameStatsToSheet(teamId, tableStartRow, tableStartCol);
  try {
    var paAndPpg = getPPGandPAForTeamId(teamId);
    SpreadsheetApp.getActiveSheet().getRange(paStartRow,paStartCol,1,2).setValues(paAndPpg);
  } catch (e) {
    var errorBummer = [];
    errorBummer[0] = ['ERROR','ERROR'];
    SpreadsheetApp.getActiveSheet().getRange(paStartRow,paStartCol,1,2).setValues(errorBummer);
  }
  printInjuriesForTeamName(teamName, injuryRow, injuryCol);
}

function getTeamId(teamIdCell){
  var teamId = SpreadsheetApp.getActive().getRange(teamIdCell).getValue();
  if(typeof teamId === 'number') {
    return teamId;
  } else {
    return 199;
  }
}

function writeGameStatsToSheet(input, row, col){
  var gameStats = getGameStatsForTeamId(input);
  SpreadsheetApp.getActiveSheet().getRange(row, col, gameStats.length, TEAM_STAT_COLS).setValues(gameStats);
}

function getGameStatsForTeamId(input){
  if(input == null) input = 1; // useful for debugging
  var url = 'http://www.espn.com/mens-college-basketball/team/stats/_/id/' + input;
  var root = getSitesRootElement(url);
  var gameStatsTable = getElementsByClassName(root, 'tablehead')[0];
  var gameStatsRows = getElementsByTagName(gameStatsTable, 'tr');
  var gameStats = [];
  for(var i = 0; i < gameStatsRows.length; i++){
    if((i < MAX_ROWS) || ( i >= MAX_ROWS && i == gameStatsRows.length-1)) {
      var gameStatsCols = getElementsByTagName(gameStatsRows[i], 'td');
      if(i < MAX_ROWS) gameStats[i] = [];
      else if(i >= MAX_ROWS && (i == gameStatsRows.length-1)) gameStats[gameStats.length] = [];
      for(var j = 0; j < TEAM_STAT_COLS; j++){
        var gameStat;
        try {
          gameStat = gameStatsCols[j].getValue();
        } catch (e) {
          gameStat = '';
        }
        if(i < MAX_ROWS) {
          gameStats[i].push(gameStat);
        }
        else if(i >= MAX_ROWS && (i == gameStatsRows.length-1)){
          gameStats[gameStats.length-1].push(gameStat);
        }
      }
    }
  }
  gameStats.splice(0,1); // removing the title row, 'Game Statistics'
  //gameStats.splice(0,1); // removing the header row, name of stat shown
  print(gameStats);
  return gameStats;
}

function getPPGandPAForTeamId(teamId){
  if(teamId == null) teamId = 25;
  var url = 'http://www.espn.com/mens-college-basketball/team/_/id/' + teamId;
  var root = getSitesRootElement(url);
  var gridContent = getElementsByClassName(root, 'sub-module rankings')[0];
  var stats = [];
  stats[0] = []; // .setValues requires a 2D array
  
  var numberPattern = /\d+/g;
  
  if(gridContent == undefined) {
    print('page layout is unusual and probably doesn\'t have team statistics');
    stats[0].push('N/A');
    stats[0].push('N/A');
  } else {
    var spans = getElementsByTagName(gridContent, 'span');
    for(var i = 0; i < spans.length; i++){
      var ele = spans[i].getValue();
      if(ele == 'Points Per Game'){
        var elePlus2 = spans[i+2].getValue();
        stats[0][1] = elePlus2.match(numberPattern)[0];
        i++; // saves an unneccessary iteration(and if-checks) since +2 is the value we've just used
        i++;
      } else if(ele == 'Points Allowed'){
        var elePlus2 = spans[i+2].getValue();
        stats[0][0] = elePlus2.match(numberPattern)[0];
        i++;
        i++;
      }
    }
  }
  print(stats);
  return stats;
}

function clearInjuriesTeam1(){
  SpreadsheetApp.getActive().getSheetByName('team stats').getRange('A2:E8').clearContent();
}

function clearInjuriesTeam2(){
  SpreadsheetApp.getActive().getSheetByName('team stats').getRange('M2:Q8').clearContent();
}

function printInjuriesForTeamName(teamName, row, col){
  try {
    var outputArray = getInjuries(teamName);
    print(outputArray);
    SpreadsheetApp.getActiveSheet().getRange(row, col, outputArray.length, INJURY_COLS).setValues(outputArray);
  } catch(e) {
    print(e);
    var outputArray = [];
    outputArray[0] = [];
    outputArray[0][0] = 'No injuries reported or team name not found... Ex: \'Utah U\' on donbest and \'Utah\' on ESPN';
    outputArray[1] = [];
    outputArray[1][0] = 'Try visiting http://www.donbest.com/ncaab/injuries/ and Ctrl+F to ensure the team isn\'t there';
    SpreadsheetApp.getActiveSheet().getRange(row, col, 2, 1).setValues(outputArray);
  }
}
