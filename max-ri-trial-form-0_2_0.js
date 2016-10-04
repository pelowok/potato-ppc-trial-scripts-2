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

var field_bool_1=false;
var field_bool_2=false;
var field_bool_3=false;
var field_bool_4=false;
var password_1;
var password_2;
var email;
var compareNumber;
var passwordGood=false;
var password1Touched=false;
var password2Touched=false;

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

MktoForms2.whenReady(function (form) {

	pushCookie();

	//generate random number for distributor mapping
	$('input[name=systemRandomNumber]').val(Math.floor(((Math.random()*10)/2)+1));

	startWithPass();

	form.onSubmit(function(form){

		pushCookie();

	});

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
		password_1=$('input[name=maxRIPassword1]').val();
		password_2=$('input[name=maxRIPassword2]').val();
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
			$('button[type=submit]').prop("disabled", false);
		//if password tested well but both fields aren't yet touched
		} else if(passwordGood  && password1Touched && !password2Touched){
			//console.log('password good but both fields not full');
			if($("div.password-errors").hasClass('bg-danger')){
				$("div.password-errors").removeClass('bg-danger');
				$("div.password-errors").addClass('bg-info');
			}
		//if password failed
		} else if(passwordGood===false){
			//console.log('password bad');
			//change password errors block to an error styling
			if($("div.password-errors").hasClass('bg-info')){
				$("div.password-errors").removeClass('bg-info');
				$("div.password-errors").addClass('bg-danger');
			}
		}
	}
	function startWithPass(){
		//generate random number for distributor mapping
		$('input[name=systemRandomNumber]').val(Math.floor(((Math.random()*10)/2)+1));
		//hide the password-errors row
		$("div.password-errors").parents('.mktoFormRow').hide();
		//disable the submit button
		$('button[type=submit]').prop("disabled", true);
		//set fields from cookies
		pushCookie();
	}

	function checkForFields(){
		//check for the random number fields existance
		if($('input[name=systemRandomNumber]').length){
			field_bool_1=true;
		}
		//check for the email fields existance
		if($('input[name=Email]').length){
			field_bool_4=true;
		}
		if(field_bool_1 && field_bool_4){
			return true;
		}
	}
	function checkForFieldsWithPass(){
		//check for the random number fields existance
		if($('input[name=systemRandomNumber]').length){
			field_bool_1=true;
		}
		//check for the password 1 fields existance
		if($('input[name=maxRIPassword1]').length){
			field_bool_2=true;
		}
		//check for the password 2 fields existance
		if($('input[name=maxRIPassword2]').length){
			field_bool_3=true;
		}
		//check for the email fields existance
		if($('input[name=Email]').length){
			field_bool_4=true;
		}
		if(field_bool_1 && field_bool_2 && field_bool_3 && field_bool_4){
			return true;
		}
	}

	//assign a focus event to the password 1 field
	$(document).delegate('input[name=maxRIPassword1]', "focus", function() {
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
	$(document).delegate('input[name=maxRIPassword2]', "focus", function() {
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
	$(document).delegate('input[name=maxRIPassword1]', "blur", function() {
		//if all fields exist
		if(checkForFields()){
			//change the field from text field to password field on blur so that the user was able to see what they entered but its not masked
			$('input[name=maxRIPassword1]').attr('type','password');
			//test password for required elements
			testPasswords();
		}
	});
	//assign a blur event to the password 2 field
	$(document).delegate('input[name=maxRIPassword2]', "blur", function() {
		//if all fields exist
		if(checkForFields()){
			//change the field from text field to password field on blur so that the user was able to see what they entered but its not masked
			$('input[name=maxRIPassword2]').attr('type','password');
			//test password for required elements
			testPasswords();
		}
	});

});

