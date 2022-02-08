<?php

$sql_data_by_country="SELECT countries.*
,full_corona.confirmed
,full_corona.deaths
,full_corona.recovered
,full_corona.confirmed - (full_corona.recovered + full_corona.deaths) AS still_sick
,full_corona.confirmed - view_previous_date.confirmed as new_cases
,full_corona.deaths - view_previous_date.deaths as new_deaths
,full_corona.recovered - view_previous_date.recovered as new_recovered
,(full_corona.confirmed - (full_corona.recovered + full_corona.deaths)) -
	(view_previous_date.confirmed - (view_previous_date.recovered + view_previous_date.deaths)) AS new_still_sick
FROM
full_corona
INNER JOIN countries
ON full_corona.country = countries.country
AND countries.iso    = :country
AND full_corona.date = (SELECT MAX(DATE) FROM full_corona )
INNER JOIN view_previous_date
ON countries.iso = view_previous_date.iso"; 

$sql_evolution_by_country="SELECT
	   DATE                            		AS raw_date
     , DATE_FORMAT(date, '%d/%m/%Y')        AS formatted_date
     , confirmed                            AS confirmed
     , deaths                               AS deaths
     , recovered                            AS recovered
     , confirmed - (deaths + recovered)		AS still_sick
FROM full_corona
INNER JOIN countries
ON full_corona.country = countries.country
WHERE countries.iso = :country
AND confirmed > 0
ORDER BY DATE ASC;";

$sql_country_daily_diff="SELECT DATE
, date_format(cur.date,'%d/%m/%Y')    AS formatted_date
, confirmed - COALESCE(
(
	SELECT confirmed 
	FROM full_corona prev
	INNER JOIN countries ON prev.country = countries.country
	WHERE iso = :country
	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
	ORDER BY DATE asc
	LIMIT 1 ), 0) AS diff_confirmed
, deaths - COALESCE(
(
	SELECT deaths 
	FROM full_corona prev
	INNER JOIN countries ON prev.country = countries.country
	WHERE iso = :country
	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
	ORDER BY DATE asc
	LIMIT 1 ), 0) AS diff_deaths
, recovered - COALESCE(
(
	SELECT recovered 
	FROM full_corona prev
	INNER JOIN countries ON prev.country = countries.country
	WHERE iso = :country
	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
	ORDER BY DATE asc
	LIMIT 1 ), 0) AS diff_recovered
, (confirmed - (deaths + recovered)) - COALESCE(
(
	SELECT confirmed - (deaths + recovered) 
	FROM full_corona prev
	INNER JOIN countries ON prev.country = countries.country
	WHERE iso = :country
	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
	ORDER BY DATE asc
	LIMIT 1 ), 0) AS diff_still_sick
, ROUND((confirmed - COALESCE(
(
	SELECT confirmed 
	FROM full_corona prev
	INNER JOIN countries ON prev.country = countries.country
	WHERE iso = :country
	AND prev.date = date_sub(cur.date, INTERVAL avg_token DAY)
	ORDER BY DATE asc
	LIMIT 1 ), 0)) / avg_token, 2) AS avg_confirmed
FROM full_corona cur
INNER JOIN countries ON cur.country = countries.country
WHERE iso = :country
AND confirmed > 0
ORDER BY DATE ASC;";

?>
