<?php
header('Content-Type: application/json');

require "config.php"; 	// Database Connection

require "query.php";	// SQL queries

$stmt=$dbo->prepare($sql_data_by_country);

$stmt->bindParam(':country', $_GET['country']);

$stmt->execute();
$result=$stmt->fetchAll(PDO::FETCH_ASSOC);

print json_encode($result);
?>