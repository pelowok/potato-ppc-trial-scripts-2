// JavaScript Document

if (typeof jQuery === 'undefined') {
	throw new Error('Form JavaScript requires jQuery')
}
+function ($) {
	'use strict';
	var version = $.fn.jquery.split(' ')[0].split('.')
	if ((version[0] > 1) || (version[0] == 1 && version[1] < 4) || (version[0] == 1 && version[1] == 4 && version[2] < 3)) {
		throw new Error('Form JavaScript requires jQuery version 1.4.3 or higher, but lower than version 2')
	}
}(jQuery);


var field_bool_1=false;
var field_bool_2=false;
var field_bool_3=false;
var field_bool_4=false;
var field_bool_5=false;
var field_bool_6=false;
var field_bool_7=false;
var field_bool_8=false;
var password_1;
var password_2;
var email;
var compareNumber;
var passwordGood=false;
var password1Touched=false;
var password2Touched=false;
var passwordsConfirmed=false;
var distributorsConfirmed=false;
var sessionid;
var i=0;
var encodedString=btoa('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
var str=encodedString.slice(0,24);
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

	pushCookie();

	//generate random number for distributor mapping
	$('input[name=systemRandomNumber]').val(Math.floor(((Math.random()*10)/2)+1));

	// Get the dynamic field value for the language the form is using.
	// Use this value to switch/case the hard-code the values for showDistributorList() function
	var e = document.getElementById("countryTrial");
	formLanguage = getMessageString(e.options[e.selectedIndex].text);

	form.onSubmit(function(form){

		pushCookie();

	});

	//hide the password-errors row
	$("div.password-errors").parents('.mktoFormRow').hide();
	//hide the distributor field
	$("#distributor-choice").parents('.mktoFormRow').hide();
	//disable the submit button
	$('button[type=submit]').prop("disabled", true);
	$.get('https://signup.smtproutes.com/signupchk/id?callback=logicnow_'+str, function(data){
		sessionid=data.slice(34,str.lastIndexOf(')'));
		$('input[name=maxMailSessionID]').val(sessionid);
	},'text');
	var selected_country=$('#countryTrial').val();
	if(selected_country!=''){
		//refresh the distributor list
		refreshDistributorList(selected_country);
	}

	function getRandomIntInclusive(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function showDistributorList(distributors,selectedCountry){
		//get the distributor box
		var distributorsBox=$("#distributor-choice").get(0);
		//disable the distributor field
		$("#distributor-choice").prop("disabled", true);
		//clear out data from real distributor field
		$('input[name=distributor]').val('');
		//clear out existing selects
		distributorsBox.options.length=0;
		if((distributors===undefined) || (distributors.length===0)){
			// Don't show distributor list when there are no distributors
			$("#distributor-choice").parents('.mktoFormRow').slideUp(100);
			distributorsBox.value=0;
			distributorsConfirmed=true;
			SubmitButton();
		} else {
			//run through an array to neatly set the distributor information for the chosen country
			var distributorArray=[];
			var int=0;
			$.each(distributors, function(i,items){
				$.each(items.countries, function(j,country){
					if(country===selectedCountry){
						distributorArray[int]=[];
						distributorArray[int][0]=items.value;
						distributorArray[int][1]=items.displayName;
						int++;
					}
				});
			});
			if(distributorArray.length===0) {
				//if no distributors are available for the current country, set distributor to nothing
				$("#distributor-choice").parents('.mktoFormRow').slideUp(100);
				distributorsBox.value=0;
				distributorsConfirmed=true;
				SubmitButton();
			} else if (distributorArray.length===1) {
				//if only 1 distributor is available, choose it
				$("#distributor-choice").parents('.mktoFormRow').slideUp(100);
				distributorsBox.value=1;
				$('input[name=distributor]').val(distributorArray[0][0]);
				distributorsConfirmed=true;
				SubmitButton();
			} else {
				// For > 1 distributor, show distributor list
				//choose 1 at random
				var rand=getRandomIntInclusive(0, (distributorArray.length-1));
				//setup label
				distributorsBox.options[0]=new Option(message01, '');
				//setup random
				distributorsBox.options[1]=new Option(message02, distributorArray[rand][0]);
				//add all distributors
				$.each(distributorArray, function(k,distrib){
					distributorsBox.options[k+2]=new Option(distrib[1],distrib[0]);
				});
				//enable field
				$("#distributor-choice").prop("disabled", false);
				//show field
				$("#distributor-choice").parents('.mktoFormRow').slideDown(100);
				distributorsConfirmed=false;
			}
		}
	}
	function refreshDistributorList(country) {
		//specifiy url for distributor list
		var distributorsURL="https://signup.smtproutes.com/signupchk/dstcountries?bu=MAX";
		//get json from above url
		$.getJSON(distributorsURL,function(json){
			//show the new list of distributors
			showDistributorList(json,country);
		});
	}
	//compare 2 strings function (from drupal js)
	function similar_text(first, second, percent) {
		/**  
		 * discuss at: http://phpjs.org/functions/similar_text/
		 * original by: RafaÅ‚ Kukawski (http://blog.kukawski.pl)
		 * bugfixed by: Chris McMacken
		 * bugfixed by: Jarkko Rantavuori original by findings in stackoverflow 
		 *   (http://stackoverflow.com/questions/14136349/how-does-similar-text-work)
		 * improved by: Markus Padourek (taken from 
		 *   http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
		 * example 1: similar_text('Hello World!', 'Hello phpjs!');
		 *   returns 1: 7
		 * example 2: similar_text('Hello World!', null);
		 *   returns 2: 0
		 */

		if (first === null || second === null || typeof first === 'undefined' || typeof second === 'undefined') {
			return 0;
		}

		first += '';
		second += '';

		var pos1 = 0,
			pos2 = 0,
			max = 0,
			firstLength = first.length,
			secondLength = second.length,
			p, q, l, sum;

		max = 0;

		for (p = 0; p < firstLength; p++) {
			for (q = 0; q < secondLength; q++) {
				for (l = 0;
					 (p + l < firstLength) && 
					   (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++);
				if (l > max) {
					max = l;
					pos1 = p;
					pos2 = q;
				}
			}
		}

		sum = max;

		if (sum) {
			if (pos1 && pos2) {
				sum += this.similar_text(first.substr(0, pos1), second.substr(0, pos2), 0);
			}

			if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
				sum += this.similar_text(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max,
					secondLength - pos2 - max));
			}
		}

		if (!percent) {
			return sum;
		} 
		else {
			return (sum * 200) / (firstLength + secondLength);
		}
	}
	function testPasswords(){
		//set various variables for later use
		var spaceBool=false;
		var numberBool=false;
		var specialBool=false;
		var capitalBool=false;
		var lowerBool=false;
		var j=0;
		var character='';
		//set as true so that if no tests assign a false value the password is good
		passwordGood=true;
		//get passwords from fields
		password_1=$('input[name=maxmailpassword]').val();
		password_2=$('input[name=maxmailconfirmpassword]').val();
		email=$('input[name=Email]').val();
		//if passwords are not equal to eachother AND both password fields have been touched
		if(password_1!==password_2  && password1Touched && password2Touched){
			//does not match
			passwordGood=false;
			//console.log('not equal: '+password_1+' != '+password_2);
		}
		//FROM HERE FORWARD: since password fields are both required, and once both passwords have been touched the previous statement will test that the passwords are identical, only password 1 is needing tested
		//check password for minimum length
		if (password_1.length < 8) {
			//too short
			passwordGood=false;
			//console.log('too short');
		}
		//test password does not exceed maximum length
		if (password_1.length > 32) {
			//too long
			passwordGood=false;
			//console.log('too long');
		}
		//test that password is not too similar to email address
		compareNumber=similar_text(password_1, email, true);
		if(compareNumber > 90){
			//too similar to email
			passwordGood=false;
			//console.log('too similar to email: '+compareNumber+' '+password_1+' '+email);
		}
		//loop through each character of the password
		while (j < password_1.length){
			//get the specific character
			character = password_1.charAt(j);
			//is character a space?
			if(character===' '){
				//mark space boolean as true to note the existance of a space
				spaceBool=true;
				//and fail
				passwordGood=false;
				//console.log('has space');
			//is character a number
			}else if (!isNaN(character)){
				//mark number boolean as true to note the existance of a number
				numberBool=true;
			} else {
				//if the uppercase value of a character and the lowercase value of a character both equal the character itself while not being a number or space, then character is special
				if (character===character.toUpperCase() && character===character.toLowerCase()){
					//mark special character boolean as true to note the existance of a special character
					specialBool=true;
				//if character is equal to its uppercase form, then its uppercase as well
				} else if(character===character.toUpperCase() && character!==character.toLowerCase()){
					//mark uppercase boolean as true to note the existance of a uppercase letter
					capitalBool=true;
				//if a character is equal to its lowercase form, then its lowercase as well
				} else if(character!==character.toUpperCase() && character===character.toLowerCase()){
					//mark lowercase boolean as true to note the existance of a lowercase letter
					lowerBool=true;
				}
			}
			j++;
		}
		//if space exists or number doesnt or special doesnt or capital doesnt or lower doesnt, then fail
		if(spaceBool===true || numberBool===false || specialBool===false || capitalBool===false || lowerBool===false){
			passwordGood=false;
			//console.log('missing character or has space');
		}
		//if password passed all test and both fields have been touched, we are all done
		if(passwordGood && password1Touched && password2Touched){
			//console.log('password good and both fields full');
			//remove any error styling and hide password errors block
			if($("div.password-errors").hasClass('bg-danger')){
				$("div.password-errors").removeClass('bg-danger');
				$("div.password-errors").addClass('bg-info');
			}
			$("div.password-errors").parents('.mktoFormRow').slideUp(100);
			//enable submit button
			passwordsConfirmed=true;
			SubmitButton();
		//if password tested well but both fields aren't yet touched
		} else if(passwordGood  && password1Touched && !password2Touched){
			//console.log('password good but both fields not full');
			if($("div.password-errors").hasClass('bg-danger')){
				$("div.password-errors").removeClass('bg-danger');
				$("div.password-errors").addClass('bg-info');
			}
			passwordsConfirmed=false;
		//if password failed
		} else if(passwordGood===false){
			//console.log('password bad');
			//change password errors block to an error styling
			if($("div.password-errors").hasClass('bg-info')){
				$("div.password-errors").removeClass('bg-info');
				$("div.password-errors").addClass('bg-danger');
			}
			passwordsConfirmed=false;
		}
	}
		
	function checkForFields(){
		//check for the random number fields existance
		if($('input[name=systemRandomNumber]').length){
			field_bool_1=true;
		}
		//check for the password 1 fields existance
		if($('input[name=maxmailpassword]').length){
			field_bool_2=true;
		}
		//check for the password 2 fields existance
		if($('input[name=maxmailconfirmpassword]').length){
			field_bool_3=true;
		}
		//check for the email fields existance
		if($('input[name=Email]').length){
			field_bool_4=true;
		}
		//check for the session id field existance
		if($('input[name=maxMailSessionID]').length){
			field_bool_5=true;
		}
		//check for the session id field existance
		if($('select[name=countryTrial]').length){
			field_bool_6=true;
		}
		//check for the session id field existance
		if($('select[name=distributor_choice]').length){
			field_bool_7=true;
		}
		//check for the session id field existance
		if($('input[name=distributor]').length){
			field_bool_8=true;
		}
		if(field_bool_1 && field_bool_2 && field_bool_3 && field_bool_4 && field_bool_5 && field_bool_6 && field_bool_7 && field_bool_8){
			return true;
		}
	}
	function SubmitButton(){
		if(passwordsConfirmed && distributorsConfirmed){
			$('button[type=submit]').prop("disabled", false);
		} else {
			$('button[type=submit]').prop("disabled", true);
		}
	}
	
	//assign a focus event to the password 1 field
	$(document).delegate('input[name=maxmailpassword]', "focus", function() {
		//if all fields exist
		if(checkForFields()){
			//disable the submit button in case the passwords were already approved but are now being changed
			$('button[type=submit]').prop("disabled", true);
			//mark password 1 as having been touched by the user
			password1Touched=true;
			//show password errors block
			$("div.password-errors").parents('.mktoFormRow').slideDown(100);
		}
	});
	//assign a focus event to the password 2 field
	$(document).delegate('input[name=maxmailconfirmpassword]', "focus", function() {
		//if all fields exist
		if(checkForFields()){
			//disable the submit button in case the passwords were already approved but are now being changed
			$('button[type=submit]').prop("disabled", true);
			//mark password 2 as having been touched by the user
			password2Touched=true;
			//show password errors block
			$("div.password-errors").parents('.mktoFormRow').slideDown(100);
		}
	});
	//assign a blur event to the password 1 field
	$(document).delegate('input[name=maxmailpassword]', "blur", function() {
		//if all fields exist
		if(checkForFields()){
			//change the field from text field to password field on blur so that the user was able to see what they entered but its not masked
			$('input[name=maxmailpassword]').attr('type','password');
			//test password for required elements
			testPasswords();
		}
	});
	//assign a blur event to the password 2 field
	$(document).delegate('input[name=maxmailconfirmpassword]', "blur", function() {
		//if all fields exist
		if(checkForFields()){
			//change the field from text field to password field on blur so that the user was able to see what they entered but its not masked
			$('input[name=maxmailconfirmpassword]').attr('type','password');
			//test password for required elements
			testPasswords();
		}
	});
	//assign a blur event to the password 2 field
	$(document).delegate('input[name=maxmailconfirmpassword]', "blur", function() {
		//if all fields exist
		if(checkForFields()){
			//change the field from text field to password field on blur so that the user was able to see what they entered but its not masked
			$('input[name=maxmailconfirmpassword]').attr('type','password');
			//test password for required elements
			testPasswords();
		}
	});
	//assign a change event to the countryTrial field
	$(document).delegate('#countryTrial', "change", function() {
		//if all fields exist
		if(checkForFields()){
			//get the value of the country field
			var selected_country=$('#countryTrial').val();
			if(selected_country!=''){
				//refresh the distributor list
				refreshDistributorList(selected_country);
			}
		}
	});
	//assign a change event to the distributor_choice field
	$(document).delegate('select[name=distributor_choice]', "change", function() {
		//if all fields exist
		if(checkForFields()){
			var selected_distributor=$('select[name=distributor_choice]').val();
			if(selected_distributor!=''){
				$('input[name=distributor]').val(selected_distributor);
				distributorsConfirmed=true;
				SubmitButton();
			} else {
				$('input[name=distributor]').val('');
			}
			
		}
	});
	
});