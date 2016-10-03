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

MktoForms2.whenReady(function (form) {

	//generate random number for distributor mapping
	$('input[name=systemRandomNumber]').val(Math.floor(((Math.random()*10)/2)+1));
	
	pushCookie();

	var strFormID = 'mktoForm_'+form.getId();

	form.onSubmit(function(form){

		pushCookie();

	});

	$(document).delegate('button[type=submit]', "click", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//set values of hiden fields to the values of the shown fields
			$('input[name=referrerCode]').val($("#referrer-code").val());
		}
	});
	$(document).delegate('#countryTrial', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//get the value of the country field
			var selected_country=$('#countryTrial').val();
			if(['ar','bo','cl','co','cr','do','ec','es','gt','hn','mx','ni','pa','pe','pr','py','sv','uy','ve'].indexOf(selected_country)!==-1){
				$('input[name=language]').val('es');
			} else {
				$('input[name=language]').val('en');
			}
		}
	});
	$(document).delegate('input[name=referrerCodeCheckbox]', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//show referred code box if checkbox is checked
			if($(this).is(':checked')) {
				$("#referrer-code").parents('.mktoFormRow').slideDown(100);
			} else {
				//hide box if not checked, and clear text field value
				$("#referrer-code").parents('.mktoFormRow').slideUp(100);
				$("#referrer-code").val('');
			}
		}
	});
	$(document).delegate('#referrer-code', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//set values of hidden fields to the values of the shown fields
			$('input[name=distributor]').val($("#distributor-choice").val());
			$('input[name=referrerCode]').val($("#referrer-code").val());
		}
	});
	function checkForFields(){
		//check for the countryTrial fields existance
		if($('#countryTrial').length){
			countryBool=true;
		}
		//check for the language fields existance
		if($('input[name=language]').length){
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
		if(countryBool && languageBool && referrerCheckboxBool && referrerBool){
			return true;
		};
	}
});