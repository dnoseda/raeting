$(document).ready(function() {
$('#currency_converter input[type=text]').keyup(function() {  
  if(!isNaN(this.value)) { var current_value = this.value; } else {var current_value = "1"; }
  var current_index = $('#currency_converter input[type=text]').index(this);
  var current_price = 
  $('#currency_converter span').eq(current_index).text() ? $('#currency_converter span').eq(current_index).text() : '1';
    
  jQuery.each($('#currency_converter input[type=text]'), function(i, val) {
  if (i != current_index) {
     this_price = $('#currency_converter span').eq(i).text() ? $('#currency_converter span').eq(i).text() : '1';    
     val.value = (current_value * current_price / this_price).toFixed(2); }
      });  });
var urlx ="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.x-rates.com%2Ftable%2F%3Ffrom%3DUSD%26amount%3D1%22%20and%0A%20%20%20%20%20%20xpath%3D%27%2F%2F*%5B%40id%3D%22content%22%5D%2Fdiv%5B1%5D%2Fdiv%2Fdiv%5B1%5D%2Fdiv%5B1%5D%2Ftable%5B2%5D%2Ftbody%2Ftr%2Ftd%5B3%5D%2Fa%27&format=json&callback=";

$.ajax({    url: urlx,      dataType: 'json',  success: function(data) {
    if(data.query.results.a.length>5){
              for (var i=0;i<data.query.results.a.length;i++)   {
            var monval = parseFloat(data.query.results.a[i].content).toFixed(4);
            var monclassname = '#currency_converter .' + data.query.results.a[i].href.split("=")[1].split("&")[0].toLowerCase() + ' span';      
            if ($(monclassname) )   {$(monclassname).html(monval)}  $('#cuandoupt').html(getHoy)            
        } }}})


var getHoy = function () { var today = new Date();  var dd = today.getDate();  var mm = today.getMonth()+1; var yyyy = today.getFullYear();
  if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm}  today = '<span>Actualizado ' + dd+'/'+mm+'/'+yyyy + '</span>';   return today;
}
})