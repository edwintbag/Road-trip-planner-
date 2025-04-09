var map = L.map('map').setView([37.7749, -122.4194], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);var routeControl;

    async function getCoordinates(address) {
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        let data = await response.json();
        return data.length > 0 ? [data[0].lat, data[0].lon] : null;
    }

    async function planTrip() {
        let startLocation = document.getElementById('startLocation').value;
        let destination = document.getElementById('destination').value;
        
        if (!startLocation || !destination) {
            alert("Please enter both start location and destination.");
            return;
        }
        
        let startCoords = await getCoordinates(startLocation);
        let endCoords = await getCoordinates(destination);
        
        if (!startCoords || !endCoords) {
            alert("Could not find coordinates for the given locations.");
            return;
        }
        
        if (routeControl) {
            map.removeControl(routeControl);
        }
        
        routeControl = L.Routing.control({
            waypoints: [
                L.latLng(startCoords[0], startCoords[1]),
                L.latLng(endCoords[0], endCoords[1])
            ],
            routeWhileDragging: true,
            showAlternatives: true
        }).addTo(map);
        
        routeControl.on('routesfound', function(e) {
            let route = e.routes[0];
            let distance = (route.summary.totalDistance / 1000).toFixed(2);
            let time = (route.summary.totalTime / 60).toFixed(2);
            document.getElementById('tripDetails').innerText = `Distance: ${distance} km | Travel Time: ${time} minutes`;
        });
    }

    function saveTrip() {
        let startLocation = document.getElementById('startLocation').value;
        let destination = document.getElementById('destination').value;
        
        if (!startLocation || !destination) {
            alert("Please enter a trip before saving.");
            return;
        }
        
        let trips = JSON.parse(localStorage.getItem('savedTrips')) || [];
        trips.push({ start: startLocation, destination: destination });
        localStorage.setItem('savedTrips', JSON.stringify(trips));
        alert("Trip saved successfully!");
    }

    $(document).ready(function() {
        $("#startLocation, #destination").on("input", function() {
            let query = $(this).val();
            if (query.length > 2) {
                $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, function(data) {
                    let suggestions = data.map(loc => loc.display_name);
                    $("#startLocation, #destination").autocomplete({ source: suggestions });
                });
            }
        });
    });
    
    
    
    const form = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalSpent = document.getElementById('total-spent');
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    function renderExpenses() {
      expenseList.innerHTML = '';
      let total = 0;
      expenses.forEach((expense, index) => {
        total += Number(expense.amount);
        const row = `<tr>
          <td>${index + 1}</td>
          <td>${expense.name}</td>
          <td>$${expense.amount}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteExpense(${index})">Delete</button></td>
        </tr>`;
        expenseList.insertAdjacentHTML('beforeend', row);
      });
      totalSpent.textContent = total;
    }

    function deleteExpense(index) {
      expenses.splice(index, 1);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      renderExpenses();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('expense-name').value;
      const amount = document.getElementById('expense-amount').value;
      if (name && amount) {
        expenses.push({ name, amount });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        form.reset();
        renderExpenses();
      }
    });

    renderExpenses();
