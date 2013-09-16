<?php
$from = $_GET['from'];
$to = $_GET['to'];
$json = file_get_contents("http://rate-exchange.appspot.com/currency?from={$from}&to={$to}");
header("Content-type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
echo $json;
?>