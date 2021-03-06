var $ = jQuery.noConflict();

function safelog(data) {if(console){console.log(data)}}
/** 
 * @param link
 * @return the jQuery selector to use in finding the checkboxes we are attempting to manipulate
 */
function find_matching_checkboxes(link) {

	var module = $(link)
								.parent('td')
								.parent('tr')
								.children('td.module_name')
								.attr('id');
	safelog('module name to modify: '+module);
	var ctd = $(link).parent('td');
	// get the index of the current column
	var col_index = $('tr.'+module+' td').index(ctd);
	col_index++;
	return 'td.'+module+':nth-child('+col_index+') input:checkbox';
}

$(document).ready(function(){

  // get number of columns we will need to manipulate & add 
  // select / unselect options for each module header row
  var roles = $('#permissions > thead > tr > th.checkbox');
  var role_count = roles.size();
  
  // take off the stupid colspan from the module header row, because we 
  // will be matching up to the other rows perfectly now
  $('td.module').removeAttr('colspan');
  
  // needed to add in a defining class or id to the parent TR in 
  // order to have a reference to grab a proper index for the links
  // being clicked.
  $('td.module').each(function(){
    var module_id = $(this).attr('id');
    $(this)
    	.parent('tr')
    	.addClass(module_id+' module_parent')
    	.attr('rel', module_id);
  });
  
  // cycle how many roles we have and insert that many columns worth of 
  // select / deselect options
  $(roles).each(function(){
	  $('td.module')
	   		.after('<td class="pselect"><a href="#" class="check">check all</a>&nbsp;/&nbsp;<a href="#" class="uncheck">uncheck all</a></td>');
	  });

  // give the new boxes the module class to preserve styling of the row
  $('td.pselect').addClass('module');

  // clicky 
  $('a.check').click(function(){
	var check_it = find_matching_checkboxes(this);
	safelog(check_it);
	$(check_it).attr('checked', true);
	return false;	
  });
  $('a.uncheck').click(function(){
	var uncheck_it = find_matching_checkboxes(this);
	$(uncheck_it).attr('checked', false);
	return false;	
  });  
	
	$('a.rcheck').click(function(){
	var check_it = $(this).parent('li').children('span.role').attr('id');
	$('td.'+check_it+' input:checkbox').attr('checked', true);
	return false;	
  });
	$('a.runcheck').click(function(){
	var check_it = $(this).parent('li').children('span.role').attr('id');
	$('td.'+check_it+' input:checkbox').attr('checked', false);
	return false;	
  });
	
});
