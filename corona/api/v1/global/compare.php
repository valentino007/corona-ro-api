<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/config/database.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/controllers/globalcomparecontroller.php';

$database = new Database();

$db = $database->getConnection();

$items = new GlobalCompareController($db);

$limit = $_GET['limit'];
$order = $_GET['order'];

if (!isset($limit) || empty($limit)) :
    $limit = 10;
endif;

if (!isset($order) || empty($order)) :
    $order = "confirmed";
endif;

$stmt = $items->read($limit, $order);
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