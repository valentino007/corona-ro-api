<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/config/database.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/corona/api/controllers/judet.php';

$database = new Database();

$db = $database->getConnection();

$items = new Judet($db);

$judet = $_POST['judet'];

$stmt = $items->read($judet);
$itemCount = $stmt->rowCount();

if ($itemCount > 0) :
    http_response_code(200);
    $arr = array();
    $arr['response'] = array();
    $arr['count'] = $itemCount;
    $arr['method'] = $_SERVER["REQUEST_METHOD"];

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