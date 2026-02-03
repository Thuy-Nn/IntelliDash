CHART_TYPES = {
    "single_value": [3, 3],
    "line": [0, 99],
    "bar": [0, 99],
    "scatter": [0, 1],
    # "box": [0, 99],
    # "histogram": [0, 99],
    # "heatmap": [0, 99],
    "pie": [0, 99],
    # "area": [0, 99]
}

MIN_N_CHARTS = 9
MAX_N_CHARTS = 9

MIN_N_TYPES = 3
MAX_N_TYPES = 99

MAX_DENSITY = 200

# add dash "-" to indicate prefix
CSV_UNIT = {
    "weekly_sales": "$-",
    "temperature": "°F",
    "fuel_price": "USD"
}