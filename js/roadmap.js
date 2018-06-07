function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

function getDateString(w, y) {
  d = getDateOfISOWeek(w, y);
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // var datestring = days[d.getDay()].substring(0,3) + " (" + 
  var datestring = ("0" + d.getDate()).slice(-2) + "-" + 
                   ("0"+(d.getMonth()+1)).slice(-2) + "-" + 
                   d.getFullYear();
  return datestring;
}

function createTable(tableData, year) {
  // var table = document.createElement('table');
  // var tableBody = document.createElement('tbody');

  // tableData.forEach(function(rowData) {
  //   var row = document.createElement('tr');

  //   rowData.forEach(function(cellData) {
  //     var cell = document.createElement('td');
  //     cell.appendChild(document.createTextNode(cellData));
  //     row.appendChild(cell);
  //   });

  //   tableBody.appendChild(row);
  // });

  // table.appendChild(tableBody);
  // return table;

  // --------------
  // Fills all gaps
  // --------------
  for(var x = 0; x < tableData[0].length; x++) {
    var space = 0;
    var defaultWidth = 1;
    if(tableData[0][x] instanceof Array && tableData[0][x].length > 2) {
      defaultWidth = tableData[0][x][2];
    }
    for(var y = 0; y < tableData.length; y = y) {
      // Figures out how far down to move each step
      var toMove = 1;
      if(tableData[y][x] == null) {
        toMove = 1;
      } else {
        var cell = tableData[y][x];
        if(cell instanceof Array && cell.length > 1) {
          toMove = cell[1];
        } else {
          toMove = 1;
        }
      }

      // Creates empty spaces in table
      if(tableData[y][x] == null &&  y < tableData.length - 1) {
        space++;
      } else if(y != 0 && space > 0) {
        // So it's hit something that isn't the first row
        // Goes up by n=space cells, and inserts a rowspanning cell
        if(y == tableData.length - 1) {
          tableData[y - space][x] = ['', space + 1, defaultWidth];
        } else {
          tableData[y - space][x] = ['', space, defaultWidth];
        }
        space = 0;
      }

      // Figures out week numbering for topic areas -> signed by colspan mismatch
      if(tableData[y][x] instanceof Array && 
         ((tableData[y][x].length < 3 && tableData[0][x].length > 1) || 
          tableData[y][x][2] < tableData[0][x][2])) {
        if(tableData[y][x] instanceof Array) {
          var wksToGen = tableData[y][x][1];
        } else {
          var wksToGen = 1;
        }
        for(var i = 0; i < wksToGen; i++) {
          tableData[y+i][x+1] = String(i + 1);
        }
      }

      y += toMove;
    }
  }

  // -------------
  // Generates DOM
  // -------------
  let result = ["<table class='highlight'>"];
  // for(let row of tableData) {
  for(let y = 0; y < tableData.length; y++) {
    var row = tableData[y];
    result.push("<tr>");
    // for(let cell of row) {
    for(let x = 0; x < row.length; x++) {
      var cell = row[x];
      if(cell == null) continue;

      let tooltipped = `class="tooltipped"
                        data-position="bottom"
                        data-tooltip="${getDateString(Number(y), year)}"`;
      if(y == 0) {
        tooltipped = "";
      } else if(cell instanceof Array) {
        tooltipped = tooltipped.slice(0, -1) + ` → ${getDateString(Number(y)+cell[1], year)}"`
      }
      if(cell instanceof Array) {
        if(cell.lenfth == 0) {
          var content = '', height = 1, width = 1;          
        } else if(cell.length == 1) {
          var content = cell[0], height = 1, width = 1;
        } else if(cell.length == 2) {
          var content = cell[0], height = cell[1], width = 1;
        } else {
          var content = cell[0], height = cell[1], width = cell[2];          
        }

        result.push(`<td ` + tooltipped +
                        `rowspan=${height}
                         colspan=${width}>
                         ${content}
                     </td>`);
      } else {
        result.push(`<td ` + tooltipped + `>${cell}</td>`);
      }
    }
    result.push("</tr>");
  }
  result.push("</table>");
  return result.join('\n');
}

function initRoadmap() {
  // var cal_headers = ["Cal W"];
  // for(var i = 0; i < 52; ++i) {
  //   cal_headers.push(String(i));
  // }

  // Sets up matrix
  var cal_data = [];
  for(var i = 0; i <= 52; i++) {
    cal_data.push([]);
  }

  // Sets up 'Cal W' column
  cal_data[0][0] = 'Cal W';
  for(var i = 1; i <= 52; i++) {
    cal_data[i][0] = String(i);
  }

  // Sets up 'Y1 W' column
  cal_data[0][1] = 'Y1 W';
  for(var i = 1, j = 1, space = 0; i <= 52; i++) {
    if((i >= 9 && i <= 15) || 
       (i >= 17 && i <= 24) ||
       (i >= 29 && i <= 37) ||
       (i >= 39 && i <= 43) ) {
      cal_data[i][1] = String(j);
      j++;
      space = 0;
    } else {
      space += 1;
      // cal_data[i][1] = 's' + String(space);
    }

    if(i == 8 || i == 16 || i == 28 || i == 38 || i == 52) {
      // cal_data[i - space + 1][1] = ['', space, 1];
    }
  }

  // Sets up 'Year 1' column
  cal_data[0][2] = ['Year 1', 1, 2];
  cal_data[6][2] = ['Second Round Offers', 1, 2];
  cal_data[9][2] = ['Introduction to Medicine', 5, 1];
  cal_data[14][2] = ['Circulation & Respiration', 10, 1];


  // ---------
  // IMPORTANT
  // ---------
  // Figure out how to display VACATION properly, so splitting of periods of 
  // study with week numbering continuing afterwards




  // console.log(cal_data);

  // $('#roadmap').append('<thead></thead>');
  // $('#roadmap').append('<tbody></tbody>');

  // var head = $('#roadmap').children()[0];
  // var body = $('#roadmap').children()[1];

  // for(var y = 0; y < cal_data.length; y++) {
  //   head.append('<tr></tr>');
  //   body.append('<tr></tr>');
  //   var head_row = head.children()[y];
  //   var body_row = body.children()[y];
  //   for(var x = 0; x < cal_data[y].length; x++) {
  //     head_row.append('<th>hey</th>');
  //   }
  // }
  var table = createTable(cal_data, 2018);
  $('#tab1').append(table); 
}

$(document).ready(function(){
  $('.fixed-action-btn').floatingActionButton();
  $('.materialboxed').materialbox();
  initRoadmap();
});
