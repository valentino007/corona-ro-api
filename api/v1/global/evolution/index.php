<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once $_SERVER['DOCUMENT_ROOT'] . '/api/config/databaseCorona.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/api/controllers/countryevolutioncontroller.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/api/controllers/countryinfocontroller.php';

$database = new Database();

$db = $database->getConnection();

$items = new CountryEvolutionController($db);

$country = $_GET['country'];

$stmt = $items->read($country);
$itemCount = $stmt->rowCount();

if ($itemCount > 0) :
    http_response_code(200);

    $arr = array();
    $arr['response'] = array();
    $arr['count'] = $itemCount;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) :
        $elem = $row;
        array_push($arr['response'], $elem);
    endwhile
    ;

    // call to CountryInfoController
    $info = new CountryInfoController($db);
    $stmtinfo = $info->read($country);
    $resultinfo = $stmtinfo->fetch(PDO::FETCH_ASSOC);

    $arr['country_info'] = $resultinfo;

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