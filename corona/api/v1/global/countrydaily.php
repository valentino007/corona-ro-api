<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/config/database.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/controllers/countrydailycontroller.php';

$database = new Database();

$db = $database->getConnection();
$avg = 14;

$items = new CountryDailyController($db);

$country = $_GET['country'];

$stmt = $items->read($country, $avg);
$itemCount = $stmt->rowCount();

if ($itemCount > 0) :
    http_response_code(200);

    // I should put here the call to CountryInfoController - and get the data inside this JSON response

    $arr = array();
    $arr['response'] = array();
    $arr['count'] = $itemCount;
    $arr['countryISO2'] = $country;
    $arr['avg'] = $avg;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) :
        $elem = $row;
        array_push($arr['response'], $elem);
    endwhile
    ;
    echo json_encode($arr);

else :
    http_response_code(404);

    echo json_encode(array(
        "type" => "danger",
        "title" => "failed",
        "message" => "No records found"
    ));
endif;

?>