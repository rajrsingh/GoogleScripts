// Document: https://developers.google.com/apps-script/reference/xml-service/document
// Element: https://developers.google.com/apps-script/reference/xml-service/element

function getSitesRootElement(url) {
  var page = UrlFetchApp.fetch(url);
  var doc;
  try {
    doc = Xml.parse(page, true);
  } catch (e){
    //last resort? already using Xml.parse which is deprecated because it's more lax and XmlService.parse usually never works...
    doc = XmlService.parse(page);
  }
  var body = doc.html.body.toXmlString();  
  doc = XmlService.parse(body);
  return doc.getRootElement();
}

function getElementsByClassName(element, classToFind) {  
  var data = [];
  var descendants = element.getDescendants();
  descendants.push(element);  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if(elt != null) {
      var classes = elt.getAttribute('class');
      if(classes != null) {
        classes = classes.getValue();
        if(classes == classToFind) data.push(elt);
        else {
          classes = classes.split(' ');
          for(j in classes) {
            if(classes[j] == classToFind) {
              data.push(elt);
              break;
            }
          }
        }
      }
    }
  }
  return data;
}

function getElementsByTagName(element, tagName) {  
  var data = [];
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();     
    if( elt !=null && elt.getName()== tagName) data.push(elt);      
  }
  return data;
}



//////////////////////////////////////////////////////////////////////////////////////////
// DEBUG FUNCTIONS BELOW /////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

// prints all properties and call methods of javascript obj
function printProps(debugName, obj){
  var i = 0;
  for(var prop in obj){
    try {
      print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
      try {
        print('~~~' + i + '~~~' + debugName + '[' + prop + '] = ' + obj[prop]);
      } catch (e) {
        print('~~~' + i + '~~~' + debugName + '[' + prop + '] = ' + ' DOES NOT WORK!');
      }
      print('~~~' + i + '~~~' + debugName + '[' + prop + ']() = ' + obj[prop]());
    } catch (e) {
      print('~~~' + i + '~~~' + debugName + '[' + prop + ']()' + ' DOES NOT WORK!');
    }
    i++;
  }
}

// google script way to print something
function print(item){
  Logger.log(item);
}

function printArray(arr){
  print(':::OVERALL LENGTH::: = ' + arr.length);
  for(var i = 0; i < arr.length; i++){
    print('Length: ' + arr[i].length + ' --- Array: ' + arr[i]);
  }
}
