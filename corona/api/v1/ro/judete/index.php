<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
// just prints the json file
echo file_get_contents("../judete.json");
?>