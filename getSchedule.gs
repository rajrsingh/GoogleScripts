function getSchedule(){
  SpreadsheetApp.getActive().getSheetByName('team stats').getRange('Z2:AC50').clearContent();
  //var url = 'http://espn.go.com/mens-college-basketball/schedule'
  var url = 'http://www.espn.com/mens-college-basketball/schedule/_/date/20170114/group/50';
  var root = getSitesRootElement(url);
  var scheduleTable = getElementsByClassName(root, 'schedule')[0];
  var rows = getElementsByTagName(scheduleTable, 'tr');
  var matchups = [];
  for(var i = 0; i < rows.length; i++){
    var cols = getElementsByTagName(rows[i], 'td');
    for(var j = 0; j < 2; j++){
      if(matchups[i] == null) matchups[i] = [];
      var team;
      var teamId;
      try {
        team = removeRankInTeamName(cols[j].getValue());
        teamId = getTeamIdFromLink(getElementsByTagName(cols[j], 'a')[0]);
      } catch (e) {
        teamId = '';
      }
      matchups[i].push(team);
      matchups[i].push(teamId);
    }
  }
  matchups.splice(0,1); // removing header row
  SpreadsheetApp.getActiveSheet().getRange(2, 26, matchups.length, 4).setValues(matchups);
}

function removeRankInTeamName(teamName){
  if(teamName.charAt(0) == '#'){
    var pat = /#[0-9]* /g; // looks for #123 of '#123 Duke'
    var toRemove = teamName.match(pat)[0];
    teamName = teamName.replace(toRemove,'');
  }
  return teamName;
}

function getTeamIdFromLink(linkTags){
  var link = linkTags.getAttribute('href').getValue();
  teamId = link.split("/")[5];
  return teamId;
}
