<?php
header('Content-Type: application/json');

require "../config.php"; // Database Connection

require "../query.php"; // SQL queries

$sql_judet_daily_diff = str_replace("avg_token", $_GET['avg'], $sql_judet_daily_diff);

$stmt = $dbo->prepare($sql_judet_daily_diff);

$stmt->bindParam(':judet', $_GET['judet']);

$stmt->execute();
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

print json_encode($result);
?>