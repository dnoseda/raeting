(function(exports){

  var raeting = this.raeting||{};
  
  exports.raeting = raeting;
  
}(this));

(function(namespace){

  var _cache = {};
  var selectedCurrency = null;
  namespace.total=0;
  namespace.nanobar = new Nanobar();
  namespace.max = 0;
  namespace.executeRequest= function (url, success){

    if(_cache[url] && _cache[url] != "block"){
      
      success(_cache[url]);
      return;
    }

    if(_cache[url] == "block"){
      
      setTimeout(function(){
        
        namespace.executeRequest(url, success);
      },100);
      return;
    }

    _cache[url] = "block";

    

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
      namespace.total--;
      if(data.currency_id &&
          (!!selectedCurrency ||
            selectedCurrency !== currencyTo) &&
          data.currency_id !== currencyTo){
        namespace.getCurrencyRate(data.currency_id, currencyTo, function(rate){
                var newPrice = (data.price * rate).toFixed(2); //TODO: contemplar decimalPoint, separators,etc
                itemPriceElement.innerHTML = newPrice + " (" +currencyTo+ ")";
              });
      }else if(data.currency_id === currencyTo){
        var newPrice = (data.price).toFixed(2); //TODO: contemplar decimalPoint, separators,etc
        itemPriceElement.innerHTML = newPrice + " (" +currencyTo+ ")";
      }
    }

    namespace.executeRequest("https://api.mercadolibre.com/items/"+itemId+"?attributes=id,price,currency_id", refreshPrice);
    
  };

  namespace.sendPriceChange= function (currencyTo, callback){
    var items = document.querySelectorAll(".rowItem");
    
    
    var waitFor = function(){
      console.log("Waiting for total: "+ namespace.total);
      if(namespace.total > 1){
        namespace.nanobar.go(((namespace.max-namespace.total)/namespace.max)*100);
        setTimeout(waitFor,300);
      }else{
        namespace.nanobar.go(100);
        callback();
      }
    };

    namespace.total=0;
    for (var i = items.length - 1; i >= 0; i--) {

      var itemE = items[i];
      // HAy items id que tienen anuncios
      if(itemE.id && itemE.id.match(/^[A-Z]{3}\d+/)){
        var currencyE = itemE.querySelector(".ch-price");
        if(!currencyE){
          currencyE =itemE.querySelector(".item__price");
        }
        namespace.total++;
        namespace.initTransformRequest(itemE.id, currencyE,currencyTo);
      }
    }

    console.log("Total: "+namespace.total);
    namespace.nanobar.go(0);
    namespace.max = namespace.total;
    setTimeout(waitFor,300);
  };
  /**/
  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    
    var data = request.data || {};
    if(data.action === "changeCurrency"){
      namespace.nanobar.go(0);
      selectedCurrency = data.currency_id;
      namespace.sendPriceChange(data.currency_id,sendResponse);
    }else if(data.action === "getSelectedCurrency"){
      sendResponse({currencyId:selectedCurrency});
    }
  });
  /**/
}(this.raeting));
