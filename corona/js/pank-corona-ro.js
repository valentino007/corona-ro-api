// chart variables
var coronaRoChart;
var coronaJudetChart;

var confirmedColor = 'rgba(255, 0, 0, 0.7)';
var deathsColor = 'rgba(0, 0, 0, 1)';
var recoveredColor = 'rgba(0, 255, 1, 1)';
var stillSickColor = 'rgba(255, 165, 0, 1)';
var confirmedAvgColor = 'rgba(25, 25, 215, 0.6)';

var confirmedBackGroundColor = setOpacity(confirmedColor);
var deathsBackGroundColor = setOpacity(deathsColor);
var recoveredBackGroundColor = setOpacity(recoveredColor);
var stillSickBackGroudColor = setOpacity(stillSickColor);
var confirmedAvgBackGroudColor = setOpacity(confirmedAvgColor);

// Ro evolution arrays
var roDatesArray = [];
var roLastDay;
var roConfirmedArray = [];
var roAvgConfirmedArray = [];
var roDiffConfirmedArray = [];

// Ro diff arrays
var roDiffConfirmedArray = [];

// judet evolution arrays
var judetDatesArray = [];
var judetConfirmedArray = [];
var judetConfirmedDiffArray = [];
var judetConfirmedAvgArray = [];
var judetIncidenceArray = [];

// judete
var judet_confirmed = 0;
var judet_incidence = 0;
var judet_confirmed_diff = 0;

var screenWidthMessage = 450;
var screenWidthResizeDiv = 680;

// backward days for average
var backDaysAvg = 14;

function setOpacity(rgba) {
	var opacity = 0.1;
	return rgba.substr(0, rgba.lastIndexOf(",") + 1) + " " + opacity + ")";
}

$(document).ready(function () {

	$(function () {
		$("input").checkboxradio({
			icon: false
		});
		$(document).tooltip();
	});

	if (typeof $("#header") != 'undefined') {
		$("#header").load("header.html");
	}
	if (typeof $("#footer") != 'undefined') {
		$("#footer").load("footer.html");
	}

	$.when(getRoEvolutionAjaxCall()).done(function () {
		fillRoInfo();
		renderGraphRoEvolution();
		buildRoSlider();
	});

	if ($('#judet') != 'undefined') {

		dropdown = $('#judet');

		dropdown.empty();
		dropdown.append('<option selected="true" value="null" disabled>Alege jude\u021B</option>'); // default disabled option
		dropdown.prop('selectedIndex', 0);

		$.getJSON('../../api/json/ro_judete.json', function (return_data) {
			$.each(return_data.response, function (key, value) {
				dropdown.append($('<option></option>').attr('value', value.judet).text(value.judet_nume));
			})
		});

		$("#judet").selectmenu().addClass("overflow");

		$("#judet").on("selectmenuchange", function () {
			// get data & render graph
			fillGraphJudet($('#judet option:selected').val());
		});

	}

	if (window.screen.width <= screenWidthResizeDiv) {

		$("#global-evolution").addClass("widget-table-cell-small");
		$("#global-evolution").removeClass("widget-table-cell");

		$("#global-selectmenu-category").removeClass("widget-table-cell");
		$("#global-selectmenu-category").addClass("widget-table-cell-small");

		$("#global-selectmenu-limit").removeClass("widget-table-cell");
		$("#global-selectmenu-limit").addClass("widget-table-cell-small");

		$("#country-selectmenu").removeClass("widget-table-cell");
		$("#country-selectmenu").addClass("widget-table-cell-small");

		$("#country-selectmenu-radio").removeClass("widget-table-cell");
		$("#country-selectmenu-radio").addClass("widget-table-cell-small");

		$("#country-selectmenu-category").removeClass("widget-table-cell");
		$("#country-selectmenu-category").addClass("widget-table-cell-small");

		$("#global_info").removeClass("info-table");
		$("#global_info").addClass("info-table-small");

		$("#graph-container-global").removeClass("graph-container");
		$("#graph-container-global").addClass("graph-container-small");

		$("#graph-container-country").removeClass("graph-container");
		$("#graph-container-country").addClass("graph-container-small");

		$("#country_info").removeClass("info-table");
		$("#country_info").addClass("info-table-small");

		if (window.screen.width <= screenWidthMessage) {
			alert("To have a better view of the graphics, tilt the phone on landscape view and reload the page or watch the graphics on a tablet or pc");
		}
	}

});

function buildRoSlider() {
	$("#romania-slider-range").slider({
		range: true,
		min: 0,
		max: (roDatesArray.length - 1),
		values: [0, (roDatesArray.length - 1)],
		slide: function (event, ui) {
			renderGraphRoEvolution(ui.values[0], ui.values[1]);
		}
	});
}

function buildJudetSlider() {
	if (typeof $("#judet-slider-range").slider("instance") != "undefined") {
		$("#judet-slider-range").slider("destroy");
	}

	$("#judet-slider-range").slider({
		range: true,
		min: 0,
		max: (judetDatesArray.length - 1),
		values: [0, (judetDatesArray.length - 1)],
		slide: function (event, ui) {
			renderGraphJudetEvolution(ui.values[0], ui.values[1]);
		}
	});
}

function fillGraphJudet(judet) {
	$.when(getJudetEvolutionAjaxCall(judet)).done(function () {
		fillJudetInfo();
		renderGraphJudetEvolution();
		buildJudetSlider();
	});
}

function getChartDataRoEvolution(min, max) {

	var datesArray = [];
	var confirmedArray = [];
	var avgConfirmedArray = [];
	var diffConfirmedArray = [];

	if (typeof (min) !== 'undefined' && typeof (max) !== 'undefined') {
		for (var i = min; i <= max; i++) {
			datesArray.push(roDatesArray[i]);
			confirmedArray.push(roConfirmedArray[i]);
			avgConfirmedArray.push(roAvgConfirmedArray[i]);
			diffConfirmedArray.push(roDiffConfirmedArray[i]);
		}
	} else {
		datesArray = roDatesArray;
		confirmedArray = roConfirmedArray;
		avgConfirmedArray = roAvgConfirmedArray;
		diffConfirmedArray = roDiffConfirmedArray;
	}

	var chartDataRoCoronaCases = {
		labels: datesArray,
		datasets: [
			{
				label: 'Evolu\u021Bie',
				type: 'line',
				backgroundColor: confirmedBackGroundColor,
				borderColor: confirmedColor,
				fill: false,
				yAxisID: 'y-axis-1',
				data: confirmedArray
			},
			{
				label: 'Media la ' + backDaysAvg + ' zile',
				type: 'line',
				backgroundColor: confirmedAvgBackGroudColor,
				borderColor: confirmedAvgColor,
				fill: false,
				yAxisID: 'y-axis-2',
				data: avgConfirmedArray
			},
			{
				label: 'Cazuri zilnice',
				type: 'bar',
				backgroundColor: confirmedBackGroundColor,
				borderColor: confirmedColor,
				fill: false,
				yAxisID: 'y-axis-2',
				data: diffConfirmedArray
			},
		]
	};

	return chartDataRoCoronaCases;
}

function renderGraphRoEvolution(min, max) {

	if (typeof coronaRoChart != "undefined") {
		coronaRoChart.destroy();
	}

	var ctxCoronaRomania = $("#canvasCoronaRomania");

	var daysCount = ((typeof (max) == 'undefined') ? (roDatesArray.length - 1) : max) - 
					((typeof (min) == 'undefined') ? 0 : min) + 1;

	var roTitleText = 'Evolu\u021Bia cazurilor COVID-19 \u00EEn Rom\u0203nia \u00EEntre ' +
		((typeof (min) == 'undefined') ? roDatesArray[0] : roDatesArray[min]) + ' \u0219i ' +
		((typeof (max) == 'undefined') ? roDatesArray[roDatesArray.length - 1] : roDatesArray[max]) + " (" + daysCount + " zile)";

	coronaRoChart = new Chart(ctxCoronaRomania, {
		type: 'line',
		data: getChartDataRoEvolution(min, max),
		options: {
			legend: {
				position: 'bottom',
				labels: {
					defaultFontFamily: 'Open Sans'
				}
			},
			title: {
				display: true,
				fontSize: 16,
				fontStyle: '',
				fontFamily: "'Open Sans', sans-serif",
				text: roTitleText
			},
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					type: 'linear',
					display: true,
					position: 'left',
					id: 'y-axis-1',
					ticks: {
						fontColor: 'red'
					},
					gridLines: {
						drawOnChartArea: true
					}
				},
					{
					type: 'linear',
					display: true,
					position: 'right',
					id: 'y-axis-2',
					ticks: {
						fontColor: 'blue'
					},
					gridLines: {
						drawOnChartArea: true
					}
				}]
			}
		},
	});

}

function getRoEvolutionAjaxCall() {

	return $.ajax({
		url: "../../api/json/ro_evolution.json",

		success: function (data) {
			//console.log(data);

			roConfirmedArray = [];
			//roAvgConfirmedArray = [];
			//roDiffConfirmedArray = [];

			roFirstDay = data.response[0].formatted_date;
			roLastDay = new Date(data.response[data.response.length - 1].raw_date);

			for (var i in data.response) {
				roDatesArray.push(data.response[i].formatted_date);
				roConfirmedArray.push(data.response[i].confirmed);
				// avg
				roAvgConfirmedArray.push(data.response[i].avg_confirmed);
				//diff
				roDiffConfirmedArray.push(data.response[i].confirmed_diff);
			}

		},
		error: function (data) {
			console.log(data);
		}
	}); // end of ajax

}

function renderGraphJudetEvolution(min, max) {

	var ctxCoronaJudet = $("#canvasCoronaJudet");

	if (typeof coronaJudetChart != "undefined") {
		coronaJudetChart.destroy();
	}
	
	var daysCount = ((typeof (max) == 'undefined') ? (judetDatesArray.length - 1) : max) - 
					((typeof (min) == 'undefined') ? 0 : min) + 1;

	var judetTitleText = 'Evolu\u021Bia cazurilor COVID-19 \u00EEn jude\u021Bul ' + $("#judet option:selected").text() + " \u00EEntre " +
		((typeof (min) == 'undefined') ? judetDatesArray[0] : judetDatesArray[min]) + ' \u0219i ' +
		((typeof (max) == 'undefined') ? judetDatesArray[judetDatesArray.length - 1] : judetDatesArray[max]) + " (" + daysCount + " zile)";

	coronaJudetChart = new Chart(ctxCoronaJudet, {
		type: 'line',
		data: getChartDataJudetEvolution(min, max),
		options: {
			legend: {
				position: 'bottom',
				labels: {
					defaultFontFamily: 'Open Sans'
				}
			},
			title: {
				display: true,
				fontSize: 16,
				fontStyle: '',
				fontFamily: "'Open Sans', sans-serif",
				text: judetTitleText
			},
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					type: 'linear',
					display: true,
					position: 'left',
					id: 'y-axis-1',
					ticks: {
						fontColor: 'red'
					},
					gridLines: {
						drawOnChartArea: true
					}
				},
					{
					type: 'linear',
					display: true,
					position: 'right',
					id: 'y-axis-2',
					ticks: {
						fontColor: 'blue'
					},
					gridLines: {
						drawOnChartArea: true
					}
				}]
			}
		},
	});

}

function getChartDataJudetEvolution(min, max) {

	var datesArray = [];
	var confirmedArray = [];
	var confirmedDiffArray = [];
	var confirmedAvgArray = [];

	if (typeof (min) !== 'undefined' && typeof (max) !== 'undefined') {
		for (var i = min; i <= max; i++) {
			datesArray.push(judetDatesArray[i]);
			confirmedArray.push(judetConfirmedArray[i]);
			confirmedDiffArray.push(judetConfirmedDiffArray[i]);
			confirmedAvgArray.push(judetConfirmedAvgArray[i]);
		}
	} else {
		datesArray = judetDatesArray;
		confirmedArray = judetConfirmedArray;
		confirmedDiffArray = judetConfirmedDiffArray;
		confirmedAvgArray = judetConfirmedAvgArray;
	}

	var chartDataJudetCoronaCases = {
		labels: datesArray,
		datasets: [
			{
				label: 'Evolu\u021Bie',
				type: 'line',
				backgroundColor: confirmedBackGroundColor,
				borderColor: confirmedColor,
				fill: false,
				yAxisID: 'y-axis-1',
				data: confirmedArray
			},
			{
				label: 'Media la ' + backDaysAvg + ' zile',
				type: 'line',
				backgroundColor: confirmedAvgBackGroudColor,
				borderColor: confirmedAvgColor,
				yAxisID: 'y-axis-2',
				fill: false,
				data: confirmedAvgArray
			},
			{
				label: 'Cazuri zilnice',
				type: 'bar',
				backgroundColor: confirmedBackGroundColor,
				borderColor: confirmedColor,
				fill: false,
				yAxisID: 'y-axis-2',
				data: confirmedDiffArray
			},
		]
	};

	return chartDataJudetCoronaCases;
}

function getJudetEvolutionAjaxCall(judet) {

	return $.ajax({
		url: "../api/v1/ro/judete.php?judet=" + judet,

		success: function (data) {
			//console.log(data);
			judetDatesArray = [];
			judetConfirmedArray = [];
			judetConfirmedDiffArray = [];
			judetConfirmedAvgArray = [];
			judetIncidenceArray = [];

			for (var i in data.response) {
				judetDatesArray.push(data.response[i].formatted_date);
				judetConfirmedArray.push(data.response[i].confirmed);
				judetConfirmedDiffArray.push(data.response[i].diff_confirmed);
				judetConfirmedAvgArray.push(data.response[i].avg_confirmed);
				judetIncidenceArray.push(data.response[i].incidence);
			}

		},
		error: function (data) {
			console.log(data);
		}
	}); // end of ajax
}

function fillJudetInfo() {

	$('#judet_nume').text($("#judet option:selected").text());
	$('#judet_confirmed').text(parseInt(judetConfirmedArray[judetConfirmedArray.length - 1]).toLocaleString('ro-RO'));
	$('#judet_incidence').text(parseFloat(judetIncidenceArray[judetIncidenceArray.length - 1]).toLocaleString('ro-RO'));
	$('#judet_avg_confirmed').text(parseFloat(judetConfirmedAvgArray[judetConfirmedAvgArray.length - 1]).toLocaleString('ro-RO'));
	
	var newConfirmed = parseInt(judetConfirmedDiffArray[judetConfirmedDiffArray.length - 1]);
	var diffIncidence = parseFloat(judetIncidenceArray[judetIncidenceArray.length - 1]) - parseFloat(judetIncidenceArray[judetIncidenceArray.length - 2]);
	var diffAvg = parseFloat(judetConfirmedAvgArray[judetConfirmedAvgArray.length - 1]) - parseFloat(judetConfirmedAvgArray[judetConfirmedAvgArray.length - 2]);
	
	$('#judet_confirmed_new').text(newConfirmed > 0 ? '+' + newConfirmed.toLocaleString('ro-RO') : newConfirmed.toLocaleString('ro-RO'));
	$('#judet_incidence_diff').text(diffIncidence > 0 ? '+' + diffIncidence.toLocaleString('ro-RO') : diffIncidence.toLocaleString('ro-RO'));
	$('#judet_avg_diff').text(diffAvg > 0 ? '+' + diffAvg.toLocaleString('ro-RO') : diffAvg.toLocaleString('ro-RO'));

}

function fillRoInfo() {

	$('#ro_date').text(roLastDay.toLocaleString('en-GB', { dateStyle: 'short' }).substr(0, 10));
	$('#ro_confirmed').text(roConfirmedArray[roConfirmedArray.length - 1].toLocaleString('ro-RO'));
	$('#ro_avg_confirmed').text(roAvgConfirmedArray[roAvgConfirmedArray.length - 1].toLocaleString('ro-RO'));
	//$('#ro_avg_confirmed_th').text("Media cazurilor în ultimele " + backDaysAvg + " zile");

	var newCasesRoDiff = roDiffConfirmedArray[roDiffConfirmedArray.length - 1];
	var avgRoDiff = parseFloat(roAvgConfirmedArray[roAvgConfirmedArray.length - 1]) - parseFloat(roAvgConfirmedArray[roAvgConfirmedArray.length - 2]);

	$('#ro_confirmed_new').text(newCasesRoDiff > 0 ? '+' + newCasesRoDiff.toLocaleString('ro-RO') : newCasesRoDiff.toLocaleString('ro-RO'));
	$('#ro_avg_diff').text(avgRoDiff > 0 ? '+' + avgRoDiff.toLocaleString('ro-RO') : avgRoDiff.toLocaleString('ro-RO'));

}
