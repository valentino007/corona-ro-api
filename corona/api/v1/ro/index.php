<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

echo $uri[count($uri) - 3];
// echo implode("/",$uri);
?>