// include in all forms
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
var numberBool=false;

//include in all forms
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


	$(document).delegate('#Company_Category_Main__c', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//ensure this isn't a msp trial
			if(checkForMSP()){
				var selected_country=$('#countryTrial').val();
				if(selected_country=='Germany' || selected_country=='Austria' || selected_country=='France' || selected_country=='Italy' || selected_country=='Switzerland'){
					$("#distributor").prop("disabled", false);
					$("#distributor").parents('.mktoFormRow').slideDown(100);
				} else {
					$("#distributor").prop("disabled", true);
					$("#distributor").parents('.mktoFormRow').slideUp(100);
				}
			} else {
				//disable, empty, and hide the distributor-choice field
				$("#distributor").prop("disabled", true);
				$("#distributor").parents('.mktoFormRow').slideUp(100);
			}
		}
	});
	$(document).delegate('#countryTrial', "change", function() {
		//check for the existance of all the fields just in case
		if(checkForFields()){
			//ensure this isn't a msp trial
			if(checkForMSP()){
				var selected_country=$('#countryTrial').val();
				if(selected_country=='Germany' || selected_country=='Austria' || selected_country=='France' || selected_country=='Italy' || selected_country=='Switzerland'){
					$("#distributor").prop("disabled", false);
					$("#distributor").parents('.mktoFormRow').slideDown(100);
				} else {
					$("#distributor").prop("disabled", true);
					$("#distributor").parents('.mktoFormRow').slideUp(100);
				}
			} else {
				//disable, empty, and hide the distributor-choice field
				$("#distributor").prop("disabled", true);
				$("#distributor").parents('.mktoFormRow').slideUp(100);
			}
		}
	});
	function checkForMSP(){
		if($('#Company_Category_Main__c').length){
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
		} else {
			return true;
		}
	}
	function checkForFields(){
		//check for the random number fields existance
		if($('input[name=systemRandomNumber]').length){
			numberBool=true;
		}
		//check for the countryTrial fields existance
		if($('#countryTrial').length){
			countryBool=true;
		}
		//return true if all variables are true (meaning all the fields exist)
		if(countryBool && numberBool){
			return true;
		};
	}
});

