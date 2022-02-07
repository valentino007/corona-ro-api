<?php
//setting header to json
header('Content-Type: application/json');

require "config.php"; 	// Database Connection

require "query.php";	// SQL queries

$sql_country_daily_diff = str_replace("avg_token", $_GET['avg'], $sql_country_daily_diff);

$stmt=$dbo->prepare($sql_country_daily_diff);

$stmt->bindParam(':country', $_GET['country']);

$stmt->execute();
$result=$stmt->fetchAll(PDO::FETCH_ASSOC);

print json_encode($result);
?>
