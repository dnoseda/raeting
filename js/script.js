(function() {

  // detect if is in ML  

  var options = document.getElementById("currencyTo");

  var urlSites = {
    "mercadolibre.com.ar":"ARS",
    "mercadolivre.com.br":"BRL",
    "mercadolibre.com.mx":"MXN",
    "mercadolibre.cl":"CLP",
    "mercadolibre.com.co":"COP",
    "mercadolibre.com.uy":"UYU"
  };



  executeRequest("https://api.mercadolibre.com/currencies",function(currencies) {
    currencies.sort(function(a,b){
      if(a.id>b.id){
        return -1;
      }
      return 1;
    });

    chrome.tabs.getSelected(null, function(tab) {


      chrome.tabs.sendMessage(tab.id, {data:{action:"getSelectedCurrency"}}, function(response) {
        // elegida por el usuario previamente
        var defaultSiteCurrencyId = response.currencyId


        if(!defaultSiteCurrencyId){
          
          // Detecto de la url
          var tabUrl = tab.url.replace(/.*\/\/.*(mercadoli.*)\/.*/,"$1");
          
          for (var key in urlSites) {
            if(key === tabUrl){
              defaultSiteCurrencyId = urlSites[key];
            }
          }
        }

        for (var i = currencies.length - 1; i >= 0; i--) {
          var currency = currencies[i];
          var opt = document.createElement('option');
          opt.value = currency.id;
          opt.innerHTML = currency.description + " ("+currency.symbol+")";
          if(currency.id === defaultSiteCurrencyId){
            opt.selected = "true";
          }
          options.appendChild(opt);
        }      
      });
    });
  });


  options.onchange= function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currencyTo = options.value;
      chrome.tabs.sendMessage(tabs[0].id, {data: {action:"changeCurrency",currency_id:currencyTo}}, function(response) {
        document.getElementById('status').innerHTML = 'Cambiando precios a '+currencyTo;
        console.log('success');
      });
    });
  };
})();    

