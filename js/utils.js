function executeRequest(url, success){
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