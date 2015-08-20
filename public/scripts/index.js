var agenda = {
  selected: 1,
  days: [new Day(),
          new Day(),
          new Day()]
};

$(document).ready(function(){
  $('#activity-panel').on('click','button',function(){
    var activity_type = $(this).attr("data-type");
    var activity_name = $(this).prev().val();
    if(activity_type=='hotel'){
      $('ul.'+activity_type).html('');
      agenda.days[agenda.selected].hotel=[activity_name];
    }else{
       var arr = $('ul.'+activity_type+' span').toArray();
       if(arr.some(function(span){
        return $(span).text() === activity_name;
       })) return;
      agenda.days[agenda.selected][activity_type].push(activity_name);
    }
    $('ul.'+activity_type).append($(genNewAddition(activity_name,activity_type)));
  });

  $('#add-day').on('click',function(){
    agenda.days.push(new Day());
    $(this).before('<button class="btn btn-circle day-btn day">'
                   +(agenda.days.length)+'</button>');
  });

  $('#agenda-panel .panel-body').on('click','button',function(){
    $(this).parent().remove();
    var type = $(this).attr('data-type');
    var arr = agenda.days[agenda.selected][type];
    var i = arr.indexOf($(this).prev().text());
    agenda.days[agenda.selected][type] =
      arr.slice(0,i).concat(arr.slice(i+1));
  });

  $('.day-buttons').on('click','.day',function(){
    $('.day-buttons .current-day').removeClass('current-day');
    $(this).addClass('current-day');
    agenda.selected = Number($(this).text())-1;
    $('#day-title span').text('Day '+(agenda.selected+1));
    updateDay();
  });

  $('#day-title').on('click','button',function(){
    if(agenda.days.length===1){
      for(var key in agenda.days[agenda.selected]){
        $('#agenda-panel .'+key).html('');
      }
      return;
    }

    $('#add-day').prev().remove();


    if(agenda.selected===agenda.days.length-1){
      $('#add-day').prev().addClass('current-day');
      $(this).prev().text('Day '+agenda.selected);
      agenda.selected--;
      agenda.days.pop();
    }else{
      agenda.days=agenda.days.slice(0,agenda.selected)
                .concat(agenda.days.slice(agenda.selected+1));
    }

    console.log("update");
    updateDay();
  });
});

function genNewAddition(name,type){
  return '<div class="itinerary-item"><span class="title">'+name+
    '</span><button class="btn btn-xs btn-danger remove btn-circle" data-type="'+type+'">x</button></div>';
}

function updateDay(){
  for(var key in agenda.days[agenda.selected]){
    var html = '';
    agenda.days[agenda.selected][key].forEach(function(name){
      html+=genNewAddition(name,key);
    });
    $('#agenda-panel .'+key).html(html);
  }
}

function Day(){
  this.hotel = [];
  this.restaurant = [];
  this.activity = [];
}