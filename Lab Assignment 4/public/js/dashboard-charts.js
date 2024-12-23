document.addEventListener('DOMContentLoaded', function() {
    try {
        // Sales Chart
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: salesData.labels,
                    datasets: [{
                        label: 'Monthly Sales',
                        data: salesData.values,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Profit Chart
        const profitCtx = document.getElementById('profitChart');
        if (profitCtx) {
            new Chart(profitCtx, {
                type: 'bar',
                data: {
                    labels: profitData.labels,
                    datasets: [{
                        label: 'Monthly Profit',
                        data: profitData.values,
                        backgroundColor: 'rgb(153, 102, 255)',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}); 