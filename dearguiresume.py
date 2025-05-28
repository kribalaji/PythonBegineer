from dearpygui.dearpygui import *

# Sample location data for countries, states, and cities
location_data = {
    "India": {
        "TamilNadu": ["Chennai", "Coimbatore", "Madurai"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
    },
    "USA": {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "Texas": ["Houston", "Austin", "Dallas"],
    },
}

def update_states(sender, app_data, user_data):
    country = get_value("Country")
    configure_item("State", items=["Select State"] + list(location_data.get(country, {}).keys()))
    set_value("State", "Select State")
    configure_item("City", items=["Select City"])
    set_value("City", "Select City")

def update_cities(sender, app_data, user_data):
    country = get_value("Country")
    state = get_value("State")
    configure_item("City", items=["Select City"] + location_data.get(country, {}).get(state, []))
    set_value("City", "Select City")

def submit_form(sender, app_data, user_data):
    first_name = get_value("First Name")
    last_name = get_value("Last Name")
    suffix = get_value("Suffix")
    employee_id = get_value("Employee ID")
    mobile_number = get_value("Mobile Number")
    country = get_value("Country")
    state = get_value("State")
    city = get_value("City")

    # Validate required fields
    if not first_name or not last_name or not employee_id or not mobile_number or country == "Select Country" or state == "Select State" or city == "Select City":
        log_error("All fields are required!")
        return

    # Validate mobile number
    if not mobile_number.isdigit() or len(mobile_number) != 10:
        log_error("Invalid mobile number! Must be 10 digits.")
        return

    # Log the resume details
    log_info(f"Resume Details:\nName: {suffix} {first_name} {last_name}\nEmployee ID: {employee_id}\nMobile Number: {mobile_number}\nCountry: {country}\nState: {state}\nCity: {city}")

# Create the GUI
with window("Resume Builder"):
    add_input_text("First Name", label="First Name")
    add_input_text("Last Name", label="Last Name")
    add_combo("Suffix", label="Suffix", items=["Select", "Mr", "Ms", "Mrs"])
    add_input_text("Employee ID", label="Employee ID")
    add_input_text("Mobile Number", label="Mobile Number")
    add_combo("Country", label="Country", items=["Select Country"] + list(location_data.keys()), callback=update_states)
    add_combo("State", label="State", items=["Select State"], callback=update_cities)
    add_combo("City", label="City", items=["Select City"])
    add_button("Submit", callback=submit_form)

start_dearpygui()