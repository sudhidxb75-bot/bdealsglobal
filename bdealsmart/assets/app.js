
// BdealsMart country selector state handler
(function(){
  function initCountrySelector(){
    var selectors = document.querySelectorAll('.countrySelect');
    if(!selectors.length) return;
    var saved = localStorage.getItem('bdealsmartCountry') || selectors[0].value || 'India';
    selectors.forEach(function(select){
      var hasSaved = Array.prototype.some.call(select.options, function(opt){ return opt.value === saved || opt.text === saved; });
      if(hasSaved) select.value = saved;
      select.addEventListener('change', function(){
        localStorage.setItem('bdealsmartCountry', select.value);
        document.documentElement.setAttribute('data-country', select.value);
        window.dispatchEvent(new CustomEvent('bdealsmart-country-change', { detail:{ country: select.value } }));
      });
    });
    document.documentElement.setAttribute('data-country', saved);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCountrySelector);
  else initCountrySelector();
})();
