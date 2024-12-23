<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Get statistics
        $totalRevenue = Order::sum('total_amount') ?? 0;
        $totalProducts = Product::count() ?? 0;
        $lowStock = Product::where('quantity', '<', 10)->count() ?? 0;
        $totalOrders = Order::count() ?? 0;

        // Chart data (dummy data for now)
        $chartData = [
            'sales' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'values' => [1000, 1500, 2000, 1750, 2500, 3000]
            ],
            'profit' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'values' => [300, 450, 600, 525, 750, 900]
            ]
        ];

        return view('dashboard', compact(
            'totalRevenue',
            'totalProducts',
            'lowStock',
            'totalOrders',
            'chartData'
        ));
    }
} 