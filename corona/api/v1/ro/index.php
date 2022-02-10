<?php

header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Allow-Origin: *");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

echo "<br>1=" . $uri[1];
echo "<br>2=" . $uri[2];
echo "<br>3=" . $uri[3];
echo "<br>4=" . $uri[4];
// echo implode("/",$uri);

?>