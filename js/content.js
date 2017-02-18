(function(exports){

  var raeting = this.raeting||{};
  
  exports.raeting = raeting;
  
}(this));

(function(namespace){

  var _cache = {};
  namespace.executeRequest= function (url, success){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Accept', '*/*');

    request.onload = function(){
      var json = JSON.parse(request.responseText);
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

    if(!_cache.conversions){
      _cache.conversions = {};
    }
    var conversionKey = from+"-"+to;
    if(_cache.conversions[conversionKey]){
      callback(_cache.conversions[conversionKey]);
    }else{
      namespace.executeRequest("https://api.mercadolibre.com/currency_conversions/search?from="+from+"&to="+to, function(data){

        if(typeof data.ratio != "undefined"){            

          _cache.conversions[conversionKey] = data.ratio;
          callback(data.ratio);
        }
      });
    }

  }

  namespace.initTransformRequest= function (itemId, itemPriceElement, currencyTo){

    if(!_cache.items){
      _cache.items = {};
    }

    function refreshPrice(data){
      if(!_cache.items[itemId]){
        _cache.items[itemId]= data;
      } 
      if(data.currency_id && data.currency_id !== currencyTo){
        namespace.getCurrencyRate(data.currency_id, currencyTo, function(rate){
                var newPrice = (data.price * rate).toFixed(2); //TODO: contemplar decimalPoint, separators,etc
                itemPriceElement.innerHTML = newPrice + " (" +currencyTo+ ")";
              });
      }
    }

    if(_cache.items[itemId]){
      refreshPrice(_cache.items[itemId]);
    }else{
      namespace.executeRequest("https://api.mercadolibre.com/items/"+itemId+"?attributes=id,price,currency_id", refreshPrice);
    }
  }

  namespace.sendPriceChange= function (currencyTo){
    var items = document.querySelectorAll(".rowItem");
    for (var i = items.length - 1; i >= 0; i--) {
      var itemE = items[i];
      var currencyE = itemE.querySelector(".ch-price");
      namespace.initTransformRequest(itemE.id, currencyE,currencyTo);
    }
  };
  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("something happening from the extension");
    var data = request.data || {};
    console.log("DATA:");
    console.log(data);
    if(data.action === "changeCurrency"){
      namespace.sendPriceChange(data.currency_id);
    }
  });
}(this.raeting));
