const party_add_button = document.getElementById("party_add_button");
const bader_ofer_input = document.getElementById("bader_ofer_input");
const bader_ofer_output = document.getElementById("bader_ofer_output");
const calculate_results_button = document.getElementById("calculate_results_button");
const results_output_slot = document.getElementById("results_output_slot");
//SAMPLE DATA (TAKEN FROM 2003 ELECTION, HEBREW AND ENGLISH WIKIPEDIA):
let election_results_votes_sample = { //2003 Election Data.
	"Likud":925279,
	"Israeli Labor Party":455183,
	"Shinui":386535,
	"Shas":258879,
	"National Union":173973,
	"Meretz-Yachad":164122,
	"Mafdal":132370,
	"United Torah Judaism":135087,
	"Hadash-Ta'al":93819,
	"One Nation":86808,
	"Balad":71299,
	"Yisrael BaAliyah":67719,
	"Ra'am":65551,
	"Ale Yarok":37855,
	"Herut":36202,
	"Progressive National Alliance":20571,
	"The Greens":12833,
	"Yisrael Aheret":7144,
	"Ahavat Yisrael":5468,
	"Tzomet":2023,
	"Centre Party":1961,
	"Da'am Workers Party":1925,
	"Citizen and State":1566,
	"Man's Rights in the family":1284,
	"Lahava":1181,
	"Za'am":894,
	"Leader":833
}
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
	const party_results_votes = {}
	for (var i = 1; i <= party_count; i++) {
		partyname_for_variable = document.getElementById("partydiv_partyname_" + i).value;
		party_popvote_for_variable = document.getElementById("partydiv_popularvote_" + i).value;
		if (!isNaN(party_popvote_for_variable) && party_popvote_for_variable != "") {
			party_results_votes[partyname_for_variable] = Number(party_popvote_for_variable); //If i don't convert it uses strings D:
		}
		else  {
			results_output_slot.innerText = "ERROR: One or more inputs is not a valid number";
			return null;
		}
	}
	console.log(party_results_votes);
	bader_ofer_math(party_results_votes, {});
	//bader_ofer_math(election_results_votes_sample, party_surplus_vote_agreements_sample);
}

function bader_ofer_math(election_votes, party_surplus_agreements)
{
	//Step 1: Totalling Valid Votes
	var total_votes = 0;
	for (const [key, value] of Object.entries(election_votes)) {
		total_votes = total_votes + value;
	}
	//Step 2: Setting the number of votes relating to the qualifying treshold.
	var qualifying_vote_threshold = (total_votes * electoral_treshold) / 100;
	//Step 3: Determining the number of valid votes given to qualifying parties
	var qualifying_parties_vote = 0;
	var qualifying_parties = [];
	for (const [name, votes] of Object.entries(election_votes)) {
		if (votes > qualifying_vote_threshold) {
			qualifying_parties.push(name);
			qualifying_parties_vote += votes;
		}
	}
	//Step 4: Determining Seat Distribution
	//Step a: Determining the number of votes per seat
	var votes_per_seat = qualifying_parties_vote / seat_count;
	//Step b: Determining the number of seats each qualifying list gets
	var seats_per_party = {};
	assigned_seats = 0;
	for (const [name, votes] of Object.entries(election_votes)) {
		if (qualifying_parties.includes(name)) { //If party qualified:
			console.log(name + " Has Qualified");
			seats_per_party[name] = (votes / votes_per_seat) - (votes / votes_per_seat % 1); //I cross-referenced with a python script i wrote for this two months ago. I need to round DOWN, not up.
			assigned_seats += seats_per_party[name];
		}
	}
	console.log("TEMPORARY LOG", assigned_seats, seats_per_party);
	//steps c and d: assigning the remaining seats through surplus vote agreements
	while (assigned_seats < seat_count) {
		seats_per_party = assign_surplus_seat(seats_per_party, election_votes, party_surplus_agreements);
		assigned_seats += 1;
	}
	//console.log("FINAL RESULTS", seats_per_party);
	console.log("TEMPORARY LOG AFTER", assigned_seats, seats_per_party);
	var results_string = "Total Votes: " + total_votes + 
	"\nQualifying Vote Threshold: " + qualifying_vote_threshold +
	"\nQualifying Party Vote Sum: " + qualifying_parties_vote +
	"\nQualifying Parties: " + qualifying_parties +
	"\nVotes Per Seat: " + votes_per_seat + 
	"\nSeats Per Party:\n";
	
	for (const [key, value] of Object.entries(seats_per_party)) {
		results_string = results_string + key + ": " + value + "\n";
	}
	
	console.log(results_string);
	results_output_slot.innerText = results_string;
}

function assign_surplus_seat(seats_per_party, election_votes, party_spvs)
{
	spv_index = {}
	//Determining the SPV Index
	for (const [name, seats] of Object.entries(seats_per_party)) {
		//console.log("GOING OVER", name);
		party_junior_spv_partner = false;
		test_name = name;
		for (const [senior_name, junior_name] of Object.entries(party_spvs)) {
			if (name == junior_name) {
				party_junior_spv_partner = true;
			}
		}
		//console.log("PARTY JUNIOR PARTNER:", party_junior_spv_partner);
		if (party_junior_spv_partner) {}
		else {
			//console.log("JUNIOR PARTY SEATS", seats_per_party[party_spvs[name]])
			if (party_spvs[name] && seats_per_party[party_spvs[name]])
			{
				spv_index[name] = (election_votes[name] + election_votes[party_spvs[name]]) / (seats_per_party[name] + seats_per_party[party_spvs[name]] + 1);
			}
			else 
			{
				spv_index[name] = election_votes[name] / (seats_per_party[name] + 1);
			}
		}
	}
	//Assigning the extra seat to the highest SPV Index
	max_spv_index = ["none", 0];
	for (const [list, index] of Object.entries(spv_index))
	{
		if (index > max_spv_index[1])
		{
			max_spv_index[0] = list;
			max_spv_index[1] = index;
		}
	}
	max_spv_name = max_spv_index[0]
	if (party_spvs[max_spv_name])
	{
		senior_spv_index = election_votes[max_spv_name] / (seats_per_party[max_spv_name] + 1);
		junior_spv_index = election_votes[party_spvs[max_spv_name]] / (seats_per_party[party_spvs[max_spv_name]] + 1);
		if (junior_spv_index > senior_spv_index) {
			seats_per_party[party_spvs[max_spv_name]] += 1;
		}
		else {
			seats_per_party[max_spv_name] += 1;
		}
	}
	else
	{
		seats_per_party[max_spv_name] += 1;
	}
	return seats_per_party;
}