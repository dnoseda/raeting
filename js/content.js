(function(exports){

  var raeting = this.raeting||{};
  
  exports.raeting = raeting;
  
}(this));

(function(namespace){

  var _cache = {};
  var selectedCurrency = null;
  namespace.executeRequest= function (url, success){

    if(_cache[url] && _cache[url] != "block"){
      console.log("[ER]: "+url+" hit!");
      success(_cache[url]);
      return;
    }

    if(_cache[url] == "block"){
      console.log("[ER]: "+url+" Blockeado, espero...");
      setTimeout(function(){
        console.log("[ER]: recuperando");
        namespace.executeRequest(url, success);
      },100);
      return;
    }

    _cache[url] = "block";

    console.log("[ER]: "+url+" miss!");

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Accept', '*/*');

    request.onload = function(){
      var json = JSON.parse(request.responseText);
      _cache[url] = json;
      success(json);
    };

    request.onerror = function() {
      console.log(request.responseText);
      console.log(request.status);
      console.log(request.statusText);

    };

    request.send();
  }    

  namespace.getCurrencyRate= function (from, to, callback){

    namespace.executeRequest("https://api.mercadolibre.com/currency_conversions/search?from="+from+"&to="+to, function(data){

      if(typeof data.ratio != "undefined"){
        callback(data.ratio);
      }
    });
  };


  namespace.initTransformRequest= function (itemId, itemPriceElement, currencyTo){

    function refreshPrice(data){      
      if(data.currency_id && data.currency_id !== currencyTo){
        namespace.getCurrencyRate(data.currency_id, currencyTo, function(rate){
                var newPrice = (data.price * rate).toFixed(2); //TODO: contemplar decimalPoint, separators,etc
                itemPriceElement.innerHTML = newPrice + " (" +currencyTo+ ")";
              });
      }
    }

    namespace.executeRequest("https://api.mercadolibre.com/items/"+itemId+"?attributes=id,price,currency_id", refreshPrice);
    
  };

  namespace.sendPriceChange= function (currencyTo){
    var items = document.querySelectorAll(".rowItem");
    for (var i = items.length - 1; i >= 0; i--) {

      var itemE = items[i];
      // HAy items id que tienen anuncios
      if(itemE.id && itemE.id.match(/^[A-Z]{3}\d+/)){
        var currencyE = itemE.querySelector(".ch-price");
        namespace.initTransformRequest(itemE.id, currencyE,currencyTo);
      }
    }
  };
  /**/
  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("something happening from the extension");
    
    var data = request.data || {};
    console.log("DATA:");
    console.log(data);
    if(data.action === "changeCurrency"){
      selectedCurrency = data.currency_id;
      // TODO: pasar sendResponse para cuando termina de convertir, con progress
      namespace.sendPriceChange(data.currency_id);
    }else if(data.action === "getSelectedCurrency"){
      sendResponse({currencyId:selectedCurrency});
    }
  });
  /**/
}(this.raeting));
