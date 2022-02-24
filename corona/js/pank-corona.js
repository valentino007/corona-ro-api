// chart variables
var coronaGlobalChart;
var coronaCountryChart;

var confirmedColor = 'rgba(255, 0, 0, 1)';
var deathsColor = 'rgba(0, 0, 0, 1)';
var recoveredColor = 'rgba(0, 255, 1, 1)';
var stillSickColor = 'rgba(255, 165, 0, 1)';
var confirmedAvgColor = 'rgba(25, 25, 215, 1)';

var confirmedBackGroundColor = setOpacity(confirmedColor);
var deathsBackGroundColor = setOpacity(deathsColor);
var recoveredBackGroundColor = setOpacity(recoveredColor);
var stillSickBackGroudColor = setOpacity(stillSickColor);
var confirmedAvgBackGroudColor = setOpacity(confirmedAvgColor);

// global evolution arrays
var globalDatesArray = [];
var lastDay;
var globalConfirmedArray = [];
var globalRecoveredArray = [];
var globalDeathsArray = [];
var globalStillSickArray = [];
var globalAvgConfirmedArray = [];
// global diff arrays
var globalDiffConfirmedArray = [];
var globalDiffRecoveredArray = [];
var globalDiffDeathsArray = [];
var globalDiffStillSickArray = [];
// global compare arrays
var globalCompareCountriesArray = [];
var globalCompareConfirmedArray = [];
var globalCompareRecoveredArray = [];
var globalCompareDeathsArray = [];
var globalCompareStillSickArray = [];

// country evolution arrays
var countryDatesArray = [];
var countryConfirmedArray = [];
var countryRecoveredArray = [];
var countryDeathsArray = [];
var countryStillSickArray = [];
// global diff arrays
var countryDiffConfirmedArray = [];
var countryDiffRecoveredArray = [];
var countryDiffDeathsArray = [];
var countryDiffStillSickArray = [];
var countryAvgConfirmedArray = [];

// country
var country_confirmed = 0;
var country_deaths = 0;
var country_recovered = 0;
var country_still_sick = 0;
var country_new_cases = 0;
var country_new_deaths = 0;
var country_new_recovered = 0;
var country_new_still_sick = 0;

var firstDayGlobal;
var lineChartDataCoronaCases;
var titleTextFirstCase;

var screenWidthMessage = 450;
var screenWidthResizeDiv = 680;

// backward days for average
var backDaysAvg = 14;

function formatDate(stringDate) {
	var myDate = new Date(stringDate);

	return ("0" + myDate.getDate()).slice(-2) +
		("0" + (myDate.getMonth() + 1)).slice(-2) +
		myDate.getFullYear();
}

function setOpacity(rgba) {
	var opacity = 0.1;
	return rgba.substr(0, rgba.lastIndexOf(",") + 1) + " " + opacity + ")";
}

$(document).ready(function() {

	$(function() {
		$("input").checkboxradio({
			icon: false
		});
	});

	if (typeof $("#header") != 'undefined') {
		$("#header").load("header.html");
	}
	if (typeof $("#footer") != 'undefined') {
		$("#footer").load("footer.html");
	}

	$.when(getGlobalEvolutionAjaxCall()).done(function() {
		fillGlobalInfo();
		renderGraphGlobalEvolution();
		buildGlobalSlider();
	});

	if ($('#country') != 'undefined') {

		dropdown = $('#country');

		dropdown.empty();
		dropdown.append('<option selected="true" value="null" disabled>Choose Country</option>'); // default disabled option
		dropdown.prop('selectedIndex', 0);

		$.getJSON('../api/json/countries.json', function(return_data) {
			$.each(return_data.response, function(key, value) {
				dropdown.append($('<option></option>').attr('value', value.iso).text(value.country));
			})
		});

		$("#country").selectmenu().addClass("overflow");

		$("#country").on("selectmenuchange", function() {
			// get data & render graph
			fillGraphCountry($('#country option:selected').val(), $("[name='radio-country']:checked").val(), $('#countryCategory option:selected').val());
		});

	}

	if ($("#globalCategory") != 'undefined' && $("#limit") != 'undefined') {

		$("#globalCategory").selectmenu({ width: 'auto' }).addClass("overflow");
		$("#limit").selectmenu({ width: 'auto' }).addClass("overflow");

		/**
		 * on globalCategory dropdown change: 
		 * if the current radio is set on 'global-daily-growth' renders the global daily difference graph (the data is already in page from the very begining)
		 * if the current radio is set on 'global-compare' reloads first the data (as json from SQL via Ajax) then renders the compare graph
		 *  */
		$("#globalCategory").on("selectmenuchange", function() {
			if ($("[name='radio-global']:checked").val() == 'global-daily-growth') {
				renderGraphGlobalDailyDiff($("#globalCategory").val(), $("#global-slider-range").slider('values', 0), $("#global-slider-range").slider('values', 1));
			} else if ($("[name='radio-global']:checked").val() == 'global-compare') {
				fillGraphGlobalCompare($("#globalCategory").val(), $("#limit").val());
			}
		});

		/**
		 * on limit dropdown change: 
		 * (the current radio is set on 'global-compare'): reloads first the data (as json from SQL via Ajax) then renders the compare graph
		 *  */
		$("#limit").on("selectmenuchange", function() {
			if ($("[name='radio-global']:checked").val() == 'global-compare') {
				fillGraphGlobalCompare($("#globalCategory").val(), $("#limit").val());
			}
		});
	}

	$("#countryCategory").selectmenu({ width: 'auto' }).addClass("overflow");
	// default disable global category & limit  
	$("#globalCategory").selectmenu("disable");
	$("#limit").selectmenu("disable");
	$("#countryCategory").selectmenu("disable");

	$("[name='radio-global']").on("change", function() {
		var global_radio_value = $("[name='radio-global']:checked").val();

		switch (global_radio_value) {
			case "global-evolution":
				// disables both dropdowns globalCategory & limit
				$("#globalCategory").selectmenu("disable");
				$("#limit").selectmenu("disable");
				// enables slider and resets range
				$("#global-slider-range").slider("enable");
				$("#global-slider-range").slider('values', 0, 0);
				$("#global-slider-range").slider('values', 1, (globalDatesArray.length - 1));
				// renders global evolution graph 
				renderGraphGlobalEvolution();
				break;
			case "global-daily-growth":
				// enables dropdown globalCategory & disables dropdown limit
				$("#globalCategory").selectmenu("enable");
				$("#limit").selectmenu("disable");
				// enables slider and resets range
				$("#global-slider-range").slider("enable");
				$("#global-slider-range").slider('values', 0, 0);
				$("#global-slider-range").slider('values', 1, (globalDatesArray.length - 1));
				// renders global daily growth graph
				renderGraphGlobalDailyDiff($("#globalCategory").val());
				break;
			case "global-compare":
				// enables both dropdowns globalCategory & limit
				$("#globalCategory").selectmenu("enable");
				$("#limit").selectmenu("enable");
				$("global-selectmenu-category").show();
				// disables slider and resets range
				$("#global-slider-range").slider("disable");
				$("#global-slider-range").slider('values', 0, 0);
				$("#global-slider-range").slider('values', 1, (globalDatesArray.length - 1));
				// renders global compare graph
				$.when(getGlobalCompareAjaxCall($("#globalCategory").val(), $("#limit").val())).done(function() {
					renderGraphGlobalCompare($("#globalCategory").val());
				});
				break;
		}

	});

	$("[name='radio-country']").on("change", function() {

		// reset country slider when changing the country radio selection
		if ($('#country option:selected').val() != "null" && typeof $("#country-slider-range").slider("instance") != "undefined") {
			$("#country-slider-range").slider('values', 0, 0);
			$("#country-slider-range").slider('values', 1, (countryDatesArray.length - 1));
		}

		fillGraphCountry($('#country option:selected').val(), $("[name='radio-country']:checked").val(), $('#countryCategory option:selected').val());
	});

	$("#countryCategory").on("selectmenuchange", function() {
		// no need to make another request - the data is already in the global arrays !
		if (typeof $("#country-slider-range").slider("instance") != "undefined") {
			renderGraphCountryDailyDiff($('#countryCategory option:selected').val(), $("#country-slider-range").slider('values', 0), $("#country-slider-range").slider('values', 1));
		} else {
			renderGraphCountryDailyDiff($('#countryCategory option:selected').val());
		}
	});

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

function buildGlobalSlider() {
	$("#global-slider-range").slider({
		range: true,
		min: 0,
		max: (globalDatesArray.length - 1),
		values: [0, (globalDatesArray.length - 1)],
		slide: function(event, ui) {
			if ($("[name='radio-global']:checked").val() == "global-evolution") {
				renderGraphGlobalEvolution(ui.values[0], ui.values[1]);
			} else if ($("[name='radio-global']:checked").val() == "global-daily-growth") {
				renderGraphGlobalDailyDiff($("#globalCategory").val(), ui.values[0], ui.values[1]);
			}
		}
	});
}

function buildCountrySlider() {
	if (typeof $("#country-slider-range").slider("instance") != "undefined") {
		$("#country-slider-range").slider("destroy");
	}

	$("#country-slider-range").slider({
		range: true,
		min: 0,
		max: (countryDatesArray.length - 1),
		values: [0, (countryDatesArray.length - 1)],
		slide: function(event, ui) {
			if ($("[name='radio-country']:checked").val() == "country-evolution") {
				renderGraphCountryEvolution(ui.values[0], ui.values[1]);
			} else if ($("[name='radio-country']:checked").val() == "country-daily-growth") {
				renderGraphCountryDailyDiff($("#countryCategory").val(), ui.values[0], ui.values[1]);
			}
		}
	});
}

function fillGraphGlobalCompare(category, limit) {
	return $.when(getGlobalCompareAjaxCall(category, limit)).done(function() {
		renderGraphGlobalCompare(category);
	});
}

function fillGraphCountry(country, country_radio_value, category) {
	if (country != "null") {
		switch (country_radio_value) {
			case "country-evolution":
				$("#countryCategory").selectmenu("disable");
				$.when(getCountryEvolutionAjaxCall(country), getCountryInfoAjaxCall(country)).done(function() {
					fillCountryInfo();
					renderGraphCountryEvolution();
					buildCountrySlider();
				});
				break;
			case "country-daily-growth":
				$("#countryCategory").selectmenu("enable");
				$.when(getCountryDailyDiffAjaxCall(country), getCountryInfoAjaxCall(country)).done(function() {
					fillCountryInfo();
					renderGraphCountryDailyDiff(category);
					buildCountrySlider();
				});
				break;
		}
	}
}

function getChartDataGlobalEvolution(min, max) {

	var datesArray = [];
	var confirmedArray = [];
	var recoveredArray = [];
	var deathsArray = [];
	var stillSickArray = [];

	if (typeof (min) !== 'undefined' && typeof (max) !== 'undefined') {
		for (var i = min; i <= max; i++) {
			datesArray.push(globalDatesArray[i]);
			confirmedArray.push(globalConfirmedArray[i]);
			recoveredArray.push(globalRecoveredArray[i]);
			deathsArray.push(globalDeathsArray[i]);
			stillSickArray.push(globalStillSickArray[i]);
		}
	} else {
		datesArray = globalDatesArray;
		confirmedArray = globalConfirmedArray;
		recoveredArray = globalRecoveredArray;
		deathsArray = globalDeathsArray;
		stillSickArray = globalStillSickArray;
	}

	var lineChartDataGlobalCoronaCases = {
		labels: datesArray,
		datasets: [
			{
				label: 'Confirmed',
				backgroundColor: confirmedBackGroundColor,
				borderColor: confirmedColor,
				fill: false,
				data: confirmedArray
			},
			{
				label: 'Recovered',
				backgroundColor: recoveredBackGroundColor,
				borderColor: recoveredColor,
				fill: false,
				data: recoveredArray
			},
			{
				label: 'Deaths',
				backgroundColor: deathsBackGroundColor,
				borderColor: deathsColor,
				fill: true,
				data: deathsArray
			},
			{
				label: 'Still sick',
				backgroundColor: stillSickBackGroudColor,
				borderColor: stillSickColor,
				fill: false,
				data: stillSickArray
			}
		]
	};

	return lineChartDataGlobalCoronaCases;
}

function getChartDataGlobalDailyDiff(category, min, max) {

	var graphData;
	var barColor;
	var backColor;

	var datesArray = [];
	var confirmedArray = [];
	var recoveredArray = [];
	var deathsArray = [];
	var stillSickArray = [];
	var avgConfirmedArray = [];

	if (typeof (min) !== 'undefined' && typeof (max) !== 'undefined') {
		for (var i = min; i <= max; i++) {
			datesArray.push(globalDatesArray[i]);
			confirmedArray.push(globalDiffConfirmedArray[i]);
			recoveredArray.push(globalDiffRecoveredArray[i]);
			deathsArray.push(globalDiffDeathsArray[i]);
			stillSickArray.push(globalDiffStillSickArray[i]);
			avgConfirmedArray.push(globalAvgConfirmedArray[i]);
		}
	} else {
		datesArray = globalDatesArray;
		confirmedArray = globalDiffConfirmedArray;
		recoveredArray = globalDiffRecoveredArray;
		deathsArray = globalDiffDeathsArray;
		stillSickArray = globalDiffStillSickArray;
		avgConfirmedArray = globalAvgConfirmedArray;
	}

	var barChartDataGlobalCoronaDiff = null;

	if (category == "stacked") {
		barChartDataGlobalCoronaDiff = {
			labels: datesArray,
			datasets: [
				{
					borderWidth: 1,
					backgroundColor: confirmedBackGroundColor,
					borderColor: confirmedColor,
					fill: false,
					data: confirmedArray,
					stack: 1
				},
				{
					borderWidth: 1,
					backgroundColor: recoveredBackGroundColor,
					borderColor: recoveredColor,
					fill: false,
					data: recoveredArray,
					stack: 1
				},
				{
					borderWidth: 1,
					backgroundColor: deathsBackGroundColor,
					borderColor: deathsColor,
					fill: false,
					data: deathsArray,
					stack: 1
				}
			]
		};

	} else {

		switch (category) {
			case "confirmed":
				graphData = confirmedArray;
				barColor = confirmedColor;
				backColor = confirmedBackGroundColor;
				break;
			case "deaths":
				graphData = deathsArray;
				barColor = deathsColor;
				backColor = deathsBackGroundColor;
				break;
			case "recovered":
				graphData = recoveredArray;
				barColor = recoveredColor;
				backColor = recoveredBackGroundColor;
				break;
			case "still_sick":
				graphData = stillSickArray;
				barColor = stillSickColor;
				backColor = stillSickBackGroudColor;
				break;
		}

		if (category == "confirmed") {
			barChartDataGlobalCoronaDiff = {
				labels: datesArray,
				datasets: [
					{
						type: 'line',
						backgroundColor: confirmedAvgBackGroudColor,
						borderColor: confirmedAvgColor,
						fill: false,
						data: avgConfirmedArray
					},
					{
						borderWidth: 1,
						type: 'bar',
						backgroundColor: backColor,
						borderColor: barColor,
						fill: false,
						data: graphData
					}
				]
			};
		} else {
			barChartDataGlobalCoronaDiff = {
				labels: datesArray,
				datasets: [
					{
						borderWidth: 1,
						type: 'bar',
						backgroundColor: backColor,
						borderColor: barColor,
						fill: false,
						data: graphData
					}
				]
			};
		}
	}

	return barChartDataGlobalCoronaDiff;
}

function getChartDataCountryDailyDiff(category, min, max) {

	var datesArray = [];
	var confirmedArray = [];
	var recoveredArray = [];
	var deathsArray = [];
	var stillSickArray = [];
	var avgConfirmedArray = [];

	if (typeof (min) !== 'undefined' && typeof (max) !== 'undefined') {
		for (var i = min; i <= max; i++) {
			datesArray.push(countryDatesArray[i]);
			confirmedArray.push(countryDiffConfirmedArray[i]);
			recoveredArray.push(countryDiffRecoveredArray[i]);
			deathsArray.push(countryDiffDeathsArray[i]);
			stillSickArray.push(countryDiffStillSickArray[i]);
			avgConfirmedArray.push(countryAvgConfirmedArray[i]);
		}
	} else {
		datesArray = countryDatesArray;
		confirmedArray = countryDiffConfirmedArray;
		recoveredArray = countryDiffRecoveredArray;
		deathsArray = countryDiffDeathsArray;
		stillSickArray = countryDiffStillSickArray;
		avgConfirmedArray = countryAvgConfirmedArray;
	}

	var graphData;
	var barColor;
	var backColor;

	barChartDataCountryCoronaDiff = null;

	if (category == "stacked") {

		barChartDataCountryCoronaDiff = {
			labels: datesArray,
			datasets: [
				{
					borderWidth: 1,
					backgroundColor: confirmedBackGroundColor,
					borderColor: confirmedColor,
					fill: false,
					data: confirmedArray,
					stack: 1
				},
				{
					borderWidth: 1,
					backgroundColor: recoveredBackGroundColor,
					borderColor: recoveredColor,
					fill: false,
					data: recoveredArray,
					stack: 1
				},
				{
					borderWidth: 1,
					backgroundColor: deathsBackGroundColor,
					borderColor: deathsColor,
					fill: false,
					data: deathsArray,
					stack: 1
				}
			]
		};

	} else {

		switch (category) {
			case "confirmed":
				graphData = confirmedArray;
				barColor = confirmedColor;
				backColor = confirmedBackGroundColor;
				break;
			case "deaths":
				graphData = deathsArray;
				barColor = deathsColor;
				backColor = deathsBackGroundColor;
				break;
			case "recovered":
				graphData = recoveredArray;
				barColor = recoveredColor;
				backColor = recoveredBackGroundColor;
				break;
			case "still_sick":
				graphData = stillSickArray;
				barColor = stillSickColor;
				backColor = stillSickBackGroudColor;
				break;
		}

		var dailyDiffDatasets = [
			{
				borderWidth: 1,
				backgroundColor: backColor,
				borderColor: barColor,
				fill: false,
				data: graphData
			}];

		var avgDataset = {
			backgroundColor: confirmedAvgBackGroudColor,
			borderColor: confirmedAvgColor,
			label: backDaysAvg + ' days avg',
			type: 'line',
			fill: false,
			data: avgConfirmedArray
		};

		if (category == "confirmed") {
			dailyDiffDatasets.push(avgDataset);
		}

		barChartDataCountryCoronaDiff = {
			labels: datesArray,
			datasets: dailyDiffDatasets
		};

	}

	return barChartDataCountryCoronaDiff;

}

function getChartDataGlobalCompare(category) {

	var graphData;
	var barColor;
	var backColor;

	var barChartDataGlobalCompare = null;

	if (category == "stacked") {

		barChartDataGlobalCompare = {
			labels: globalCompareCountriesArray,
			datasets: [
				{
					backgroundColor: confirmedBackGroundColor,
					borderColor: confirmedColor,
					data: globalCompareConfirmedArray,
					borderWidth: 1,
					stack: 1
				},
				{
					backgroundColor: recoveredBackGroundColor,
					borderColor: recoveredColor,
					data: globalCompareRecoveredArray,
					borderWidth: 1,
					stack: 1
				},
				{
					backgroundColor: deathsBackGroundColor,
					borderColor: deathsColor,
					data: globalCompareDeathsArray,
					borderWidth: 1,
					stack: 1
				}
			]
		};

	} else {

		switch (category) {
			case "confirmed":
				graphData = globalCompareConfirmedArray;
				barColor = confirmedColor;
				backColor = confirmedBackGroundColor;
				break;
			case "deaths":
				graphData = globalCompareDeathsArray;
				barColor = deathsColor;
				backColor = deathsBackGroundColor;
				break;
			case "recovered":
				graphData = globalCompareRecoveredArray;
				barColor = recoveredColor;
				backColor = recoveredBackGroundColor;
				break;
			case "still_sick":
				graphData = globalCompareStillSickArray;
				barColor = stillSickColor;
				backColor = stillSickBackGroudColor;
				break;
		}

		barChartDataGlobalCompare = {
			labels: globalCompareCountriesArray,
			datasets: [
				{
					backgroundColor: backColor,
					borderColor: barColor,
					data: graphData,
					borderWidth: 1
				}
			]
		};

	}

	return barChartDataGlobalCompare;
}

function renderGraphGlobalEvolution(min, max) {

	if (typeof coronaGlobalChart != "undefined") {
		coronaGlobalChart.destroy();
	}

	var ctxCoronaCasesGlobal = $("#canvasCoronaGlobal");

	var daysCount = ((typeof (max) == 'undefined') ? (globalDatesArray.length - 1) : max) -
		((typeof (min) == 'undefined') ? 0 : min) + 1;

	var globalTitleText = 'COVID-19 global evolution between ' +
		((typeof (min) == 'undefined') ? globalDatesArray[0] : globalDatesArray[min]) + ' and ' +
		((typeof (max) == 'undefined') ? globalDatesArray[globalDatesArray.length - 1] : globalDatesArray[max]) + " (" + daysCount + " days)";

	coronaGlobalChart = new Chart(ctxCoronaCasesGlobal, {
		type: 'line',
		data: getChartDataGlobalEvolution(min, max),
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
				text: globalTitleText
			},
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					gridLines: {
						drawOnChartArea: true
					}
				}]
			}
		},
	});

}

function renderGraphGlobalDailyDiff(category, min, max) {

	if (typeof coronaGlobalChart != "undefined") {
		coronaGlobalChart.destroy();
	}

	var ctxCoronaCasesGlobal = $("#canvasCoronaGlobal");

	var daysCount = ((typeof (max) == 'undefined') ? (globalDatesArray.length - 1) : max) -
		((typeof (min) == 'undefined') ? 0 : min) + 1;

	var categoryText = $("#globalCategory option:selected").val() == "stacked" ? "" : $("#globalCategory option:selected").text().toLowerCase() + " ";

	var globalTitleText = 'COVID-19 daily ' + categoryText + 'cases between ' +
		((typeof (min) == 'undefined') ? globalDatesArray[0] : globalDatesArray[min]) + ' and ' +
		((typeof (max) == 'undefined') ? globalDatesArray[globalDatesArray.length - 1] : globalDatesArray[max]) + " (" + daysCount + " days)";

	coronaGlobalChart = new Chart(ctxCoronaCasesGlobal, {
		type: 'bar',
		data: getChartDataGlobalDailyDiff(category, min, max),
		options: {
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					gridLines: {
						drawOnChartArea: true
					}
				}]
			},
			legend: {
				display: false
			},
			title: {
				display: true,
				fontSize: 16,
				fontStyle: '',
				fontFamily: "'Open Sans', sans-serif",
				text: globalTitleText
			}
		}
	});

}

function getGlobalEvolutionAjaxCall() {

	return $.ajax({
		url: "../api/json/global_evolution.json",

		success: function(data) {
			//console.log(data);

			globalConfirmedArray = [];
			globalRecoveredArray = [];
			globalDeathsArray = [];
			globalStillSickArray = [];
			globalAvgConfirmedArray = [];

			firstDayGlobal = formatDate(data.response[0].date);
			lastDay = new Date(data.response[data.response.length - 1].date);

			for (var i in data.response) {
				globalDatesArray.push(formatDate(data.response[i].date));
				globalConfirmedArray.push(data.response[i].confirmed);
				globalRecoveredArray.push(data.response[i].recovered);
				globalDeathsArray.push(data.response[i].deaths);
				globalStillSickArray.push(data.response[i].still_sick);
				globalAvgConfirmedArray.push(data.response[i].avg_confirmed)
				//diff
				globalDiffConfirmedArray.push(data.response[i].confirmed_diff);
				globalDiffRecoveredArray.push(data.response[i].recovered_diff);
				globalDiffDeathsArray.push(data.response[i].deaths_diff);
				globalDiffStillSickArray.push(data.response[i].still_sick_diff);
			}

		},
		error: function(data) {
			console.log(data);
		}
	}); // end of ajax

}

function getGlobalCompareAjaxCall(category, limit) {

	return $.ajax({
		url: "../../api/v1/global/compare/?order=" + category + "&limit=" + limit,

		success: function(data) {
			//console.log(data);
			globalCompareCountriesArray = [];
			globalCompareConfirmedArray = [];
			globalCompareRecoveredArray = [];
			globalCompareDeathsArray = [];
			globalCompareStillSickArray = [];

			for (var i in data.response) {
				globalCompareCountriesArray.push(data.response[i].country);
				globalCompareConfirmedArray.push(data.response[i].confirmed);
				globalCompareRecoveredArray.push(data.response[i].recovered);
				globalCompareDeathsArray.push(data.response[i].deaths);
				globalCompareStillSickArray.push(data.response[i].still_sick);
			}

		},
		error: function(data) {
			console.log(data);
		}
	}); // end of ajax

}

function renderGraphGlobalCompare(category) {

	if (typeof coronaGlobalChart != "undefined") {
		coronaGlobalChart.destroy();
	}

	var ctxCoronaCasesGlobal = $("#canvasCoronaGlobal");

	var categoryText = $("#globalCategory option:selected").val() == "stacked" ? "all" : $("#globalCategory option:selected").text().toLowerCase();

	/** for global compare graph I'm using the entire period (the slider is disabled) */
	var globalTitleText = 'COVID-19 top ' + $("#limit").val() + ' countries on ' +
		categoryText + ' cases at ' + globalDatesArray[globalDatesArray.length - 1];

	coronaGlobalChart = new Chart(ctxCoronaCasesGlobal, {
		type: 'horizontalBar',
		data: getChartDataGlobalCompare(category),
		options: {
			legend: {
				display: false
			},
			title: {
				display: true,
				fontSize: 16,
				fontStyle: '',
				fontFamily: "'Open Sans', sans-serif",
				text: globalTitleText
			},
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					gridLines: {
						drawOnChartArea: true
					}
				}]
			},
		}
	});

}

function renderGraphCountryEvolution(min, max) {

	var ctxCoronaCasesByCountry = $("#canvasCoronaCountry");

	if (typeof coronaCountryChart != "undefined") {
		coronaCountryChart.destroy();
	}

	var daysCount = ((typeof (max) == 'undefined') ? (countryDatesArray.length - 1) : max) -
		((typeof (min) == 'undefined') ? 0 : min) + 1;

	var countryTitleText = $("#country option:selected").text() + " COVID-19 evolution between " +
		((typeof (min) == 'undefined') ? countryDatesArray[0] : countryDatesArray[min]) + ' and ' +
		((typeof (max) == 'undefined') ? countryDatesArray[countryDatesArray.length - 1] : countryDatesArray[max]) +
		titleTextFirstCase + " (" + daysCount + " days)";

	coronaCountryChart = new Chart(ctxCoronaCasesByCountry, {
		type: 'line',
		data: getChartDataCountryEvolution(min, max),
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
				text: countryTitleText
			},
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					gridLines: {
						drawOnChartArea: true
					}
				}]
			}
		},
	});

}

function renderGraphCountryDailyDiff(category, min, max) {

	var ctxCoronaCasesByCountry = $("#canvasCoronaCountry");

	if (typeof coronaCountryChart != "undefined") {
		coronaCountryChart.destroy();
	}

	var daysCount = ((typeof (max) == 'undefined') ? (countryDatesArray.length - 1) : max) -
		((typeof (min) == 'undefined') ? 0 : min) + 1;

	var categoryText = $("#countryCategory option:selected").val() == "stacked" ? "" : $("#countryCategory option:selected").text().toLowerCase() + " ";

	var countryTitleText = $("#country option:selected").text() + " daily COVID-19 " +
		categoryText + "cases between " +
		((typeof (min) == 'undefined') ? countryDatesArray[0] : countryDatesArray[min]) + ' and ' +
		((typeof (max) == 'undefined') ? countryDatesArray[countryDatesArray.length - 1] : countryDatesArray[max]);

	if ($("#countryCategory option:selected").val() == "confirmed") {
		countryTitleText += " & " + backDaysAvg + " days average";
	}

	countryTitleText += " (" + daysCount + " days)";

	coronaCountryChart = new Chart(ctxCoronaCasesByCountry, {
		type: 'bar',
		data: getChartDataCountryDailyDiff(category, min, max),
		options: {
			title: {
				display: true,
				fontSize: 16,
				fontStyle: '',
				fontFamily: "'Open Sans', sans-serif",
				text: countryTitleText
			},
			legend: {
				display: false
			},
			scales: {
				xAxes: [{
					gridLines: {
						drawOnChartArea: false
					}
				}],
				yAxes: [{
					gridLines: {
						drawOnChartArea: true
					}
				}]
			}
		},
	});

}

function getChartDataCountryEvolution(min, max) {

	var datesArray = [];
	var confirmedArray = [];
	var recoveredArray = [];
	var deathsArray = [];
	var stillSickArray = [];

	if (typeof (min) !== 'undefined' && typeof (max) !== 'undefined') {
		for (var i = min; i <= max; i++) {
			datesArray.push(countryDatesArray[i]);
			confirmedArray.push(countryConfirmedArray[i]);
			recoveredArray.push(countryRecoveredArray[i]);
			deathsArray.push(countryDeathsArray[i]);
			stillSickArray.push(countryStillSickArray[i]);
		}
	} else {
		datesArray = countryDatesArray;
		confirmedArray = countryConfirmedArray;
		recoveredArray = countryRecoveredArray;
		deathsArray = countryDeathsArray;
		stillSickArray = countryStillSickArray;
	}

	var lineChartDataCoronaCases = {
		labels: datesArray,
		datasets: [
			{
				label: 'Confirmed',
				backgroundColor: confirmedBackGroundColor,
				borderColor: confirmedColor,
				fill: false,
				data: confirmedArray
			},
			{
				label: 'Recovered',
				backgroundColor: recoveredBackGroundColor,
				borderColor: recoveredColor,
				fill: false,
				data: recoveredArray
			},
			{
				label: 'Deaths',
				backgroundColor: deathsBackGroundColor,
				borderColor: deathsColor,
				fill: true,
				data: deathsArray
			},
			{
				label: 'Still sick',
				backgroundColor: stillSickBackGroudColor,
				borderColor: stillSickColor,
				fill: false,
				data: stillSickArray
			}
		]
	};

	return lineChartDataCoronaCases;
}

function getCountryDailyDiffAjaxCall(country) {

	return $.ajax({
		url: "../api/v1/global/countrydaily/?country=" + country + "&avg=" + backDaysAvg,

		success: function(data) {
			//console.log(data);
			countryDatesArray = [];
			countryDiffConfirmedArray = [];
			countryDiffRecoveredArray = [];
			countryDiffDeathsArray = [];
			countryDiffStillSickArray = [];
			countryAvgConfirmedArray = [];

			for (var i in data.response) {
				countryDatesArray.push(data.response[i].formatted_date);
				countryDiffConfirmedArray.push(data.response[i].diff_confirmed);
				countryDiffRecoveredArray.push(data.response[i].diff_recovered);
				countryDiffDeathsArray.push(data.response[i].diff_deaths);
				countryDiffStillSickArray.push(data.response[i].diff_still_sick);
				countryAvgConfirmedArray.push(data.response[i].avg_confirmed);
			}

		},
		error: function(data) {
			console.log(data);
		}
	}); // end of ajax
}
function getCountryEvolutionAjaxCall(country) {

	return $.ajax({
		url: "../api/v1/global/evolution/?country=" + country,

		success: function(data) {
			//console.log(data);
			countryDatesArray = [];
			countryConfirmedArray = [];
			countryRecoveredArray = [];
			countryDeathsArray = [];
			countryStillSickArray = [];
			first_case = formatDate(data.response[0].date);
			first_case_confirmed = data.response[0].confirmed;
			titleTextFirstCase = "";

			if (first_case == firstDayGlobal && first_case_confirmed != 1) {
				titleTextFirstCase += ' (first case appeared before ' + firstDayGlobal + ')';
			}

			for (var i in data.response) {
				countryDatesArray.push(formatDate(data.response[i].date));
				countryConfirmedArray.push(data.response[i].confirmed);
				countryRecoveredArray.push(data.response[i].recovered);
				countryDeathsArray.push(data.response[i].deaths);
				countryStillSickArray.push(data.response[i].still_sick);
			}

		},
		error: function(data) {
			console.log(data);
		}
	}); // end of ajax
}

function getCountryInfoAjaxCall(country) {

	return $.ajax({
		url: "../api/v1/global/countrydata/?country=" + country,

		success: function(data) {
			//console.log(data);
			country_confirmed = parseInt(data[0].confirmed);
			country_deaths = parseInt(data[0].deaths);
			country_recovered = parseInt(data[0].recovered);
			country_still_sick = parseInt(data[0].still_sick);
			country_new_cases = parseInt(data[0].new_cases);
			country_new_deaths = parseInt(data[0].new_deaths);
			country_new_recovered = parseInt(data[0].new_recovered);
			country_new_still_sick = parseInt(data[0].new_still_sick);
		},
		error: function(data) {
			console.log(data);
		}
	}); // end of ajax

}

function fillCountryInfo() {

	var countryIsoValue = $("#country option:selected").val();
	var countryName = $("#country option:selected").text();

	if (countryIsoValue == 'RO') {
		$('#country_name').html($("<a></a>").attr("href", "/corona/ro").attr("target", "_new").text(countryName));
	} else {
		$('#country_name').text(countryName);
	}

	$('#country_confirmed').text(country_confirmed.toLocaleString('ro-RO'));
	$('#country_deaths').text(country_deaths.toLocaleString('ro-RO'));
	$('#country_recovered').text(country_recovered.toLocaleString('ro-RO'));
	$('#country_still_sick').text(country_still_sick.toLocaleString('ro-RO'));

	$('#country_confirmed_new').text(country_new_cases > 0 ? '+' + country_new_cases.toLocaleString('ro-RO') : (country_new_cases == 0 ? '' : country_new_cases.toLocaleString('ro-RO')));
	$('#country_deaths_new').text(country_new_deaths > 0 ? '+' + country_new_deaths.toLocaleString('ro-RO') : (country_new_deaths == 0 ? '' : country_new_deaths.toLocaleString('ro-RO')));
	$('#country_recovered_new').text(country_new_recovered > 0 ? '+' + country_new_recovered.toLocaleString('ro-RO') : (country_new_recovered == 0 ? '' : country_new_recovered.toLocaleString('ro-RO')));
	$('#country_still_sick_new').text(country_new_still_sick > 0 ? '+' + country_new_still_sick.toLocaleString('ro-RO') : (country_new_still_sick == 0 ? '' : country_new_still_sick.toLocaleString('ro-RO')));

}

function fillGlobalInfo() {

	$('#global_date').text(lastDay.toLocaleString('en-GB', { dateStyle: 'short' }).substr(0, 10));
	$('#global_confirmed').text(globalConfirmedArray[globalConfirmedArray.length - 1].toLocaleString('ro-RO'));
	$('#global_deaths').text(globalDeathsArray[globalDeathsArray.length - 1].toLocaleString('ro-RO'));
	$('#global_recovered').text(globalRecoveredArray[globalRecoveredArray.length - 1].toLocaleString('ro-RO'));
	$('#global_still_sick').text(globalStillSickArray[globalStillSickArray.length - 1].toLocaleString('ro-RO'));

	var new_cases = globalDiffConfirmedArray[globalDiffConfirmedArray.length - 1];
	var new_deaths = globalDiffDeathsArray[globalDiffDeathsArray.length - 1];
	var new_recovered = globalDiffRecoveredArray[globalDiffRecoveredArray.length - 1];
	var new_still_sick = globalDiffStillSickArray[globalDiffStillSickArray.length - 1];

	$('#global_confirmed_new').text(new_cases > 0 ? '+' + new_cases.toLocaleString('ro-RO') : new_cases.toLocaleString('ro-RO'));
	$('#global_deaths_new').text(new_deaths > 0 ? '+' + new_deaths.toLocaleString('ro-RO') : new_deaths.toLocaleString('ro-RO'));
	$('#global_recovered_new').text(new_recovered > 0 ? '+' + new_recovered.toLocaleString('ro-RO') : new_recovered.toLocaleString('ro-RO'));
	$('#global_still_sick_new').text(new_still_sick > 0 ? '+' + new_still_sick.toLocaleString('ro-RO') : new_still_sick.toLocaleString('ro-RO'));

}
