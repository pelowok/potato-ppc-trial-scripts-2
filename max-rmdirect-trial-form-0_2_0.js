// JavaScript Document

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

function getCookie(cookieName){
	var name=cookieName+"=";
	var ca=document.cookie.split(';');
	var i=0;
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

	pushCookie();

	//generate random number for distributor mapping
	$('input[name=systemRandomNumber]').val(Math.floor(((Math.random()*10)/2)+1));

	var strFormID = 'mktoForm_'+form.getId();

	form.onSubmit(function(form){

		pushCookie();

	});

	function checkForFields(){
		//check for the countryTrial fields existance
		if($('input[name="gGLCID"]').length){
			return true;
		}
	}
});
