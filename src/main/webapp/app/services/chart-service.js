/**
 * Created by Manu on 25.01.16.
 */
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart(data));

function drawChart(data) {
    if (data && data.usages) {
        var scanned = "";
        var response = [];
        var represented = [];
        var found = false;
        var usages = data.usages;
        for (var i = 0; i < usages.length; i++) {
            if (represented.indexOf(usages[i].productType) < 0 && found == false) {//TODO: productType => label
                scanned = usages[i].productType;//TODO: productType => label
                represented.push(scanned);
                found = true;
            }
            if (found) {
                response.push(['Date', 'Usage']);
                for (var o = 0; o < usages.length; o++)
                    if (usages[o].productType == scanned)//TODO: productType => label
                        response.push([usages[o].time, usages[o].usage]);
                var options = {
                    width: $(window).width() / 2.5,
                    height: $(window).height() / 2.5,
                    title: scanned.toUpperCase(), //name of the chart
                    legend: 'none', //legend
                    hAxis: {title: 'Date', format: 'datetime', textPosition: 'none'}, //horizontal axis
                    vAxis: {minValue: 0, gridlines: {count: 5}}, //vertical axis
                    crosshair: {trigger: 'both'}, // Horizontal and vertical marker at the focused/clicked point
                    pointSize: 7, //Points size
                    dataOpacity: 0.5, // Point opacity
                    colors: ['#337ab7'] //Chart Color
                };
                var div = document.getElementById('chart_div');
                if (!document.getElementById('chart_div_' + scanned)) {
                    var newDiv = document.createElement("div");
                    newDiv.setAttribute("id", "chart_div_" + scanned);
                    newDiv.setAttribute("class", "inner");
                    div.appendChild(newDiv);
                }

                var chartData = new google.visualization.arrayToDataTable(response);
                var chart = new google.visualization.AreaChart(document.getElementById('chart_div_' + scanned));
                chart.draw(chartData, options);
                scanned = "";
                found = false;
                response = [];
            }
        }
    }
}

function drawPredictionChart(data) {
    var data = data.data;
    if (data && data.usages) {
        var scanned = "";
        var response = [];
        var represented = [];
        var found = false;
        var usages = data.usages;
        var first = true;
        for (var i = 0; i < usages.length; i++) {
            if (represented.indexOf(usages[i].label) < 0 && found == false) {
                scanned = usages[i].label;
                represented.push(scanned);
                response.push(['Date', 'Usage', 'Prediction']);
                found = true;
            }
            if (found) {
                for (var o = 0; o < usages.length; o++)
                    if (usages[o].label == scanned && usages[o].usage)
                        response.push([usages[o].time, usages[o].usage, NaN]);
                    else {
                        if (first) {
                            response.pop();
                            response.push([usages[o - 1].time, usages[o - 1].usage, usages[o - 1].usage]);
                            first = false;
                        }
                        response.push([usages[o].time, NaN, usages[o].usage]);

                    }
                var options = {
                    width: $(window).width() / 2.5,
                    height: $(window).height() / 2.5,
                    title: scanned.toUpperCase(), //name of the chart
                    legend: 'none', //legend
                    hAxis: {title: 'Date', format: 'datetime', textPosition: 'none'}, //horizontal axis
                    vAxis: {minValue: 0, gridlines: {count: 5}}, //vertical axis
                    crosshair: {trigger: 'both'}, // Horizontal and vertical marker at the focused/clicked point
                    pointSize: 7, //Points size
                    dataOpacity: 0.5, // Point opacity
                    colors: ['#337ab7', '#F8DA7E'] //Chart Color
                };
                var div = document.getElementById('chart_div');
                if (!document.getElementById('chart_div_' + scanned)) {
                    var newDiv = document.createElement("div");
                    newDiv.setAttribute("id", "chart_div_" + scanned);
                    newDiv.setAttribute("class", "inner");
                    div.appendChild(newDiv);
                }

                var chartData = new google.visualization.arrayToDataTable(response);
                var chart = new google.visualization.AreaChart(document.getElementById('chart_div_' + scanned));
                chart.draw(chartData, options);
                scanned = "";
                //found = false;
                response = [];
            }
        }
    }
}