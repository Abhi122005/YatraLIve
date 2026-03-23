from math import radians, sin, cos, sqrt, atan2


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the distance in metres between two GPS coordinates using the Haversine formula."""
    R = 6371000  # Earth radius in metres
    phi1, phi2 = radians(lat1), radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lng2 - lng1)
    a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def get_status(distance_m: float, is_delayed: bool) -> str:
    """Determine bus status based on distance from depot and delay flag."""
    if is_delayed:
        return "DELAYED"
    if distance_m <= 100:
        return "ARRIVED"
    if distance_m <= 400:
        return "NEAR"
    if distance_m <= 800:
        return "APPROACHING"
    return "SCHEDULED"


def compute_bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Compute the bearing from point 1 to point 2 in radians."""
    phi1, phi2 = radians(lat1), radians(lat2)
    delta_lambda = radians(lng2 - lng1)
    x = sin(delta_lambda) * cos(phi2)
    y = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(delta_lambda)
    return atan2(x, y)
