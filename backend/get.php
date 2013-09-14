<?php
$from = $_GET['from'];
$to = $_GET['to'];
$json = file_get_contents("http://rate-exchange.appspot.com/currency?from={$from}&to={$to}");
header("Content-type: application/json");
echo $json;
?>