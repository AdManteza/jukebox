$(document).ready(function() {
 // Hide everything on page load
  
  $("#tableSearchResults, #search, #tablePlaylist, #pictureDiv").hide();

   // Load all songs from database on page load and build initial table 
  $.getJSON({
    url: '/songs',
    success: function(response){
      response.forEach(function(json){
        var row = `<tr id="${json.track_id}">
                   <td class="text-center">${json.track_name}</td>
                   <td class="text-center">${json.track_artist}</<td>
                   <td class="text-center">${json.votes}</td>
                   <td><button class="btn btn-primary up">Vote up</button><button class="btn btn-warning down">Vote down</button></td>
                   </tr>`;
        $('#playlist').append(row)
      })
    }
  });

  addTrackToPlaylist = function(e){
    var track_title = e.getAttribute("data-track-title");
    var track_id = e.getAttribute("data-track-id");
    var artist = e.getAttribute("data-artist");

    var $row = $(`#tablePlaylist tr#${track_id}`);
    console.log($row.length)

    if ($row.length == 0) {
      socket.emit('add track', track_id, track_title, artist);
      disableButton(e);
    } else if ($row.length == 1) {
      trackExisting(e);
    } 
  }

  disableButton = function(e) {
    e.disabled = true;
    e.innerHTML = "Added to playlist";
    e.setAttribute("class", "btn btn-success btn-xs");
  }

  trackExisting = function(e) {
    e.innerHTML = "Already in the playlist!";
    e.setAttribute("class", "btn btn-warning btn-xs");
  }

  $('#tableSearchResults').on('click', '.addButton', function(e){ 
    addTrackToPlaylist(this);
  });
 
  displayResult = function(track) {
    var artist = track.artist.name;

    var addPlaylistButton = `<button data-track-title='${track.title}' data-track-id=${track.id} data-artist='${artist}' class="btn btn-danger btn-xs addButton">Add to Playlist</button>`;

    var resultRow = `<tr id="${track.id}">
                     <td class="text-center">${track.title}</td>
                     <td class="text-center">${artist}</<td>
                     <td class="text-center">
                       <audio controls>
                         <source src="${track.preview}" type="audio/ogg">
                         <source src="${track.preview}" type="audio/mpeg">
                       </audio>
                     </td>
                     <td class="text-center">${addPlaylistButton}</td>
                    </tr>`;
    $('#searchResults').append(resultRow);
  }

 displayTablePlaylist = function(){
   $("#tableSearchResults, #search").hide();
   $("#tablePlaylist").show();
   $("#pictureDiv").hide()
   $("#welcome_h1").hide()
   sort.refresh()
 }

  searchForTracks = function(){

    $("#tableSearchResults, #search").show();
    $("#tablePlaylist").hide();
    $("#pictureDiv").hide()
    $("#welcome_h1").hide()

    $("#search").on("keyup", function(e) {

      var query = $("#search").val();
      var searchTrack = query.split(' ').join('+');

      if(query.length > 0) {
        $.ajax({
          url: `http://api.deezer.com/search/track?q=${searchTrack}&limit=5&output=jsonp`,
          type: 'GET',
          dataType: "jsonp",
          success: function( response ) {

            $("#searchResults").empty();
            $("#tableSearchResults").show();

            response.data.forEach(function(track){
              displayResult(track);
            })
          } 
        });
      } else if (query.length == 0) {
        $("#searchResults").empty();
      };
    });
  }

  $('#tablePlaylist').on('click', '.up', function(){
    var track_id = this.parentElement.parentElement.getAttribute('id')
    socket.emit('upvote', track_id)
    this.disabled = true;
  });

  $('#tablePlaylist').on('click', '.down', function(){    
    var track_id = this.parentElement.parentElement.getAttribute('id')
    var currentVotes = $(`tr#${track_id} td:nth-child(3)`).text()

    if (currentVotes > 0) { 
      socket.emit('downvote', track_id)
      this.disabled = true;
    } else if (currentVotes == 0) {
      this.disabled = true;
    }  
  });

  hideAll = function(){
    $('#tablePlaylist, #tableSearchResults, #autocomplete, #users, #welcome_h1').hide()
    $('#pictureDiv').show()
  }

 $('#mainSearchTab').on('click', searchForTracks)
 $('#mainVoteTab').on('click', displayTablePlaylist)
 $('#mainPictureTab').on('click', hideAll)

 $('#uploadForm').submit(function(e) {
  // $(this).hide()
  e.preventDefault();
  if ( $('#picture_select').get(0).files.length == 0) {
    alert('file cant be empty')
  } else {
    $.ajax({
      url: '/uploads',
      type: 'POST',
      data: new FormData( this ),
      processData: false,
      contentType: false,
      success: function(data){
        console.log('Upload complete!')
      }
    });
  }
 });


});