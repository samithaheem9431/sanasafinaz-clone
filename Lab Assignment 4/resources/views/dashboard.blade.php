<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <!-- Total Revenue Card -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-blue-500 text-white">
                        <h4 class="text-2xl font-bold mb-2">₨ {{ number_format($totalRevenue ?? 0, 2) }}</h4>
                        <p class="text-white/80">Total Revenue</p>
                    </div>
                </div>

                <!-- Total Products Card -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-green-500 text-white">
                        <h4 class="text-2xl font-bold mb-2">{{ $totalProducts ?? 0 }}</h4>
                        <p class="text-white/80">Total Products</p>
                    </div>
                </div>

                <!-- Low Stock Card -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-yellow-500 text-white">
                        <h4 class="text-2xl font-bold mb-2">{{ $lowStock ?? 0 }}</h4>
                        <p class="text-white/80">Low Stock Items</p>
                    </div>
                </div>

                <!-- Total Orders Card -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-purple-500 text-white">
                        <h4 class="text-2xl font-bold mb-2">{{ $totalOrders ?? 0 }}</h4>
                        <p class="text-white/80">Total Orders</p>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Sales Chart -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Sales Overview</h2>
                    <div style="height: 300px;">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
                <!-- Profit Chart -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4">Profit Analysis</h2>
                    <div style="height: 300px;">
                        <canvas id="profitChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
        const salesData = @json($chartData['sales']);
        const profitData = @json($chartData['profit']);
    </script>
    <script src="{{ asset('js/dashboard-charts.js') }}"></script>
    @endpush
</x-app-layout> 