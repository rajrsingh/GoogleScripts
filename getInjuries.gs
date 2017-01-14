function getInjuries(inputTeam) {
  if(inputTeam == undefined) inputTeam = 'Arizona';
  var url = 'http://www.donbest.com/ncaab/injuries/';
  var root = getSitesRootElement(url);
  var statsTable = getElementsByClassName(root, 'statistics_table')[0];
  var rows = getElementsByTagName(statsTable, 'tr');
  var teamIndex = findTeam(rows, inputTeam);
  var outputArray = getTeamsPlayers(rows, teamIndex);
  printArray(outputArray);
  return outputArray;
}

function findTeam(rows, inputTeam){
  for(var i = 0; i < rows.length; i++){
    var cols = getElementsByTagName(rows[i], 'td');
    for(var j = 0; j < cols.length; j++){
      var val = cols[j].getValue();
      if(val == inputTeam){
        return i+1; // skips the team name row
      }
    }
  }
  return -1; // team not found
}

function getTeamsPlayers(rows, teamIndex){
  var outputArray = [];
  var outputIndex = 0;
  // resumes going through rows with team's index
  for(var i = teamIndex; i < rows.length; i++){
    
    // look for a borderline
    var row = rows[i];
    var contents = getElementsByClassName(row, 'statistics_table_bodernone');
    if(contents[0] != null) {
      return outputArray; // found a border, can return
    }
    
    // look for a team ----- keeping this in as legacy code to grab another team if i needed
    // to, but this shouldn't be hit due to the looking for border above
    var row = rows[i];
    var contents = getElementsByClassName(row, 'statistics_table_header');
    if(contents[0] != null) { // found a new team, can return
      return outputArray;
    }
    
    // look for values
    var columns = getElementsByTagName(row, 'td');
    print('just');
    if(columns[0] == null) { // didn't find data let's skipperoo!
      print('stoppin by');
      continue;
    }
    for(var j = 0; j < columns.length; j++){
      var value = columns[j].getValue();      
      if(outputArray[outputIndex] == undefined){
        print('Creating an array at ' + outputIndex);
        outputArray[outputIndex] = [];
      }
      if(value == ' ' || value == '' || value == null) {
        print('bitch and moan');
      }
      print('Adding something :O ~~~' + value + '~~~');
      outputArray[outputIndex][j] = value;
    }
    outputIndex++;
  }
  return outputArray;
}
