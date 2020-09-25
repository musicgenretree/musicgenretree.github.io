// https://www.last.fm/api/show/user.getTopArtists
// https://www.last.fm/api/show/artist.getInfo
var seenartists = [];
var artistslist = "<table>";
function userscore(user){
	var artists;
	var text = "test";
	var score = 0;
	var username = user;
	var key = "c2cc54ab2bedd01c955cbf20cea46416";
	var limit = 100;
	var period = "12month"
	console.log(username)
	$.ajax({ 
	    url: "https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=" + username + "&api_key=" + key + "&format=json&limit=" + limit + "&period=" + period, 
	    dataType: 'json', 
	    async: false, 
	    success: function(json){ 
	    	tracks = json.toptracks.track;
	    	// console.log(tracks)
	    } 
	});
	for (var i = 0; i < tracks.length; i++) {
		$.ajax({ 
		    url: 'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + tracks[i].artist.name.replace("&", "%26") + '&api_key=' + key + '&format=json', 
	    	dataType: 'json', 
	    	async: false, 
	    	success: function(json2){
			$('.loading').html(i);
	    	// console.log(i);
	    		var artistname = tracks[i].artist.name;
	    		if(seenartists.length >= 20){
	    			console.log("BREAK");
	    			i = tracks.length;
	    		}
	    		if(!seenartists.includes(artistname) && seenartists.length < 20){
	    			// console.log(i);
	    			var artistlisteners = json2.artist.stats.listeners;
	    			text += artistname + ", " + artistlisteners +"<br>";
	    			score += Math.max(3, Math.log(Math.max(parseInt(artistlisteners), 1))/Math.log(10));
	    			// console.log(score/(i+1));
	    			console.log(artistname+": "+artistlisteners);
	    			artistslist += "<tr><td>" + artistname+"</td><td>"+artistlisteners + "</td></tr>";
	    			seenartists.push(artistname);
	    		}
	    		else{
	    			// console.log("rejected");
	    		}
		    }
		});
	}
	// console.log("length");
	// console.log(seenartists.length);
	score = score/seenartists.length;
	return score;
}
function rawtopercentage(x) {
	var x0 = 5.18
	var k = 3.27
	var M = 2500000
	var a = 1/(1+Math.exp(k*(x-x0)))
	var b = Math.exp(x-Math.log(M))/(1+Math.exp(k*(Math.log(M)-x0)))
	return a - b
}
function clean(x){
	$(".score").html("");
	$.when($(".loading").html("Loading...")).then(
		function(data) {
			var rawscore = userscore(x);
			console.log("Raw Score: " + rawscore);
			var clean1 = "Your obscurity score is: <b>"+(rawtopercentage(rawscore)*100).toFixed(0)+"%</b>";
			var clean2 = "This score is based on the top 20 artists from your 100 most listened tracks during the past 12 months compared to all other users who have taken this test."
			var clean = "<br>" + clean2 + "<br><br>" + clean1 + "<br><br>Your list of considered artists and their number of listeners at last.fm: <br>" + artistslist + "</table>";
			
			var canvas = document.createElement("canvas");
			canvas.width = 480;
			canvas.height = 720;
			var ctx = canvas.getContext('2d');
			ctx.font = "30px Arial";
			ctx.fillText(clean,10,50);
			var img = document.createElement("img");
			img.src=canvas.toDataURL();
			$("#show_img_here").append(img);
			$(".loading").html("");
			
			$(".score").html(clean);
			seenartists = [];
			return clean;
	});
	
}
var input = document.getElementById("username");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
  	event.preventDefault();	
  	clean(document.getElementById("username").value)
  }
});