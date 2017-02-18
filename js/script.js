$(document).ready(function() {

  var eventBuffer = {};
  var urlx = "https://api.mercadolibre.com/currencies";
  var options = $("#currencyTo");

  executeRequest("https://api.mercadolibre.com/currencies",function(json) {
    $.each(json, function(index) {
      var currency = this;
      options.append($("<option />").val(currency.id).text(currency.description + " ("+currency.symbol+")"));
    });
  });


  options.on("change",function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {data: {action:"changeCurrency",currency_id:options.val()}}, function(response) {
        $('#status').html('Cambiando precios a '+options.val());
        console.log('success');
      });
    });
  });
});    

