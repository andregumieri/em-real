;(function($) {
	var O = {
		$divLoading: $("#divLoading")
	};

	var EmDolar = {
		display: 0,
		dolar: 0,
		dolarUpdate: null,
		calculaIof: false,
		calculaImposto: false,
		iof: {
			dinheiro: 1.0,
			credito: 1.0638,
			debito: 1.0038,
		},
		imposto: 1.065,

		/**
		 * EmDolar.init()
		 * Inicializa o webapp
		 */
		init: function() {
			// Inicia a div de loading
			EmDolar.Loading.init();

			// Atualiza o dolar e inicia o app
			EmDolar.atualizarDolar(function(success) {
				if(success) {
					EmDolar.Loading.hide();
					EmDolar.setup();
				} else {
					EmDolar.Loading.hide();
					$("#divSemDados").css("display", "-webkit-box");
				}
			});
		},

		/**
		 * EmDolar.setup()
		 * Faz o setup para funcionamento do webapp
		 */
		setup: function() {
			// Seta o tamanho do keypad
			EmDolar.keypadSize();

			// Seta a opção de IOF e imposto
			EmDolar.setOptIOF();
			EmDolar.setOptImposto();

			// Escreve as informações da última atualização do dolar
			EmDolar.infoDolar();

			// Eventos do keypad
			$("#wrapKeyboard button").on("touchstart", EmDolar._botaoKeypadTouchStart);
			$("#wrapKeyboard button").on("touchend", EmDolar._botaoKeypadTouchEnd);

			// Evento do botão de update do dolar
			$("#btnUpdateDolar").on("touchstart", EmDolar._botaoUpdateDolarTouchStart);

			// Evento dos botões de IOF
			$("#wrapBotoesPagamento button").on("touchstart", EmDolar._botaoPagamentoTouchStart);
			$("#btnOptImposto").on("touchstart", EmDolar._botaoImpostoTouchStart);

			// Evento do resize/orientacao
			$(window).on("resize", EmDolar._windowResize);
			
		},

		/**
		 * EmDolar.keypadSize()
		 * Ajusta o tamanho do Keypad de acordo com o espaço disponível na tela
		 */
		keypadSize: function() {
			// Seta o tamanho do keypad
			$("#wrapKeyboard").height(window.innerHeight-144-48);
		},


		/**
		 * EmDolar.setOptIOF()
		 * Seta a opção de IOF usada
		 *
		 * @param STRING key - Chave de IOF usada (dinheiro, credito ou debito)
		 */
		setOptIOF: function(key) {
			if(!key) key = localStorage.getItem('emdolar-calculaIof');
			if(!key) key = 'dinheiro';

			// Seta a opção
			EmDolar.calculaIof = key;
			localStorage.setItem('emdolar-calculaIof', EmDolar.calculaIof);

			// Ajusta o botão
			$("#btnOptPagamento_" + EmDolar.calculaIof).addClass("ativo").siblings().removeClass("ativo");
		},

		/**
		 * EmDolar.setOptImposto()
		 * Seta se será calculado imposto ou não
		 *
		 * @param BOOL ativo
		 */
		setOptImposto: function(ativo) {
			if(ativo===undefined) ativo = (localStorage.getItem('emdolar-calculaImposto')==='false') ? false : (localStorage.getItem('emdolar-calculaImposto')==='true') ? true : null;
			if(ativo===null) ativo = true;

			// Seta a opção
			EmDolar.calculaImposto = ativo;
			localStorage.setItem('emdolar-calculaImposto', EmDolar.calculaImposto);

			// Ajusta o botão
			if(EmDolar.calculaImposto) {
				$("#btnOptImposto").addClass("ativo");
			} else {
				$("#btnOptImposto").removeClass("ativo");
			}
		},


		/**
		 * EmDolar._windowResize()
		 * Evento disparado no resize do window ou na mudança de orientação
		 */
		_windowResize: function(e) {
			EmDolar.keypadSize();
		},


		/**
		 * EmDolar._botaoPagamentoTouchStart()
		 * Evento disparado quando a forma de pagamento é trocada
		 */
		_botaoPagamentoTouchStart: function(e) {
			e.preventDefault();
			var tipo = $(this).data("tipo");
			EmDolar.setOptIOF(tipo);
			EmDolar.atualizarDisplay();
		},

		/**
		 * EmDolar._botaoImpostoTouchStart()
		 * Evento disparado quando é alterado o botao imposto
		 */
		_botaoImpostoTouchStart: function(e) {
			e.preventDefault();
			var ativo = !EmDolar.calculaImposto;
			EmDolar.setOptImposto(ativo);
			EmDolar.atualizarDisplay();
		},


		/**
		 * EmDolar._botaoUpdateDolarTouchStart()
		 * Evento disparado no touch start do botão de update do dolar
		 */
		_botaoUpdateDolarTouchStart: function(e) {
			e.preventDefault();
			if(!$(this).hasClass("anima")) {
				EmDolar.atualizarDolar(null, true);
			}
		},


		/**
		 * EmDolar._botaoKeypadTouchStart()
		 * Evento disparado no touch start do botão do keypad
		 */
		_botaoKeypadTouchStart: function(e) {
			e.preventDefault();
			$(this).addClass("touched");
		},


		/**
		 * EmDolar._botaoKeypadTouchEnd()
		 * Evento disparado no touch end do botão do keypad
		 */
		_botaoKeypadTouchEnd: function(e) {
			e.preventDefault();
			var key = $(this).data("key");
			var display = EmDolar.display.toString();
			$(this).removeClass("touched");
			if(display.length>=11 && key!='clear') { return false; }

			if(key!='clear') {
				display += key;
			} else if(key=='clear') {
				display = display.substr(0, display.length-1);
				if(display=='') {
					display = 0;
				}
			}

			EmDolar.display = parseInt(display);
			
			EmDolar.atualizarDisplay();
		},

		/**
		 * EmDolar.infoDolar()
		 * Atualiza a informação do valor do dolar e a data e hora da última atualização
		 */
		infoDolar: function() {
			// Atualizacao do dolar
			var dataAtualizada = new Date(parseInt(EmDolar.dolarUpdate));
			var strDataAtualizada = str_pad(dataAtualizada.getDate(), 2, "0", 'STR_PAD_LEFT');
			strDataAtualizada += '/'+str_pad(dataAtualizada.getMonth()+1, 2, "0", 'STR_PAD_LEFT');
			strDataAtualizada += ' às ' + str_pad(dataAtualizada.getHours(), 2, "0", 'STR_PAD_LEFT');
			strDataAtualizada += ':' + str_pad(dataAtualizada.getMinutes(), 2, "0", 'STR_PAD_LEFT');

			$("#spanCotacao").html("Última atualização<br />R$ " + EmDolar.dolar.formatMoney(2, ',', '.') + " em " + strDataAtualizada);
		},


		/**
		 * EmDolar.atualizaDisplay()
		 * Faz a conversão do valor em reais e atualiza o display
		 */
		atualizarDisplay: function() {
			var display = EmDolar.display/100;
			var displayConvertido = display*EmDolar.dolar;

			// Calcula IOF
			displayConvertido *= EmDolar.iof[EmDolar.calculaIof];

			// Calcula Imposto
			if(EmDolar.calculaImposto) {
				displayConvertido *= EmDolar.imposto;
			}

			display = display.formatMoney(2,'.',',');
			displayConvertido = displayConvertido.formatMoney(2,',','.');

			var inteiro = display.substr(0,display.length-3);
			var centavos = display.substr(display.length-3,display.length);

			var inteiroConvertido = displayConvertido.substr(0,displayConvertido.length-3);
			var centavosConvertido = displayConvertido.substr(displayConvertido.length-3,displayConvertido.length);
			
			// Seta ao display
			$("#spanConverter").html("<small>$</small> " + inteiro + "<small>" + centavos + "</small>");
			$("#spanConvertido").html("<small>R$</small> " + inteiroConvertido + "<small>" + centavosConvertido + "</small>");
		},

		/**
		 * EmDolar.atualizarDolar
		 * Conecta com o webservice para atualizar a cotação do dolar
		 *
		 * @param callback - Função para ser executada assim que tiver um valor de dolar (em cache ou atualizado)
		 * @param force - Força a atualização da cotação mesmo que ainda não tenha dado o timeout
		 */
		atualizarDolar: function(callback, force) {
			var lastUpdate = localStorage.getItem('emdolar-lastupdate');
			var lastRate = localStorage.getItem('emdolar-rate');
			if(!lastUpdate) lastUpdate = 0;
			
			if(lastUpdate && lastRate) {
				lastRate = parseFloat(lastRate);
				EmDolar.dolar = lastRate;
				EmDolar.dolarUpdate = lastUpdate;
				if(typeof callback == 'function') {
					callback.call(this, true);
					callback = null;
				}
			}

			var timeout = 1*60*60*1000;// 1 hora de diferenca
			var agora = (new Date()).getTime();
			var diferenca = agora-parseInt(lastUpdate);

			if(diferenca>timeout || force===true) { // 1 hora de diferenca
				$("#btnUpdateDolar").removeClass("erro");
				$("#btnUpdateDolar").addClass("anima");

				$.ajax({
					url: '../backend/get.php',
					data: {from: 'USD', to:'BRL'},
					dataType: 'json',
					type: 'GET',
					success: function(data) {
						localStorage.setItem('emdolar-rate', data.rate);
						EmDolar.dolar = data.rate;
						EmDolar.dolarUpdate = (new Date()).getTime();
						localStorage.setItem('emdolar-lastupdate', EmDolar.dolarUpdate);
						EmDolar.infoDolar();
						$("#btnUpdateDolar").removeClass("anima");

						if(typeof callback == 'function') {
							callback.call(this, true);
							callback = null;
						}
					},

					error: function() {
						$("#btnUpdateDolar").removeClass("anima");
						$("#btnUpdateDolar").addClass("erro");

						if(typeof callback == 'function') {
							callback.call(this, false);
							callback = null;
						}
					}
				});
			}
		},

		/**
		 * EmDolar.Loading
		 */
		Loading: {
			/**
			 * EmDolar.Loading.init()
			 * Faz o setup do spining da tela de loading
			 */
			init: function() {
				var opts = {
					lines: 13, // The number of lines to draw
					length: 10, // The length of each line
					width: 4, // The line thickness
					radius: 14, // The radius of the inner circle
					corners: 1, // Corner roundness (0..1)
					rotate: 0, // The rotation offset
					direction: 1, // 1: clockwise, -1: counterclockwise
					color: '#fff', // #rgb or #rrggbb or array of colors
					speed: 1, // Rounds per second
					trail: 60, // Afterglow percentage
					shadow: false, // Whether to render a shadow
					hwaccel: false, // Whether to use hardware acceleration
					className: 'spinner', // The CSS class to assign to the spinner
					zIndex: 2e9, // The z-index (defaults to 2000000000)
					top: 'auto', // Top position relative to parent in px
					left: 'auto' // Left position relative to parent in px
				};
				var spinner = new Spinner(opts).spin(O.$divLoading[0]);
			},

			/**
			 * EmDolar.Loading.show()
			 * Mostra o loading
			 */
			show: function() {
				O.$divLoading.show();
			},


			/**
			 * EmDolar.Loading.hide()
			 * Esconde o loading
			 */
			hide: function() {
				O.$divLoading.hide();
			}
		}
	}
	$(document).ready(EmDolar.init);
})(jQuery);