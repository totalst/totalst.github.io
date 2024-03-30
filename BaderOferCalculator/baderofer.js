const party_add_button = document.getElementById("party_add_button");
const bader_ofer_input = document.getElementById("bader_ofer_input");
const bader_ofer_output = document.getElementById("bader_ofer_output");
const calculate_results_button = document.getElementById("calculate_results_button");
const results_output_slot = document.getElementById("results_output_slot");
//SAMPLE DATA (TAKEN FROM 2003 ELECTION, HEBREW AND ENGLISH WIKIPEDIA):
const party_names_sample = ["Likud", "Israeli Labor Party", "Shinui", "Shas", "National Union", "Meretz-Yachad", "Mafdal", "United Torah Judaism", "Hadash-Ta'al", "One Nation", "Balad", "Yisrael BaAliyah", "Ra'am", "Ale Yarok", "Herut", "Progressive National Alliance", "The Greens", "Yisrael Aheret", "Ahavat Yisrael", "Tzomet", "Centre Party", "Da'am Workers Party", "Citizen and State", "Man's Rights in the family", "Lahava", "Za'am", "Leader"] //2003 Election Data
const party_popular_vote_sample = [925279, 455183, 386535, 258879, 173973, 164122, 132370, 135087, 93819, 86808, 71299, 67719, 65551, 37855, 36202, 20571, 12833, 7144, 5468, 2023, 1961, 1925, 1566, 1284, 1181, 894, 833] //2003 Election Data
let party_surplus_vote_agreements_sample = { //From Hebrew Wikipedia
	"Israeli Labor Party":"Meretz-Yachad",
	"Shinui":"The Greens",
	"National Union":"Yisrael BaAliyah",
	"Mafdal":"One Nation",
	"Shas":"United Torah Judaism",
	"Hadash-Ta'al":"Balad"
}
//Settings variables
var electoral_treshold = 2; //Percentage of the total vote needed to cross the threshold. For now locked at 2%
var seat_count = 120;

//Variables that change over time and aren't meant to be permanent
var party_count = 0;

party_add_button.addEventListener('click', bader_ofer_add_party);
calculate_results_button.addEventListener('click', bader_ofer_calculate_results);

function bader_ofer_add_party() {
	//Should i just completely change the input method? Itd be easier to have you input the name and votes
	//From a predetermined spot at the top and just add them to the list each time... I'll change that later
	//I also need to add support for Surplus Vote Agreements
	console.log("creating a new party");
	party_count += 1;
	//Creating a new party box
	const partybox = document.createElement("div");
	partybox.setAttribute("id", "partydiv_" + party_count);
	//Creating Attributes within party box
	//Initial Text Blurb
	const partybox_text = document.createElement("p");
	partybox_text.textContent = "Party " + party_count + ":";
	partybox_text.setAttribute("id", "partydiv_text_" + party_count);
	partybox.appendChild(partybox_text);
	//Party Name Input
	const partybox_partyname = document.createElement("input");
	partybox_partyname.setAttribute("placeholder", "Name");
	partybox_partyname.setAttribute("id", "partydiv_partyname_" + party_count);
	partybox.appendChild(partybox_partyname);
	//Popular Vote Input
	const partybox_popularvote = document.createElement("input"); //The issue with this element is 
	//that it needs to be decimal numbers only. I just need to throw up an error of some sort if 
	//there's non-numbers and then figure out the most elegant way to bar typing characters
	partybox_popularvote.setAttribute("placeholder", "Popular Vote");
	partybox_popularvote.setAttribute("id", "partydiv_popularvote_" + party_count);
	partybox.appendChild(partybox_popularvote);
	bader_ofer_input.appendChild(partybox);
}

function bader_ofer_calculate_results() {
	const partynames = [];
	const party_pop_votes = [];
	for (var i = 1; i <= party_count; i++) {
		partyname_for_variable = document.getElementById("partydiv_partyname_" + i).value;
		partynames.push(partyname_for_variable);
		party_popvote_for_variable = document.getElementById("partydiv_popularvote_" + i).value;
		if (!isNaN(party_popvote_for_variable) && party_popvote_for_variable != "") {
			party_pop_votes.push(Number(party_popvote_for_variable)); //If i don't convert it uses strings D:
		}
		else  {
			results_output_slot.innerText = "ERROR: One or more inputs is not a valid number";
			return null;
		}
	}
	console.log(partynames, party_pop_votes);
	bader_ofer_math(partynames, party_pop_votes, null);
	//bader_ofer_math(party_names_sample, party_popular_vote_sample, party_surplus_vote_agreements_sample);
	
}

function bader_ofer_math(party_names, party_popular_vote, party_surplus_vote_agreements) {
	//Step 1: Totalling Valid Votes
	var total_votes = 0;
	for (var i = 0; i < party_names.length; i++) {
		total_votes = total_votes + party_popular_vote[i];
	}
	//Step 2: Setting the number of votes relating to the qualifying treshold.
	var qualifying_vote_threshold = (total_votes * electoral_treshold) / 100;
	//Step 3: Determining the number of valid votes given to qualifying parties
	var qualifying_parties_vote = 0;
	var qualifying_parties = [];
	for (var i = 0; i < party_names.length; i++) {
		if (party_popular_vote[i] > qualifying_vote_threshold){
			qualifying_parties.push(party_names[i]);
			qualifying_parties_vote += party_popular_vote[i];
		}
	}
	//Step 4: Determining Seat Distribution
	//Step a: Determining the number of votes per seat
	var votes_per_seat = qualifying_parties_vote / seat_count;
	//Step b: Determining the number of seats each qualifying list gets
	var seats_per_party = {};
	for (var j = 0; j < party_names.length; j++)
	{
		if (qualifying_parties.includes(party_names[j])) { //If party qualified:
			console.log(party_names[j] + " Has Qualified");
			seats_per_party[party_names[j]] = (party_popular_vote[j] / votes_per_seat) - (party_popular_vote[j] / votes_per_seat % 1); //I cross-referenced with a python script i wrote for this two months ago. I need to round DOWN, not up.
		}
	}
	//Step c + d: surplus votes distribution

	var results_string = "Total Votes: " + total_votes + 
	"\nQualifying Vote Threshold: " + qualifying_vote_threshold +
	"\nQualifying Party Vote Sum: " + qualifying_parties_vote +
	"\nQualifying Parties: " + qualifying_parties +
	"\nVotes Per Seat: " + votes_per_seat + 
	"\nSeats Per Party:\n";
	
	for (const [key, value] of Object.entries(seats_per_party)) {
		results_string = results_string + key + ": " + value + "\n";
	}
	//Actually Writing the results (TEMPORARY IMPLEMENTATION)
	console.log(results_string);
	results_output_slot.innerText = results_string;
	
}

//Stuff to do once initial functionality is finished:
//Convert Arrays into one singular dict to improve readibility and probably functionality