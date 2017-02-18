(function() {

  var options = document.getElementById("currencyTo");

  executeRequest("https://api.mercadolibre.com/currencies",function(currencies) {
    currencies.sort(function(a,b){
      if(a.id>b.id){
        return -1;
      }
      return 1;
    });
    for (var i = currencies.length - 1; i >= 0; i--) {
      var currency = currencies[i];
       var opt = document.createElement('option');
        opt.value = currency.id;
        opt.innerHTML = currency.description + " ("+currency.symbol+")";
        options.appendChild(opt);
    }      
  });


  options.onchange= function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currencyTo = options.value;
      chrome.tabs.sendMessage(tabs[0].id, {data: {action:"changeCurrency",currency_id:currencyTo}}, function(response) {
        document.getElementById('status').innerHTML('Cambiando precios a '+currencyTo);
        console.log('success');
      });
    });
  };
})();    

