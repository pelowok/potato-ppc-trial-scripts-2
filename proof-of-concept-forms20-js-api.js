if (typeof jQuery === 'undefined') {
	throw new Error('Form JavaScript requires jQuery');
}
+function ($) {
	'use strict';
	var version = $.fn.jquery.split(' ')[0].split('.')
	if ((version[0] > 1) || (version[0] == 1 && version[1] < 4) || (version[0] == 1 && version[1] == 4 && version[2] < 3)) {
		throw new Error('Form JavaScript requires jQuery version 1.4.3 or higher, but lower than version 2');
	}
}(jQuery);

var countryBool=false;
var languageBool=false;
var referrerCheckboxBool=false;
var referrerBool=false;
var categoryBool=false;
var formLanguage='default';
var message01='message01';
var message02='message02';

function getCookie(cookieName){
	var i=0;
	var name=cookieName+"=";
	var ca=document.cookie.split(';');
	for(var i=0; i<ca.length; i++){
		var c=ca[i];
		while(c.charAt(0)==' '){
			c=c.substring(1);
		}
		if(c.indexOf(name)==0){
			var value=decodeURIComponent(c.substring(name.length,c.length));
			return value.replace(/\+/g," ");
		}
	}
	return "";
}

function setCookie(cn,cv,ex){
	var d=new Date();
	d.setTime(d.getTime() + (ex*24*60*60*100));
	var expires="expires="+d.toUTCString();
	document.cookie=cn+"="+cv+"; "+expires;
}

function pushCookie(){
	var i=0;
	var fields=[
		['gGLCID','_ga'],
		['gaClientId__c','_ga'],
		['Campaign_Marketo__c','campaign'],
		['utm_campaign','utm_campaign'],
		['LeadSource','utm_medium'],
		['Lead_Source_Detail__c','utm_source'],
		['loc','loc'],
		['adv','adv'],
		['cPID','cPID'],
		['keywords','keywords']
	];
	for(i=0; i<fields.length; i++){
		if($('input[name="'+fields[i][0]+'"]').length>0){
			if($('input[name="'+fields[i][0]+'"]').val()===""){
				if(getCookie(fields[i][1])!==""){
					$('input[name="'+fields[i][0]+'"]').val(getCookie(fields[i][1]));
				}
			}
		}
	}
}

function getMessageString(str) {
	var lang='';
    switch(str){
    	case 'Country (select)':
    		lang='EN';
    		message01='Choose a Distributor';
    		message02='No Preference';
    		message03='Preferred Language (select)';
    		break;
    	case 'País (Selecione)':
    		lang='PT';
    		message01='Escolha um Distribuidor';
    		message02='Nenhuma preferência';
    		message03='Língua Preferida (Selecione)';
    		break;
    	case 'País (seleccionar)':
    		lang='ES';
    		message01='Elegir un Distribuidor';
    		message02='Sin preferencias';
    		message03='Idioma preferido (seleccionar)';
    		break;
    	case 'Pays (sélectionner)':
    		lang='FR';
    		message01='Choisissez un distributeur';
    		message02='Pas de préférence';
    		message03='Langue préférée';
    		break;
    	case 'Land (Auswahl)':
    		lang='DE';
    		message01='Wählen Sie einen Händler';
    		message02='Keine Präferenz';
    		message03='Bevorzugte Sprache';
    		break;
    	case 'Land (selecteer)':
    		lang='NL';
    		message01='Kies een distributeur';
    		message02='Geen voorkeur';
    		message03='Voorkeurstaal';
    		break;
    	case 'Paese (seleziona)':
    		lang='IT';
    		message01='Scegli un Distributore';
    		message02='Nessuna preferenza';
    		message03='Lingua preferita';
    		break;
    	default:
    		lang='EN';
    		message01='Choose a Distributor';
    		message02='No Preference';
    		message03='Preferred Language (select)';
    		break;
    }
    return lang;
}

MktoForms2.whenReady(function (form) {

	//generate random number for distributor mapping
	$('input[name=systemRandomNumber]').val(Math.floor(((Math.random()*10)/2)+1));
	
	// Get the dynamic field value for the language the form is using.
	// Use this value to switch/case the hard-code the values for showDistributorList() function
	var e = document.getElementById("countryTrial");
	formLanguage = getMessageString(e.options[e.selectedIndex].text);

	pushCookie();

	form.onSubmit(function(form){

		pushCookie();

	});


	function showDistributorList(distributors) {
		var distributorsBox=$("#distributor-choice").get(0);
		// remove all previous dropdown box options
		distributorsBox.options.length=0;
		var option_count=0;
		if ((distributors===undefined) || (distributors.length===0)) {
			// Don't show distributor list when there are no distributors
			$("#distributor-choice").parents('.mktoFormRow').slideUp(100);
			distributorsBox.value=0;
		} else {
			// Don't show distributor list for a single distributor
			if (distributors.length===1) {
				$("#distributor-choice").parents('.mktoFormRow').slideUp(100);
			} else {
				// For > 1 distributor, show distributor list
				$("#distributor-choice").parents('.mktoFormRow').slideDown(100);
				option_count=2;
			}
			// Fill with options from the distributor list
			for(var distributorIndex=0; (distributorIndex)<distributors.length; distributorIndex++){
				if (distributors[distributorIndex].distributor!=='other') {
					distributorsBox.options[distributorIndex+option_count]=new Option(
						distributors[distributorIndex].distributor, // label
						distributors[distributorIndex].code // value
					);
				} else {
					// Set no preference to 'other', returned from the product
					// assign variable based on language
					distributorsBox.options[0]=new Option(message01, distributors[distributorIndex].code);
					distributorsBox.options[1]=new Option(message02, distributors[distributorIndex].code);
				}
			}
			distributorsBox.selectedIndex=0;
		}
	}
	function refreshDistributorList(country_code, language_code) {
		//build url using country and language values
		var query="country="+country_code+"&language="+language_code;
		var distributorsURL="https://wwweurope1.systemmonitor.eu.com/siteforms/distributors.php?"+query+"&jsoncallback=?";
		//get json from above url
		$.getJSON(distributorsURL,function(json){
			//show the new list of distributors
			showDistributorList(json);
			console.log(json);
		});
	}
	$(document).delegate('button[type=submit]', "click", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//check if this is a direct trial or an MSP trial, don't proceed if direct
			if(checkForMSP()){
				//set values of hidden fields to the values of the shown fields
				$('input[name=distributor]').val($("#distributor-choice").val());
				$('input[name=referrerCode]').val($("#referrer-code").val());
			} else {
				//set values of hidden fields to blank
				$('input[name=distributor]').val('');
				$('input[name=referrerCode]').val('');
			}
		}
	});
	$(document).delegate('#countryTrial', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//check if this is a direct trial or an MSP trial, don't proceed if direct
			if(checkForMSP()){
				//get the value of the country field
				var selected_country=$('#countryTrial').val();
				if(['eu','ch','be'].indexOf(selected_country)!==-1){
					$('#language').val('');
					$("#language").parents('.mktoFormRow').slideDown(100);
				} else if(['de','au'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('de');
				} else if(['fr'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('fr');
				} else if(['it'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('it');
				} else if(['es','ar','cl','co','ec','pe','py','bo','uy','ve','mx','cr','do','gt','hn','ni','pa','pr','sv'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('es');
				} else {
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('en');
				}
				//get the value of the language field
				var selected_lang=$('#language').val();
				if(selected_country!='' && selected_lang!=''){
					//refresh the distributor list
					refreshDistributorList(selected_country, selected_lang);
				}
			} else {
				var selected_country=$('#countryTrial').val();
				if(['eu','ch','be'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('en');
				} else if(['de','au'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('de');
				} else if(['fr'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('fr');
				} else if(['it'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('it');
				} else if(['es','ar','cl','co','ec','pe','py','bo','uy','ve','mx','cr','do','gt','hn','ni','pa','pr','sv'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('es');
				} else {
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('en');
				}
			}
		}
	});
	$(document).delegate('#language', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//check if this is a direct trial or an MSP trial, don't proceed if direct
			if(checkForMSP()){
				//get the value of the country field
				var selected_country=$('#countryTrial').val();
				//get the value of the language field
				var selected_lang=$('#language').val();
				if(selected_country!='' && selected_lang!=''){
					//refresh the distributor list
					refreshDistributorList(selected_country, selected_lang);
				}
			}
		}
	});
	$(document).delegate('input[name=referrerCodeCheckbox]', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//check if this is a direct trial or an MSP trial, don't proceed if direct
			if(checkForMSP()){
				//show referred code box if checkbox is checked
				if($(this).is(':checked')) {
					$("#referrer-code").parents('.mktoFormRow').slideDown(100);
				} else {
					//hide box if not checked, and clear text field value
					$("#referrer-code").parents('.mktoFormRow').slideUp(100);
					$("#referrer-code").val('');
				}
			}
		}
	});
	$(document).delegate('#distributor-choice', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//check if this is a direct trial or an MSP trial, don't proceed if direct
			if(checkForMSP()){
				//set values of hidden fields to the values of the shown fields
				$('input[name=distributor]').val($("#distributor-choice").val());
				$('input[name=referrerCode]').val($("#referrer-code").val());
			} else {
				//set values of hidden fields to blank
				$('input[name=distributor]').val('');
				$('input[name=referrerCode]').val('');
			}
		}
	});
	$(document).delegate('#referrer-code', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//check if this is a direct trial or an MSP trial, don't proceed if direct
			if(checkForMSP()){
				//set values of hidden fields to the values of the shown fields
				$('input[name=distributor]').val($("#distributor-choice").val());
				$('input[name=referrerCode]').val($("#referrer-code").val());
			} else {
				//set values of hidden fields to blank
				$('input[name=distributor]').val('');
				$('input[name=referrerCode]').val('');
			}
		}
	});
	$(document).delegate('#Company_Category_Main__c', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){

			var category=$('#Company_Category_Main__c').val();
	    	if(category=="MSP" || category=="Reseller"){
			     //get the value of the country field
			     var selected_country=$('#countryTrial').val();
			     //get the value of the language field
			     var selected_lang=$('#language').val();
			     if(selected_country!='' && selected_lang!=''){
				      //refresh the distributor list
				      refreshDistributorList(selected_country, selected_lang);
			     }
		    }

			//ensure this isn't a msp trial
			if(checkForMSP()){
				//disable and hide the referrrerCodeCheckbox field
				$("#referrer-code").prop("disabled", false);
				$("#distributor-choice").prop("disabled", false);
				$("input[name=referrerCodeCheckbox]").prop("disabled", false);
				$("input[name=referrerCodeCheckbox]").parents('.mktoFormRow').slideDown(100);
				//get the value of the country field
				var selected_country=$('#countryTrial').val();
				if(['eu','ch','be'].indexOf(selected_country)!==-1){
					$('#language').val('');
					$("#language").parents('.mktoFormRow').slideDown(100);
				} else if(['de','au'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('de');
				} else if(['fr'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('fr');
				} else if(['it'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('it');
				} else if(['es','ar','cl','co','ec','pe','py','bo','uy','ve','mx','cr','do','gt','hn','ni','pa','pr','sv'].indexOf(selected_country)!==-1){
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('es');
				} else {
					$("#language").parents('.mktoFormRow').slideUp(100);
					$('#language').val('en');
				}
				//get the value of the language field
				var selected_lang=$('#language').val();
				if(selected_country!='' && selected_lang!=''){
					//refresh the distributor list
					refreshDistributorList(selected_country, selected_lang);
				}
			} else {
				//disable, empty, and hide the distributor-choice field
				$("#distributor-choice").val('');
				$("#distributor-choice").prop("disabled", true);
				$("#distributor-choice").parents('.mktoFormRow').slideUp(100);
				//disable, empty, and hide the referred-code field
				$("#referrer-code").val('');
				$("#referrer-code").prop("disabled", true);
				$("#referrer-code").parents('.mktoFormRow').slideUp(100);
				//disable and hide the referrrerCodeCheckbox field
				$("input[name=referrerCodeCheckbox]").val('');
				$("input[name=referrerCodeCheckbox]").prop("disabled", true);
				$("input[name=referrerCodeCheckbox]").parents('.mktoFormRow').slideUp(100);
				//set language value to 'en'
				$('#language').val('en');
				//hide language field
				$("#language").parents('.mktoFormRow').slideUp(100);
			}
		}
	});

	function checkForMSP(){
		var selected_category=$('#Company_Category_Main__c').val();
		if(selected_category==''){
			return false;
		} else if(selected_category=='End Customer'){
			//return false because this is a direct trial
			return false;
		} else {
			//return true because this must be an MSP based trial
			return true;
		}
	}
	function checkForFields(){
		//check for the countryTrial fields existance
		if($('#Company_Category_Main__c').length){
			categoryBool=true;
		}
		//check for the countryTrial fields existance
		if($('#countryTrial').length){
			countryBool=true;
		}
		//check for the language fields existance
		if($('#language').length){
			languageBool=true;
		}
		//check for the referrerCodeCheckbox fields existance
		if($('input[name=referrerCodeCheckbox]').length){
			referrerCheckboxBool=true;
		}
		//check for the referrer-code fields existance
		if($('#referrer-code').length){
			referrerBool=true;
		}
		//return true if all variables are true (meaning all the fields exist)
		if(countryBool && languageBool && referrerCheckboxBool && referrerBool && categoryBool){
			return true;
		};
	}
	//disable and hide the distributor-choice field
	$("#distributor-choice").parents('.mktoFormRow').hide();
	//disable and hide the referred-code field
	$("#referrer-code").parents('.mktoFormRow').hide();
	//disable and hide the referrrerCodeCheckbox field
	$("input[name=referrerCodeCheckbox]").parents('.mktoFormRow').hide();
	//set language value to 'en'
	$('#language').val('en');
	//hide language field
	$("#language").parents('.mktoFormRow').hide();

});






