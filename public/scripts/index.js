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
    var marker;
    if(activity_type=='hotel'){
      $('ul.'+activity_type).html('');
      if(agenda.days[agenda.selected].hotel.length>0){
        console.log("hi");
        agenda.days[agenda.selected].hotel[0].marker.setMap(null);
      }
      marker = addToMap(activity_name,activity_type);
      agenda.days[agenda.selected].hotel=[new Activity(activity_name,marker)];
    }else{
      var arr = $('ul.'+activity_type+' span').toArray();
      if(arr.some(function(span){
        return $(span).text() === activity_name;
      })) return;
      if(activity_type === 'restaurant' &&
       agenda.days[agenda.selected][activity_type].length>=3){
        alert("Don't eat so much");
        return;
      }
      marker = addToMap(activity_name,activity_type);
      agenda.days[agenda.selected][activity_type].push(new Activity(activity_name,marker));
    }
    $('ul.'+activity_type).append($(genNewAddition(activity_name,activity_type)));
    zoom();
  });

  $('#add-day').on('click',function(){
    agenda.days.push(new Day());
    $(this).before('<button class="btn btn-circle day-btn day">'+
                   (agenda.days.length)+'</button>');
  });

  $('#agenda-panel .panel-body').on('click','button',function(){
    $(this).parent().remove();
    var type = $(this).attr('data-type');
    var arr = agenda.days[agenda.selected][type];
    var i;
    for(var j=0;j<arr.length;j++){
      if(arr[j].name===$(this).prev().text()){
        i=j;
        break;
      }
    }
    arr[i].marker.setMap(null);
    agenda.days[agenda.selected][type] =
      arr.slice(0,i).concat(arr.slice(i+1));
    zoom();
  });

  $('.day-buttons').on('click','.day',function(){
    clearMarkers();
    $('.day-buttons .current-day').removeClass('current-day');
    $(this).addClass('current-day');
    agenda.selected = Number($(this).text())-1;
    $('#day-title span').text('Day '+(agenda.selected+1));
    updateDay();
    zoom();
  });

  $('#day-title').on('click','button',function(){
    clearMarkers();
    if(agenda.days.length===1){
      for(var key in agenda.days[agenda.selected]){
        $('#agenda-panel .'+key).html('');
      }
      agenda.days=[new Day()];
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

    updateDay();
    zoom();
  });


});

function genNewAddition(name,type){
  return '<div class="itinerary-item"><span class="title">'+name+
    '</span><button class="btn btn-xs btn-danger remove btn-circle" data-type="'+type+'">x</button></div>';
}

function updateDay(){
  var cbFunc= function(html, activity){
    activity.marker.setMap(map);
    return html + genNewAddition(activity.name,key);
  };
  for(var key in agenda.days[agenda.selected]){
    var html=agenda.days[agenda.selected][key].reduce(cbFunc,'');
    $('#agenda-panel .'+key).html(html);
  }
}

function addToMap(name,type){
  var all;
  var icon;
  switch(type){
    case 'hotel':
      all=all_hotels;
      icon = {icon: '/images/lodging_0star.png'};
      break;
    case 'restaurant':
      all=all_restaurants;
      icon = {icon: '/images/restaurant.png'};
      break;
    default:
      all=all_activities;
      icon = {icon: '/images/star-3.png'};
  }
  for(var i=0;i<all.length;i++){
    var activity = all[i];
    if(activity.name===name){
      var tooltips = '<h3>Name: '+activity.name+'</h3>';
      switch(type){
        case 'hotel':
          tooltips+='<p>Stars: '+activity.num_stars+
                    '</br>Amenities: '+activity.amenities.join(', ')+
                    '</p>';
          break;
        case 'restaurant':
          tooltips+='<p>Price: '+activity.price+
                    '</br>Cuisines: '+activity.cuisine.join(', ')+
                    '</p>';
          break;
        default:
          tooltips+='<p>Age Range: '+activity.age_range+'</p>';
      }
      var marker = drawLocation(activity.place[0].location,icon,tooltips);
      var infoWindow = new google.maps.InfoWindow({
        content : marker.content
      });
      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.close();
        infoWindow.open(map,marker);
      });
      return marker;
    }
  }
}

function drawLocation (location, opts, tooltips) {
  if (typeof opts !== 'object') {
    opts = {};
  }
  opts.position = new google.maps.LatLng(location[0], location[1]);
  opts.map = map;
  opts.content = tooltips;
  return new google.maps.Marker(opts);
}

function clearMarkers(){
  var day = agenda.days[agenda.selected];
  for(var key in day){
    day[key].forEach(function(activity){
      activity.marker.setMap(null);
    });
  }
}

function zoom(){
  var day = agenda.days[agenda.selected];
  var bounds = new google.maps.LatLngBounds();
  var markerFound = false;
  var cbFunc = function(activity){
    markerFound = true;
    bounds.extend(activity.marker.position);
  };
  for(var key in day){
    day[key].forEach(cbFunc);
  }
  if(markerFound){
    map.fitBounds(bounds);
  }
}

function Day(){
  this.hotel = [];
  this.restaurant = [];
  this.activity = [];
}

function Activity(name,marker){
  this.name = name;
  this.marker= marker;
}