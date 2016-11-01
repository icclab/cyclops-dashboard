/** Creates and configures the graphs coming from the graph selection.
 *
 */
$(document).ready(function () {

    var graphSelection = [[${graphSelection}]];
    var chartTypes = [[${measurementCharts}]];
    var units = [[${measurementUnits}]];
    var theme = {
        color: [
            '#26B99A', '#34495E', '#BDC3C7', '#3498DB',
            '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
        ],

        title: {
            itemGap: 8,
            textStyle: {
                fontWeight: 'normal',
                color: '#408829'
            }
        },

        dataRange: {
            color: ['#1f610a', '#97b58d']
        },

        toolbox: {
            color: ['#408829', '#408829', '#408829', '#408829']
        },

        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#408829',
                    type: 'dashed'
                },
                crossStyle: {
                    color: '#408829'
                },
                shadowStyle: {
                    color: 'rgba(200,200,200,0.3)'
                }
            }
        },

        dataZoom: {
            dataBackgroundColor: '#eee',
            fillerColor: 'rgba(64,136,41,0.2)',
            handleColor: '#408829'
        },
        grid: {
            borderWidth: 0
        },

        categoryAxis: {
            axisLine: {
                lineStyle: {
                    color: '#408829'
                }
            },
            splitLine: {
                lineStyle: {
                    color: ['#eee']
                }
            }
        },

        valueAxis: {
            axisLine: {
                lineStyle: {
                    color: '#408829'
                }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: ['#eee']
                }
            }
        },
        timeline: {
            lineStyle: {
                color: '#408829'
            },
            controlStyle: {
                normal: {color: '#408829'},
                emphasis: {color: '#408829'}
            }
        },

        k: {
            itemStyle: {
                normal: {
                    color: '#68a54a',
                    color0: '#a9cba2',
                    lineStyle: {
                        width: 1,
                        color: '#408829',
                        color0: '#86b379'
                    }
                }
            }
        },
        map: {
            itemStyle: {
                normal: {
                    areaStyle: {
                        color: '#ddd'
                    },
                    label: {
                        textStyle: {
                            color: '#c12e34'
                        }
                    }
                },
                emphasis: {
                    areaStyle: {
                        color: '#99d2dd'
                    },
                    label: {
                        textStyle: {
                            color: '#c12e34'
                        }
                    }
                }
            }
        },
        force: {
            itemStyle: {
                normal: {
                    linkStyle: {
                        strokeColor: '#408829'
                    }
                }
            }
        },
        chord: {
            padding: 4,
            itemStyle: {
                normal: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    },
                    chordStyle: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                },
                emphasis: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    },
                    chordStyle: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    }
                }
            }
        },
        gauge: {
            startAngle: 225,
            endAngle: -45,
            axisLine: {
                show: true,
                lineStyle: {
                    color: [[0.2, '#86b379'], [0.8, '#68a54a'], [1, '#408829']],
                    width: 8
                }
            },
            axisTick: {
                splitNumber: 10,
                length: 12,
                lineStyle: {
                    color: 'auto'
                }
            },
            axisLabel: {
                textStyle: {
                    color: 'auto'
                }
            },
            splitLine: {
                length: 18,
                lineStyle: {
                    color: 'auto'
                }
            },
            pointer: {
                length: '90%',
                color: 'auto'
            },
            title: {
                textStyle: {
                    color: '#333'
                }
            },
            detail: {
                textStyle: {
                    color: 'auto'
                }
            }
        },
        textStyle: {
            fontFamily: 'Arial, Verdana, sans-serif'
        }
    };


    if (graphSelection) {
        // Create a container for each Measurement depending on its chartType
        for (var i = 0; i < graphSelection.length; i++) {
            if (chartTypes[graphSelection[i]] == "number") {
                //The chartType parameter is a pie/doughnut chart
                var measurement = graphSelection[i];
                var pieData = getPieData(graphSelection[i]);
                var pieColors = getRandomColors(pieData.length);
                var pieLabels = getPieLabels(graphSelection[i]);
                var totalCharge = [[${totalCharge}]];
                var pieLegendHtml = "";
                var modalName = measurement + 'Modal';
                var histogramContainer = measurement + 'Histogram';
                for (var o = 0; o < pieLabels.length; o++) {
                    pieLegendHtml = pieLegendHtml + '<tr><td><p><i style="background-color: ' + pieColors[o] + '">&nbsp;&nbsp;&nbsp;&nbsp;</i>' + pieLabels[o] + ' </p></td></tr>'
                }
                $('#chartContainer').append('<div class="half_x_panel"> <div class="x_title"> <h2>' + measurement + '</h2> <ul class="nav navbar-right panel_toolbox"> <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a> </li> <li class="dropdown"> <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"aria-expanded="false"><i class="fa fa-wrench"></i></a> <ul class="dropdown-menu" role="menu"> <li><a href="#">Settings 1</a> </li> <li><a href="#">Settings 2</a> </li> </ul> </li> <li><a class="close-link"><i class="fa fa-close"></i></a> </li> </ul> <div class="clearfix"></div> </div> <div class="x_content" id="chartContainer"><table><tr><th><p>' + 'Total Charge: ' + totalCharge[measurement] + ' chf' + '</p></th><th><p>Consumer</p></th></tr><tr> <td><canvas id="pie' + i + '"  style="margin: 15px 10px 10px 0; width: 50%"></canvas></td><td><div class="pieUsers' + i + '"><table>' + pieLegendHtml + '</table></div></td> </tr></table><div class="x_content"><button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="right" title="Details" onclick="generateModal()"><span data-toggle="modal" data-target=".' + modalName + '"><i class="fa fa-bar-chart"></span></i></button></div></div></div> </div>');
                var modal = '<div class="modal fade ' + modalName + '" tabindex="-1" role="dialog" aria-hidden="true"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button><h4 class="modal-title" id="myModalLabel">' + measurement + ' Detail</h4></div><div class="modal-body"><div id="'+histogramContainer+'"></div></div><div class="modal-footer"><button type="button" class="btn btn-danger" data-dismiss="modal">Close</button></div></div></div></div>'
                $('#modalContainer').append(modal);

                var pieChart = document.getElementById('pie' + i);
                if (pieChart) {
                    var options = {
                        legend: false,
                        responsive: false
                    };

                    new Chart(pieChart, {
                        type: 'doughnut',
                        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
                        data: {
                            labels: pieLabels,
                            datasets: [{
                                data: pieData,
                                backgroundColor: pieColors,
                                hoverBackgroundColor: pieColors
                            }]
                        },
                        options: options
                    });
                }
                //The ChartType parameter is a line chart
                $('#'+histogramContainer+'').append('<div class="x_content" id="chartContainer"> <div id="echart_line' + i + '" style="height:350px;"></div> </div>');

                var timestamps = [[${timestamps}]];
                var legendValues = [[${legendValues}]];
                var dates = getDates(timestamps);

                // ECHART LINE CONF
                var echart = document.getElementById('echart_line' + i);
                if (echart) {
                    var echartLine = echarts.init(echart, theme);

                    echartLine.setOption({
                        title: {
                            text: "(chf)",
//                                subtext: measurement + " ("+units[measurement]+")"
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            x: 220,
                            y: 40,
                            data: legendValues
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                magicType: {
                                    show: true,
                                    title: {
                                        line: 'Line',
                                        bar: 'Bar',
                                        stack: 'Stack',
                                        tiled: 'Tiled'
                                    },
                                    type: ['line', 'bar', 'stack', 'tiled']
                                },
                                restore: {
                                    show: true,
                                    title: "Restore"
                                },
                                saveAsImage: {
                                    show: true,
                                    title: "Save Image"
                                }
                            }
                        },
                        calculable: true,
                        xAxis: [{
                            type: 'category',
                            boundaryGap: false,
                            data: dates
                        }],
                        yAxis: [{
                            type: 'value'
                        }],
                        series: getGraph(measurement)
                    });
                }

            } else if (chartTypes[graphSelection[i]] == "histogram") {
                //The ChartType parameter is a line chart
                var measurement = graphSelection[i];
                $('#chartContainer').append('<div class="x_panel"> <div class="x_title"> <h2>' + measurement + '</h2> <ul class="nav navbar-right panel_toolbox"> <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a> </li> <li class="dropdown"> <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"aria-expanded="false"><i class="fa fa-wrench"></i></a> <ul class="dropdown-menu" role="menu"> <li><a href="#">Settings 1</a> </li> <li><a href="#">Settings 2</a> </li> </ul> </li> <li><a class="close-link"><i class="fa fa-close"></i></a> </li> </ul> <div class="clearfix"></div> </div> <div class="x_content" id="chartContainer"> <div id="echart_line' + i + '" style="height:350px;"></div> </div> </div>');

                var timestamps = [[${timestamps}]];
                var legendValues = [[${legendValues}]];
                var dates = getDates(timestamps);

                // ECHART LINE CONF
                var echart = document.getElementById('echart_line' + i);
                if (echart) {
                    var echartLine = echarts.init(echart, theme);

                    echartLine.setOption({
                        title: {
                            text: "(" + units[measurement] + ")",
//                                subtext: measurement + " ("+units[measurement]+")"
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            x: 220,
                            y: 40,
                            data: legendValues
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                magicType: {
                                    show: true,
                                    title: {
                                        line: 'Line',
                                        bar: 'Bar',
                                        stack: 'Stack',
                                        tiled: 'Tiled'
                                    },
                                    type: ['line', 'bar', 'stack', 'tiled']
                                },
                                restore: {
                                    show: true,
                                    title: "Restore"
                                },
                                saveAsImage: {
                                    show: true,
                                    title: "Save Image"
                                }
                            }
                        },
                        calculable: true,
                        xAxis: [{
                            type: 'category',
                            boundaryGap: false,
                            data: dates
                        }],
                        yAxis: [{
                            type: 'value'
                        }],
                        series: getGraph(measurement)
                    });
                }
            }
        }
    }
});

function generateModal() {
    var modal = '<div class="modal fade bs-example-modal-lg-x" tabindex="-1" role="dialog" aria-hidden="true"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button><h4 class="modal-title" id="myModalLabel">Modal title</h4></div><div class="modal-body"><div id="histogramContainer"></div></div><div class="modal-footer"><button type="button" class="btn btn-danger" data-dismiss="modal">Close</button></div></div></div></div>'
    if ($('#modalContainer').is(':empty')) {
        $('#modalContainer').append(modal)
    }
}

function getPieLabels(measurementName) {
    var metadataList = Object.keys(pairs[measurementName]);
    return metadataList;
}

function getPieData(measurementName) {
    var slices = [];
    var metadataList = Object.keys(pairs[measurementName]);
    for (var o = 0; o < metadataList.length; o++) {
        var meterData = pairs[measurementName];
        var dataArray = meterData[metadataList[o]];
        var data = 0;
        for (var x = 0; x < dataArray.length; x++) {
            data = data + dataArray[x];
        }
        slices[o] = data;
    }
    return slices;
}

/**
 * This function generates an array of a parameter-specified length of random generated HEX Colors.
 *
 */
function getRandomColors(length) {
    var colors = [];
    for (var i = 0; i < length; i++) {
        colors[i] = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    return colors;
}


/**
 * This Method returns the formatted dates for a specified timestamp
 */
function getDates(timestamps) {
    var dates = [];
    for (var i = 0; i < timestamps.length; i++) {
        dates[i] = new Date(timestamps[i] * 1000);
    }
    return dates;
}

/**
 * This Method Returns an Individual Graph for a Specified Measurement
 *
 * @param measurementName
 * @returns {{name: *, type: string, smooth: boolean, itemStyle: {normal: {areaStyle: {type: string}}}, data: *}|*}
 */
function getGraph(measurementName) {
    var graphs = [];

    var pairs2 = pairs;
    var metadataList = Object.keys(pairs[measurementName]);
    //Create one data for each metadata in the list
    for (var o = 0; o < metadataList.length; o++) {
        var meterData = pairs2[measurementName];
        var data = meterData[metadataList[o]];
        if (data[o] == null)
            data[o] = undefined;
        graphs[o] = {
            name: metadataList[o],
            type: 'bar',
            smooth: true,
            itemStyle: {
                normal: {
                    areaStyle: {
                        type: 'default'
                    }
                }
            },
            data: data
        }
    }
    return graphs;
}

/**
 * This Method Returns a Graph with all the Selected Measurements together.
 *
 * @returns {Array}
 */
function getGroupGraph() {

    var graphSelection = [[${graphSelection}]];

    var graphs = [];
    for (var i = 0; i < graphSelection.length; i++) {
        graphs[i] = {
            name: graphSelection[i],
            type: 'line',
            smooth: true,
            itemStyle: {
                normal: {
                    areaStyle: {
                        type: 'default'
                    }
                }
            },
            data: pairs[graphSelection[i]]
        }
    }
    return graphs;
}


var theme = {
    color: [
        '#26B99A', '#34495E', '#BDC3C7', '#3498DB',
        '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
    ],

    title: {
        itemGap: 8,
        textStyle: {
            fontWeight: 'normal',
            color: '#408829'
        }
    },

    dataRange: {
        color: ['#1f610a', '#97b58d']
    },

    toolbox: {
        color: ['#408829', '#408829', '#408829', '#408829']
    },

    tooltip: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        axisPointer: {
            type: 'line',
            lineStyle: {
                color: '#408829',
                type: 'dashed'
            },
            crossStyle: {
                color: '#408829'
            },
            shadowStyle: {
                color: 'rgba(200,200,200,0.3)'
            }
        }
    },

    dataZoom: {
        dataBackgroundColor: '#eee',
        fillerColor: 'rgba(64,136,41,0.2)',
        handleColor: '#408829'
    },
    grid: {
        borderWidth: 0
    },

    categoryAxis: {
        axisLine: {
            lineStyle: {
                color: '#408829'
            }
        },
        splitLine: {
            lineStyle: {
                color: ['#eee']
            }
        }
    },

    valueAxis: {
        axisLine: {
            lineStyle: {
                color: '#408829'
            }
        },
        splitArea: {
            show: true,
            areaStyle: {
                color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
            }
        },
        splitLine: {
            lineStyle: {
                color: ['#eee']
            }
        }
    },
    timeline: {
        lineStyle: {
            color: '#408829'
        },
        controlStyle: {
            normal: {color: '#408829'},
            emphasis: {color: '#408829'}
        }
    },

    k: {
        itemStyle: {
            normal: {
                color: '#68a54a',
                color0: '#a9cba2',
                lineStyle: {
                    width: 1,
                    color: '#408829',
                    color0: '#86b379'
                }
            }
        }
    },
    map: {
        itemStyle: {
            normal: {
                areaStyle: {
                    color: '#ddd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            },
            emphasis: {
                areaStyle: {
                    color: '#99d2dd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            }
        }
    },
    force: {
        itemStyle: {
            normal: {
                linkStyle: {
                    strokeColor: '#408829'
                }
            }
        }
    },
    chord: {
        padding: 4,
        itemStyle: {
            normal: {
                lineStyle: {
                    width: 1,
                    color: 'rgba(128, 128, 128, 0.5)'
                },
                chordStyle: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            },
            emphasis: {
                lineStyle: {
                    width: 1,
                    color: 'rgba(128, 128, 128, 0.5)'
                },
                chordStyle: {
                    lineStyle: {
                        width: 1,
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            }
        }
    },
    gauge: {
        startAngle: 225,
        endAngle: -45,
        axisLine: {
            show: true,
            lineStyle: {
                color: [[0.2, '#86b379'], [0.8, '#68a54a'], [1, '#408829']],
                width: 8
            }
        },
        axisTick: {
            splitNumber: 10,
            length: 12,
            lineStyle: {
                color: 'auto'
            }
        },
        axisLabel: {
            textStyle: {
                color: 'auto'
            }
        },
        splitLine: {
            length: 18,
            lineStyle: {
                color: 'auto'
            }
        },
        pointer: {
            length: '90%',
            color: 'auto'
        },
        title: {
            textStyle: {
                color: '#333'
            }
        },
        detail: {
            textStyle: {
                color: 'auto'
            }
        }
    },
    textStyle: {
        fontFamily: 'Arial, Verdana, sans-serif'
    }
};

// Variables added by Manu
var username = [[${username}]];
var legend = [[${legendValues}]];
var pairs = [[${pairs}]];
var graphSelection = [[${graphSelection}]];
var metadataTest = Object.keys(pairs[graphSelection[0]]);

// ECHART LINE CONF
var echart = document.getElementById('echart_line');
if (echart) {
    var echartLine = echarts.init(document.getElementById('echart_line'), theme);

    echartLine.setOption({
        title: {
            text: 'Line Graph',
            subtext: 'Subtitle'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            x: 220,
            y: 40,
            data: legend
        },
        toolbox: {
            show: true,
            feature: {
                magicType: {
                    show: true,
                    title: {
                        line: 'Line',
                        bar: 'Bar',
                        stack: 'Stack',
                        tiled: 'Tiled'
                    },
                    type: ['line', 'bar', 'stack', 'tiled']
                },
                restore: {
                    show: true,
                    title: "Restore"
                },
                saveAsImage: {
                    show: true,
                    title: "Save Image"
                }
            }
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }],
        yAxis: [{
            type: 'value'
        }],
        series: getGraphs()
    });
}

function getGraphs() {
    var graphs = [];
    for (var i = 0; i < graphSelection.length; i++) {
        graphs[i] = {
            name: graphSelection[i],
            type: 'line',
            smooth: true,
            itemStyle: {
                normal: {
                    areaStyle: {
                        type: 'default'
                    }
                }
            },
            data: pairs[graphSelection[i]]
        }
    }

    return graphs;
}
$(document).ready(function () {

    $('[data-toggle="tooltip"]').tooltip({'placement': 'right'});

    var cb = function (start, end, label) {
        console.log(start.toISOString(), end.toISOString(), label);
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        //Reporting date to thymeleaf by manu
        document.getElementById("from").value = start;
        document.getElementById("to").value = end;
        document.getElementById("graphButton").disabled = false;
    };

    var optionSet1 = {
        startDate: moment().subtract(29, 'days'),
        endDate: moment(),
        minDate: '01/01/2012',
        maxDate: '12/31/2016',
//            dateLimit: {
//                days: 60
//            },
        showDropdowns: true,
        showWeekNumbers: true,
        timePicker: false,
        timePickerIncrement: 1,
        timePicker12Hour: true,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        opens: 'left',
        buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary',
        cancelClass: 'btn-small',
        format: 'MM/DD/YYYY',
        separator: ' to ',
        locale: {
            applyLabel: 'Submit',
            cancelLabel: 'Clear',
            fromLabel: 'From',
            toLabel: 'To',
            customRangeLabel: 'Custom',
            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            firstDay: 1
        }
    };
    //$('#reportrange span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

    $('#reportrange').daterangepicker(optionSet1, cb);
    $('#reportrange').on('show.daterangepicker', function () {
        console.log("show event fired");
    });
    $('#reportrange').on('hide.daterangepicker', function () {
        console.log("hide event fired");
    });
    $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
        console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
    });
    $('#reportrange').on('cancel.daterangepicker', function (ev, picker) {
        console.log("cancel event fired");
    });
    $('#options1').click(function () {
        $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
    });
    $('#options2').click(function () {
        $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
    });
    $('#destroy').click(function () {
        $('#reportrange').data('daterangepicker').remove();
    });
});

// Prepare all the needed variables.
var legend = [[${legendValues}]];
var tenants = [[${tenantList}]];

//Trigger the function once the document is ready.
$(document).ready(function () {
    loadGraphSelection();
    loadTenantSelection();
});

function loadTenantSelection() {
    for (var i = 0; i < tenants.length; i++) {
        var value = tenants[i];
        if (i == 0)
            $('#tenantSelection').html('<option value="' + value + '">' + value + '</option>');
        else
            $('#tenantSelection').append('<option value="' + value + '">' + value + '</option>');
    }
}

function loadGraphSelection() {
    for (var i = 0; i < legend.length; i++) {
        var value = legend[i];
        if (legend.length / 2 >= 1) {
            var nextVal = legend[i + 1];
            if (legend[i + 1]) {
                if (i == 0) {
                    $('#graphSelection').html('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] +
                        '</p></td><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + nextVal + '">' + legend[i + 1] + '</p></td></tr>');
                    i++;
                } else
                    $('#graphSelection').append('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] +
                        '</p></td><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + nextVal + '">' + legend[i + 1] + '</p></td></tr>');
            } else {
                if (i == 0)
                    $('#graphSelection').html('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] + '</p></td></tr>');
                else
                    $('#graphSelection').append('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] + '</p></td></tr>');
            }
        } else {
            $('#graphSelection').html('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] + '</p></td></tr>');
        }
    }
}

// Prepare all the needed variables.
var legend = [[${legendValues}]];
var tenants = [[${tenantList}]];

//Trigger the function once the document is ready.
$(document).ready(function () {
    loadGraphSelection();
    loadTenantSelection();
});

function loadTenantSelection() {
    for (var i = 0; i < tenants.length; i++) {
        var value = tenants[i];
        if (i == 0)
            $('#tenantSelection').html('<option value="' + value + '">' + value + '</option>');
        else
            $('#tenantSelection').append('<option value="' + value + '">' + value + '</option>');
    }
}

function loadGraphSelection() {
    for (var i = 0; i < legend.length; i++) {
        var value = legend[i];
        if (legend.length / 2 >= 1) {
            var nextVal = legend[i + 1];
            if (legend[i + 1]) {
                if (i == 0) {
                    $('#graphSelection').html('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] +
                        '</p></td><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + nextVal + '">' + legend[i + 1] + '</p></td></tr>');
                    i++;
                } else
                    $('#graphSelection').append('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] +
                        '</p></td><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + nextVal + '">' + legend[i + 1] + '</p></td></tr>');
            } else {
                if (i == 0)
                    $('#graphSelection').html('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] + '</p></td></tr>');
                else
                    $('#graphSelection').append('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] + '</p></td></tr>');
            }
        } else {
            $('#graphSelection').html('<tr><td><p><input type="checkbox" name="graphSelection" class="flat" value="' + value + '">' + legend[i] + '</p></td></tr>');
        }
    }
}
