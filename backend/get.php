<?php
	/** 
	 * Converte moedas
	 * @link http://www.webservicex.net/ws/WSDetails.aspx?CATID=2&WSID=10
	 *
	 * @param STRING $from - Moeda de origem
	 * @param STRING $to - Moeda de destino
	 * 
	 * @return JSON - DOUBLE rate, STRING from, STRING to
	 */

	// Parametros
	$from = $_GET['from'];
	$to = $_GET['to'];

	// Pega resultados
	$xml = file_get_contents("http://www.webservicex.net/CurrencyConvertor.asmx/ConversionRate?FromCurrency={$from}&ToCurrency={$to}");

	// Parse do resultado
	$xmlget = simplexml_load_string($xml);
	$rate = floatval($xmlget[0]);

	// Exibe resultados
	header("Content-type: application/json");
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
	echo json_encode(array('to'=>$to, 'from'=>$from, 'rate'=>$rate));
?>