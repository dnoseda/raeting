$(document).ready(function() {
    var urlx = "https://api.mercadolibre.com/currencies";
    var options = $("#currencyTo");

    var request = new XMLHttpRequest();
    var url ="https://api.mercadolibre.com/currencies"
    request.open('GET', url, true);
    request.setRequestHeader('Accept', '*/*');
    //request.setRequestHeader('User-Agent','curl/7.43.0'); 

    request.onload = function() {
      var json = JSON.parse(request.responseText);
      $.each(json, function(index) {
            var currency = this;
            options.append($("<option />").val(currency.id).text(currency.description + " ("+currency.symbol+")"));
          });
    };

    request.onerror = function() {
        console.log(request.responseText);
        console.log(request.status);
        console.log(request.statusText);
      
    };

    request.send(); 
})