// Francisco Ocampo, Geography 575

							// code from main.js

function initialize(){					// initialize function
	cities();
};

function cities(){					// function to create a table with cityPop
							// end code from main.js
	
const cityPop = [					// create array object(s) `cityPop`
	{ 						// sets the properties of the const object; properties of const can be changed
		city: 'Madison',			// cityPop.city = 'Madison' 
		population: 233209			// cityPop.population = 233209
	},
	{
		city: 'Milwaukee',			// cityPop.city = 'Milwaukee'
		population: 594833			// cityPop.population = 594833
	},
	{
		city: 'Green Bay',			// cityPop.city = 'Green Bay'
		population: 104057			// cityPop.population = 104057
	},
	{
		city: 'Superior',			// cityPop.city = 'Superior'
		population: 27244			// cityPop.population = 27244
	}
];							// ends the declaration of const object(s)

							// code from main.js

	//append the table element to the div
	$("#mydiv").append("<table>");

	//append a header row to the table
	$("table").append("<tr>");
	
	//add the "City" and "Population" columns to the header row
	$("tr").append("<th>City</th><th>Population</th>");
	
	//loop to add a new row for each city
    for (var i = 0; i < cityPop.length; i++){
        //assign longer html strings to a variable
        var rowHtml = "<tr><td>" + cityPop[i].city + "</td><td>" + cityPop[i].population + "</td></tr>";
        //add the row's html string to the table
        $("table").append(rowHtml);
    };
	
	addColumns(cityPop);				// calling fuction addColumns(cityPop)
	addEvents();					// calling for the event functions
							// end code from main.js
};

function addColumns(cityPop){				// function, add cityPop columns to table
    
    document.querySelectorAll("tr").forEach(function(row, i){			// each row adds new column to city size category

    	if (i == 0){								// if the header row,

    		row.insertAdjacntHTML('beforeend', '<th>City Size</th>');	// add header for city size
    	} else {

    		var citySize;							// if not header row, add category

    		if (cityPop[i-1].population < 100000){				// if cityPop.population < 100,000, mark as Small
    			citySize = 'Small';

    		} else if (cityPop[i-1].population < 500000){			// if cityPop.population < 500,000, mark as Medium
    			citysize = 'Medium';

    		} else {							// otherwise, mark as Large
    			citySize = 'Large';
    		};

			row.insertAdjacntHTML = '<td' + citySize + '</td>';	// append cell to header row
    	};
    });
};

function addEvents(){								// add global listener events

	document.querySelector("table").addEventListener("mouseover", function(){ // when mousing over the table, set color randomnly between 0-255 (8-bit)
		
		var color = "rgb(";

		for (var i=0; i<3; i++){					// create RGB values

			var random = Math.round(Math.random() * 255);		// create random integer 0 - 255

			color += "random";					// add value to color

			if (i<2){						// if the first, second, or third instance, add `,`
				color += ",";
			
			} else {						// if the fourth instance, add `)` ending the statement
				color += ")";
		};

		document.querySelector("table").color = color;			// assign the color value
	});

	function clickme(){							// alert of click on table

		alert('Hey, you clicked me!');
	};

	document.querySelector("table").addEventListener("click", clickme)	// add click listener to table
};
							// code from main.js
$(document).ready(initialize);				// initialize upon loading page
