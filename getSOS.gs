// example url - http://www.espn.com/mens-college-basketball/rpi/_/page/1/sort/sos
// aka ESPN_RPI_URL + ESPN_PAGE_NUM + ESPN_SORT_BY_SOS
var SOS_COLS = 17;
var ESPN_RPI_URL = 'http://www.espn.com/mens-college-basketball/rpi';
var ESPN_SEPARATOR = '/_';
var ESPN_PAGE_NUM = '/page/%';
var ESPN_SORT_BY_SOS = '/sort/sos'
var NUM_OF_PAGES = 8;

function getSOS() {
  SpreadsheetApp.getActive().getSheetByName('SOS').getRange('A1:Z300').clearContent();
  var urlFirst = ESPN_RPI_URL + ESPN_SEPARATOR + ESPN_SORT_BY_SOS;
  var root = getSitesRootElement(urlFirst);
  var rpiTable = getElementsByClassName(root, 'tablehead')[0];
  var rows = getElementsByTagName(rpiTable, 'tr');
  var teamStats = [];
  for(var i = 0; i < rows.length; i++){
    var cols = getElementsByTagName(rows[i], 'td');
    for(var j = 0; j < SOS_COLS; j++){
      if(teamStats[i] == null) teamStats[i] = [];
        try {
          teamStats[i].push(cols[j].getValue());
        } catch (e) {
          teamStats[i].push('');
        }
      }
  }
  
  for(i = 1; i < NUM_OF_PAGES; i++){
    var loopURL = (ESPN_RPI_URL + ESPN_SEPARATOR + ESPN_PAGE_NUM + ESPN_SORT_BY_SOS).replace('%',i);
    var teamStatsLength = teamStats.length;
    root = getSitesRootElement(loopURL);
    rpiTable = getElementsByClassName(root, 'tablehead')[0];
    rows = getElementsByTagName(rpiTable, 'tr');    
    for(var j = 0; j < rows.length; j++){
      var cols = getElementsByTagName(rows[j], 'td');
      var newIndex = teamStatsLength + j;
      for(var k = 0; k < SOS_COLS; k++){
        if(teamStats[newIndex] == null) teamStats[newIndex] = [];
          try {
            teamStats[newIndex].push(cols[k].getValue());
          } catch (e) {
            teamStats[newIndex].push('');
          }
        }
    }
  }
  teamStats.shift(); //remove first useless row
  SpreadsheetApp.getActiveSheet().getRange(1, 1, teamStats.length, SOS_COLS).setValues(teamStats);
}
