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
  let result = ["<table class='calendar-table'>"];
  // for(let row of tableData) {
  for(let y = 0; y < tableData.length; y++) {
    var row = tableData[y];
    result.push("<tr>");

    var el = 'td';
    if(y == 0) el = 'th';

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
        // tooltipped = tooltipped.slice(0, -1) + ` <i class='material-icons center-align'>arrow_forwards</i> ${getDateString(Number(y)+cell[1], year)}"`
        tooltipped = tooltipped.slice(0, -1) + ` → ${getDateString(Number(y)+cell[1], year)}"`
        // tooltipped = tooltipped.slice(0, -1) + ` ▶ ${getDateString(Number(y)+cell[1], year)}"`
      }
      if(cell instanceof Array) {
        if(cell.length == 0) {
          var content = '<span>' + '' + '</span>', height = 1, width = 1;          
        } else if(cell.length == 1) {
          var content = '<span>' + cell[0] + '</span>', height = 1, width = 1;
        } else if(cell.length == 2) {
          var content = '<span>' + cell[0] + '</span>', height = cell[1], width = 1;
        } else {
          var content = '<span>' + cell[0] + '</span>', height = cell[1], width = cell[2];          
        }

        var style = '';
        if(cell.length >= 4 && cell[3] == true) {
          // content = '<div class="card" style="height:100%; width:100%; background-color:#abc; position:relative;">' + content + "</div>";
          // style = ' style="padding:0;" ';

          style = ' class="tooltipped event z-depth-1" style="" ';
        }
        if(cell.length >= 5 && cell[4]) {
          style = ' class="tooltipped event z-depth-1 ' + cell[4] + ' " style="" ';
        }

        if(cell.length >= 5 && cell[4].includes('darken')) {
          style = style.slice(0, -2) + 'color: rgba(255, 255, 255, 0.9)" ';
        }

        result.push(`<${el} ` + style + tooltipped +
                        `rowspan=${height}
                         colspan=${width}>
                         ${content}
                     </${el}>`);
      } else {
        result.push(`<${el} ` + tooltipped + `>${cell}</${el}>`);
      }
    }
    result.push("</tr>");
  }
  result.push("</table>");
  return result.join('\n');
}

function getWeeks(year) {
  // Sets up matrix
  var wk_data = [];
  for(var i = 0; i <= 52; i++) {
    wk_data.push([]);
  }

  // Sets up 'Cal W' column
  wk_data[0][0] = 'Cal W';
  for(var i = 1; i <= 52; i++) {
    wk_data[i][0] = String(i);
  }

  if(year == 1) {
    // Sets up 'Y1 W' column
    wk_data[0][1] = 'Y1 W';
    for(var i = 1, j = 1; i <= 52; i++) {
      if((i >= 9 && i <= 15) || 
         (i >= 17 && i <= 24) ||
         (i >= 29 && i <= 37) ||
         (i >= 39 && i <= 43) ) {
        wk_data[i][1] = String(j);
        j++;
      } 
    }
  } else if(year == 2) {
    wk_data[0][1] = 'Y2 W';
    for(var i = 0; i < 9; i++) {
      wk_data[8+i][1] = String(1+i);
    }
    for(var i = 0; i < 7; i++) {
      wk_data[18+i][1] = String(10+i);
    }
    for(var i = 0; i < 10; i++) {
      wk_data[29+i][1] = String(17+i);
    }
    for(var i = 0; i < 5; i++) {
      wk_data[40+i][1] = String(27+i);
    }

  }

  return wk_data;
}

function initRoadmap() {
  // var cal_headers = ["Cal W"];
  // for(var i = 0; i < 52; ++i) {
  //   cal_headers.push(String(i));
  // }

  // Sets up side column
  var wk_data = getWeeks(1);

  // Sets up 'Year 1' column
  var y1_data = [];
  for(var i = 0; i <= 52; i++) {
    y1_data.push([]);
  }
  y1_data[0][0] = ['Year 1', 1, 2];
  y1_data[6][0] = ['Second Round Offers', 1, 2, true, "green darken-1"];
  y1_data[9][0] = ['Introduction to Medicine', 5, 1, true, "deep-orange lighten-3"];
  y1_data[14][0] = ['Circulation & Respiration', 10, 1, true, "teal lighten-4"];


  // Sets up 'Year 2' column
  var y2_data = [];
  for(var i = 0; i <= 52; i++) {
    y2_data.push([]);
  }
  y2_data[0][0] = ['Year 2', 1, 2];
  y2_data[8][0] = ['Defence & Repair', 7, 1, true, "light-blue darken-1"];
  y2_data[15][0] = ['Movement & Sensation', 9, 1, true, "blue-grey lighten-2"];
  y2_data[29][0] = ['Reproduction & Growth', 6, 1, true, "cyan darken-2"];


  // ---------
  // IMPORTANT
  // ---------
  // Figure out how to display VACATION properly, so splitting of periods of 
  // study with week numbering continuing afterwards



  var wk_table = createTable(wk_data, 2018);
  $('#weeks').append(wk_table); 

  var y1_table = createTable(y1_data, 2018);
  $('#tab1').append(y1_table); 

  var y2_table = createTable(y2_data, 2019);
  $('#tab2').append(y2_table); 

}

function resizeTable() {
  // var wk_rows = $('#weeks').children().eq(0).children();
  // var data_rows = $('#tab1').children().eq(0).children();
  // // data_rows = $('#tab2').children()[0].children();
  // // data_rows = $('#tab3').children()[0].children();
  // // data_rows = $('#tab4').children()[0].children();
  // // data_rows = $('#tab5').children()[0].children();
  // for(var i = 0; i < data_rows.length; i++) {
  //   data_rows[i].css('height', wk_rows[i].css('height'));
  // }

  // // Generic version of algo
  // $("table:first tr").each(function(i) {
  //   $("table:last tr").eq(i).height($(this).height());
  // });

  // Resizes ALL tables based on first table
  var tables = $(".calendar-table");
  $("#weeks tr").each(function(i) {
    var curr_tr = $(this);
    var curr_i = i;
    tables.each(function(i) {
      $(this).find("tr").eq(curr_i).height(curr_tr.height());
    });
  });
}

function updateWeeks(year) {
  // var to_rebuild = $(".calendar-table").get(0);

  $('#weeks').empty();
  var wk_table = createTable(getWeeks(year), 2018+(year-1));
  $('#weeks').append(wk_table); 
  $('.tooltipped').tooltip({html: true});
}

$(document).ready(function(){
  $('.fixed-action-btn').floatingActionButton();
  $('.materialboxed').materialbox();
  initRoadmap();
  resizeTable();
});

$(window).resize(function() {
  resizeTable();
});

document.addEventListener("tab-changed", function(e) {
  var curr_tab = Number(String(e.detail).split(' ')[1]);
  updateWeeks(curr_tab);
});
