// Initial mock buses starting around Ernakulam Depot (approx 9.9816, 76.2999)
export const initialMockBuses = [
    {
        id: 1,
        bus_number: 'KL-15-A-1234',
        bus_type: 'SUPER FAST',
        route: 'VIA ALUVA',
        destination: 'KOZHIKODE',
        status: 'APPROACHING',
        latitude: 9.9850,
        longitude: 76.3030, // ~0.5 km
        is_delayed: false
    },
    {
        id: 2,
        bus_number: 'KL-15-B-5678',
        bus_type: 'ORDINARY',
        route: 'VIA KOTTAYAM',
        destination: 'TRIVANDRUM',
        status: 'DELAYED',
        latitude: 9.9650,
        longitude: 76.2850, // ~2.0 km
        is_delayed: true
    },
    {
        id: 3,
        bus_number: 'KL-07-C-9012',
        bus_type: 'DELUXE',
        route: 'VIA PERUMBAVOOR',
        destination: 'MUVATTUPUZHA',
        status: 'NEAR',
        latitude: 9.9810,
        longitude: 76.3310, // ~3.5 km
        is_delayed: false
    },
    {
        id: 4,
        bus_number: 'KL-15-D-3456',
        bus_type: 'FAST PASSENGER',
        route: 'VIA ALAPPUZHA',
        destination: 'KOLLAM',
        status: 'DELAYED',
        latitude: 9.9360,
        longitude: 76.2990, // ~5.0 km
        is_delayed: true // This one starts delayed
    },
    {
        id: 5,
        bus_number: 'KL-39-E-7890',
        bus_type: 'AC LOW FLOOR',
        route: 'VIA THRISSUR',
        destination: 'PALAKKAD',
        status: 'SCHEDULED',
        latitude: 10.0400,
        longitude: 76.2990, // ~6.5 km
        is_delayed: false
    },
    {
        id: 6,
        bus_number: 'KL-24-F-4567',
        bus_type: 'SLEEPER AC',
        route: 'VIA ANGAMALY',
        destination: 'KANNUR',
        status: 'DELAYED',
        latitude: 10.1200,
        longitude: 76.3500, // ~8.0 km
        is_delayed: true
    },
    {
        id: 7,
        bus_number: 'KL-06-G-8901',
        bus_type: 'EXPRESS',
        route: 'VIA PARAVOOR',
        destination: 'IDUKKI',
        status: 'SCHEDULED',
        latitude: 9.8500,
        longitude: 76.2000, // ~12.0 km
        is_delayed: false
    }
];
