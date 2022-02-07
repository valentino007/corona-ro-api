<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/config/database.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/controllers/judet.php';

$database = new Database();

$db = $database->getConnection();

$items = new Judet($db);

$stmt = $items->read();
$itemCount = $stmt->rowCount();

if ($itemCount > 0) :
    http_response_code(200);
    // $arr = array();
    // $arr['response'] = array();
    // $arr['count'] = $itemCount;

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
else :
    http_response_code(404);

    echo json_encode(array(
        "type" => "danger",
        "title" => "failed",
        "message" => "No records found"
    ));
endif;

?>